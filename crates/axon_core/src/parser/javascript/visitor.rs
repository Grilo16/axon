use compact_str::CompactString;
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
    /// Pre-collected and sorted comment spans for O(log n) docstring lookup via binary search.
    comment_spans: Vec<Span>,
    scope_stack: Vec<SymbolId>,
}

impl<'a> SymbolVisitor<'a> {
    pub fn new(source: &'a str, trivias: &'a oxc_ast::Trivias) -> Self {
        let comment_spans: Vec<Span> = trivias.comments().map(|(_, span)| span).collect();
        Self {
            symbols: Vec::with_capacity(64),
            imports: Vec::with_capacity(16),
            exports: Vec::with_capacity(16),
            source,
            comment_spans,
            scope_stack: Vec::new(),
        }
    }

    fn next_id(&self) -> SymbolId {
        SymbolId::from(self.symbols.len() as u32)
    }

    fn map_range(&self, span: Span) -> TextRange {
        TextRange::new(span.start, span.end).expect("Invalid OXC span")
    }

    /// O(log n) docstring lookup using binary search on pre-sorted comment spans.
    fn capture_docstring(&self, span: Span) -> Option<CompactString> {
        // Find the insertion point where span.start would go — all comments before this index end <= span.start
        let idx = self.comment_spans.partition_point(|cs| cs.end <= span.start);
        if idx == 0 {
            return None;
        }
        let candidate = &self.comment_spans[idx - 1];
        if candidate.end <= span.start && (span.start - candidate.end) <= 20 {
            Some(CompactString::from(&self.source[candidate.start as usize..candidate.end as usize]))
        } else {
            None
        }
    }


    

    fn push_symbol(
        &mut self,
        kind: SymbolKind,
        name: &str,
        full_span: Span,
        name_span: Span,
        body: Option<Span>,
    ) -> SymbolId {
        let id = self.next_id();
        let range = self.map_range(full_span);
        let selection_range = self.map_range(name_span);
        let parent_id = self.scope_stack.last().copied();

        let mut symbol = Symbol::new(id, kind, CompactString::from(name), range, selection_range).expect("Range error");

        symbol.parent = parent_id;

        if let Some(b) = body {
            symbol = symbol
                .with_body(self.map_range(b))
                .expect("Body range error");
        }
        symbol = symbol.with_doc(self.capture_docstring(full_span));

        // NESTING LOGIC: If there's a parent in the stack, add this ID to its children.
        // SymbolId == vec index, so direct indexing is O(1) instead of O(n) linear scan.
        if let Some(&parent_id) = self.scope_stack.last() {
            self.symbols[parent_id.as_usize()].children.push(id);
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
                &name,
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
            &decl.id.name,
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

                self.push_symbol(kind, &id.name, declarator.span, id.span, body);
            }
        }
        walk::walk_variable_declaration(self, decl);
    }

    fn visit_function(&mut self, func: &ast::Function<'a>, flags: Option<ScopeFlags>) {
        if let Some(id_node) = &func.id {
            let id = self.push_symbol(
                SymbolKind::Function,
                &id_node.name,
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
                &name.name,
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

        let mut symbols = Vec::new();

        if let Some(specifiers) = &decl.specifiers {
            for specifier in specifiers {
                match specifier {
                    ast::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                        symbols.push(CompactString::from(s.imported.name().as_str()))
                    }
                    ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(_) => {
                        symbols.push(CompactString::from("default"))
                    }
                    ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(_) => {
                        symbols.push(CompactString::from("*"))
                    }
                }
            }
        }

        self.imports.push(UnresolvedReference {
            raw_path: CompactString::from(decl.source.value.as_str()),
            symbols,
            is_type_only: decl.import_kind.is_type(),
        });
        walk::walk_import_declaration(self, decl);
    }

// Catches dynamic imports: import('./routes/app/discussions')
    fn visit_import_expression(&mut self, expr: &ast::ImportExpression<'a>) {
        if let ast::Expression::StringLiteral(str_lit) = &expr.source {
            self.imports.push(UnresolvedReference {
                raw_path: CompactString::from(str_lit.value.as_str()),
                symbols: vec![CompactString::from("*")],
                is_type_only: false,
            });
        }

        walk::walk_import_expression(self, expr);
    }

    // Catches: export * from './module';
    fn visit_export_all_declaration(&mut self, decl: &ast::ExportAllDeclaration<'a>) {
        self.exports.push(Export {
            name: CompactString::from("*"),
            is_reexport: true,
            source: Some(CompactString::from(decl.source.value.as_str())),
        });
        
        walk::walk_export_all_declaration(self, decl);
    }

    // Catches: export { x } from './module'; OR export const x = 1;
    fn visit_export_named_declaration(&mut self, decl: &ast::ExportNamedDeclaration<'a>) {
        let source_path = decl
            .source
            .as_ref()
            .map(|s| CompactString::from(s.value.as_str()));
        let is_reexport = source_path.is_some();

        for specifier in &decl.specifiers {
            self.exports.push(Export {
                name: CompactString::from(specifier.exported.name().as_str()),
                is_reexport,
                source: source_path.clone(),
            });
        }
        
        walk::walk_export_named_declaration(self, decl);
    }

    fn visit_ts_type_alias_declaration(&mut self, decl: &ast::TSTypeAliasDeclaration<'a>) {
        let id = self.push_symbol(
            SymbolKind::TypeAlias,
            &decl.id.name,
            decl.span,
            decl.id.span,
            Some(decl.type_annotation.span()),
        );
        
        self.scope_stack.push(id);
        walk::walk_ts_type_alias_declaration(self, decl);
        self.scope_stack.pop();
    }
    
}
