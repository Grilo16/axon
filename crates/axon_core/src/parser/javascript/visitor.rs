use oxc_ast::ast;
use oxc_ast::visit::walk;
use oxc_ast::Visit;
use oxc_span::{GetSpan, Span};
use oxc_syntax::scope::ScopeFlags;

use crate::ids::SymbolId;
use crate::tree::node::file::symbol::{Export, Symbol, SymbolKind, TextRange, UnresolvedReference};

pub struct SymbolVisitor<'a> {
    pub symbols: Vec<Symbol>,
    pub imports: Vec<UnresolvedReference>,
    pub exports: Vec<Export>,
    source: &'a str,
    trivias: &'a oxc_ast::Trivias,
    scope_stack: Vec<SymbolId>,
}

impl<'a> SymbolVisitor<'a> {
    pub fn new(source: &'a str, trivias: &'a oxc_ast::Trivias) -> Self {
        Self {
            symbols: Vec::new(),
            imports: Vec::new(),
            exports: Vec::new(),
            source,
            trivias,
            scope_stack: Vec::new(),
        }
    }

    fn next_id(&self) -> SymbolId {
        SymbolId::from(self.symbols.len() as u32)
    }

    fn map_range(&self, span: Span) -> TextRange {
        TextRange::new(span.start, span.end).expect("Invalid OXC span")
    }

    fn capture_docstring(&self, span: Span) -> Option<String> {
        self.trivias
            .comments()
            .filter(|(_, comment_span)| {
                comment_span.end <= span.start && (span.start - comment_span.end) <= 20
            })
            .last()
            .map(|(_, comment_span)| {
                self.source[comment_span.start as usize..comment_span.end as usize].to_string()
            })
    }


    

    fn push_symbol(
        &mut self,
        kind: SymbolKind,
        name: String,
        full_span: Span,
        name_span: Span,
        body: Option<Span>,
    ) -> SymbolId {
        let id = self.next_id();
        let range = self.map_range(full_span);
        let selection_range = self.map_range(name_span);
        let parent_id = self.scope_stack.last().copied();

        let mut symbol = Symbol::new(id, kind, name, range, selection_range).expect("Range error");
        
        symbol.parent = parent_id;

        if let Some(b) = body {
            symbol = symbol
                .with_body(self.map_range(b))
                .expect("Body range error");
        }
        symbol = symbol.with_doc(self.capture_docstring(full_span));

        // NESTING LOGIC: If there's a parent in the stack, add this ID to its children
        if let Some(&parent_id) = self.scope_stack.last() {
            if let Some(parent_symbol) = self.symbols.iter_mut().find(|s| s.id == parent_id) {
                parent_symbol.children.push(id);
            }
        }

        self.symbols.push(symbol);
        id
    }
}

impl<'a> Visit<'a> for SymbolVisitor<'a> {
    fn visit_object_property(&mut self, prop: &ast::ObjectProperty<'a>) {
        // We only care about properties with clear names (not computed ones like [someVar])
        if let Some(name) = prop.key.static_name() {
            let name_span = prop.key.span();

            // The "body" of a property is its value (the part after the colon)
            let body_span = Some(prop.value.span());

            // 1. Push Property Symbol
            let id = self.push_symbol(
                SymbolKind::Property,
                name.to_string(),
                prop.span,
                name_span,
                body_span,
            );

            self.scope_stack.push(id);
            walk::walk_object_property(self, prop);
            self.scope_stack.pop();
        } else {
            walk::walk_object_property(self, prop);
        }
    }

    fn visit_ts_interface_declaration(&mut self, decl: &ast::TSInterfaceDeclaration<'a>) {
        // 1. Push Interface
        let id = self.push_symbol(
            SymbolKind::Interface,
            decl.id.name.to_string(),
            decl.span,
            decl.id.span,
            Some(decl.body.span),
        );
        self.scope_stack.push(id);

        walk::walk_ts_interface_declaration(self, decl);

        // 2. Pop Interface
        self.scope_stack.pop();
    }

    fn visit_variable_declaration(&mut self, decl: &ast::VariableDeclaration<'a>) {
        for declarator in &decl.declarations {
            if let ast::BindingPatternKind::BindingIdentifier(id) = &declarator.id.kind {
                let mut kind = SymbolKind::Variable;
                let mut body = None;

                if let Some(init) = &declarator.init {
                    // 1. Determine Kind (Function vs Variable)
                    match init {
                        ast::Expression::ArrowFunctionExpression(_)
                        | ast::Expression::FunctionExpression(_) => {
                            kind = SymbolKind::Function;
                        }
                        _ => {
                            kind = SymbolKind::Variable;
                        }
                    }

                    // 2. CAPTURE THE BODY:
                    // For variables, the "body" is the entire value assigned to it.
                    // For functions, we could choose to capture just the { block },
                    // but capturing the whole init is more consistent for redaction.
                    body = Some(init.span());
                }

                self.push_symbol(kind, id.name.to_string(), declarator.span, id.span, body);
            }
        }
        walk::walk_variable_declaration(self, decl);
    }

    fn visit_function(&mut self, func: &ast::Function<'a>, flags: Option<ScopeFlags>) {
        if let Some(id_node) = &func.id {
            let id = self.push_symbol(
                SymbolKind::Function,
                id_node.name.to_string(),
                func.span,
                id_node.span,
                func.body.as_ref().map(|b| b.span),
            );
            self.scope_stack.push(id);
            walk::walk_function(self, func, flags);
            self.scope_stack.pop();
        } else {
            walk::walk_function(self, func, flags);
        }
    }

    fn visit_class(&mut self, class: &ast::Class<'a>) {
        if let Some(name) = &class.id {
            // 1. Push Class
            let id = self.push_symbol(
                SymbolKind::Class,
                name.name.to_string(),
                class.span,
                name.span,
                None,
            );
            self.scope_stack.push(id);

            // 2. Walk internal members (methods, properties)
            walk::walk_class(self, class);

            // 3. Pop Class
            self.scope_stack.pop();
        } else {
            walk::walk_class(self, class);
        }
    }
   
    fn visit_import_declaration(&mut self, decl: &ast::ImportDeclaration<'a>) {

        let raw_path = decl.source.value.to_string();
        let mut symbols = Vec::new();

        if let Some(specifiers) = &decl.specifiers {
            for specifier in specifiers {
                match specifier {
                    ast::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                        symbols.push(s.imported.name().to_string())
                    }
                    ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(_) => {
                        symbols.push("default".to_string())
                    }
                    ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(_) => {
                        symbols.push("*".to_string())
                    }
                }
            }
        }

        self.imports.push(UnresolvedReference {
            raw_path,
            symbols,
            is_type_only: decl.import_kind.is_type(),
        });
        walk::walk_import_declaration(self, decl);
    }

    // Catches: export * from './module';
    fn visit_export_all_declaration(&mut self, decl: &ast::ExportAllDeclaration<'a>) {
        let raw_path = decl.source.value.to_string();
        
        self.exports.push(Export {
            name: "*".to_string(),
            is_reexport: true,
            source: Some(raw_path),
        });
        
        walk::walk_export_all_declaration(self, decl);
    }

    // Catches: export { x } from './module'; OR export const x = 1;
    fn visit_export_named_declaration(&mut self, decl: &ast::ExportNamedDeclaration<'a>) {
        let source_path = decl.source.as_ref().map(|s| s.value.to_string());
        let is_reexport = source_path.is_some();

        for specifier in &decl.specifiers {
            // OXC's ExportSpecifier is a struct, so we can access .exported directly!
            let export_name = specifier.exported.name().to_string();

            self.exports.push(Export {
                name: export_name,
                is_reexport,
                source: source_path.clone(),
            });
        }
        
        walk::walk_export_named_declaration(self, decl);
    }

    fn visit_ts_type_alias_declaration(&mut self, decl: &ast::TSTypeAliasDeclaration<'a>) {
        let id = self.push_symbol(
            SymbolKind::TypeAlias,
            decl.id.name.to_string(),
            decl.span,
            decl.id.span,
            Some(decl.type_annotation.span()),
        );
        
        self.scope_stack.push(id);
        walk::walk_ts_type_alias_declaration(self, decl);
        self.scope_stack.pop();
    }
    
}
