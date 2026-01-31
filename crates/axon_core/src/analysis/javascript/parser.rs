use log::debug;
use oxc_allocator::Allocator;
use oxc_ast::ast::{
    BindingPatternKind, CallExpression, Declaration, Expression,
    ImportDeclaration, ExportAllDeclaration, ExportNamedDeclaration, 
    ModuleExportName 
};
use oxc_ast::visit::{walk, Visit};
use oxc_parser::Parser;
use oxc_span::SourceType;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use crate::core::{FileSymbols, ImportRequest};

// ==========================================
// 1. PUBLIC API
// ==========================================

pub fn analyze_source(
    source_text: &str,
    path: &PathBuf,
) -> (Vec<ImportRequest>, HashMap<String, String>, Vec<String>, FileSymbols) {
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(path).unwrap_or_default();
    
    let ret = Parser::new(&allocator, source_text, source_type).parse();

    // Pass 1: Imports & Re-Exports
    let mut import_visitor = ImportVisitor {
        imports: vec![],
        exports: HashMap::new(),
        star_exports: Vec::new(), 
        path: path.clone(), 
    };
    import_visitor.visit_program(&ret.program);

    // Pass 2: Symbols
    let mut symbol_visitor = SymbolScanner {
        definitions: HashSet::new(),
        calls: Vec::new(),
    };
    symbol_visitor.visit_program(&ret.program);

    let symbols = FileSymbols {
        path: path.clone(),
        definitions: symbol_visitor.definitions,
        calls: symbol_visitor.calls,
    };

    (import_visitor.imports, import_visitor.exports, import_visitor.star_exports, symbols)
}

// ==========================================
// 2. VISITORS
// ==========================================

struct ImportVisitor {
    imports: Vec<ImportRequest>,
    exports: HashMap<String, String>,
    star_exports: Vec<String>, 
    path: PathBuf,
}

impl<'a> Visit<'a> for ImportVisitor {
    fn visit_import_declaration(&mut self, decl: &ImportDeclaration<'a>) {
        let source = decl.source.value.as_str(); 
        debug!("   [Import] found '{}' in {:?}", source, self.path);

        let mut specifiers = Vec::new();
        if let Some(specs) = &decl.specifiers {
            for spec in specs {
                let name = match spec {
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(s) => 
                        s.local.name.to_string(),
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => 
                        s.local.name.to_string(),
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => 
                        s.local.name.to_string(),
                };
                specifiers.push(name);
            }
        }

        self.imports.push(ImportRequest {
            source: source.to_string(),
            specifiers,
        });
        
        walk::walk_import_declaration(self, decl);
    }

    fn visit_export_all_declaration(&mut self, decl: &ExportAllDeclaration<'a>) {
        let source = decl.source.value.as_str();
        debug!("   [Barrel] Found 'export * from {}' in {:?}", source, self.path.file_name().unwrap());

        self.imports.push(ImportRequest {
            source: source.to_string(),
            specifiers: vec!["*".to_string()],
        });

        self.star_exports.push(source.to_string());

        walk::walk_export_all_declaration(self, decl);
    }

    fn visit_export_named_declaration(&mut self, decl: &ExportNamedDeclaration<'a>) {
        if let Some(source) = &decl.source {
            let source_path = source.value.as_str();
            debug!("   [Re-Export] Found 'export ... from {}' in {:?}", source_path, self.path.file_name().unwrap());

            let mut specifiers = Vec::new();
            
            for spec in &decl.specifiers {
                let name = match &spec.exported {
                    ModuleExportName::Identifier(id) => id.name.to_string(),
                    ModuleExportName::StringLiteral(lit) => lit.value.to_string(),
                };
                specifiers.push(name.clone());
                
                // 🆕 Capture specifically for resolution map: "Button" -> "./Button"
                self.exports.insert(name, source_path.to_string());
            }

            self.imports.push(ImportRequest {
                source: source_path.to_string(),
                specifiers,
            });
        }
        walk::walk_export_named_declaration(self, decl);
    }
}

struct SymbolScanner {
    definitions: HashSet<String>,
    calls: Vec<String>,
}

impl<'a> Visit<'a> for SymbolScanner {
    fn visit_declaration(&mut self, it: &Declaration<'a>) {
        match it {
            Declaration::FunctionDeclaration(func) => {
                if let Some(id) = &func.id {
                    self.definitions.insert(id.name.to_string());
                }
            }
            Declaration::VariableDeclaration(var) => {
                for decl in &var.declarations {
                    if let BindingPatternKind::BindingIdentifier(id) = &decl.id.kind {
                        self.definitions.insert(id.name.to_string());
                    }
                }
            }
            Declaration::ClassDeclaration(cls) => {
                if let Some(id) = &cls.id {
                    self.definitions.insert(id.name.to_string());
                }
            }
            _ => {}
        }
        walk::walk_declaration(self, it);
    }

    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        match &it.callee {
            Expression::Identifier(id) => {
                self.calls.push(id.name.to_string());
            }
            Expression::StaticMemberExpression(member) => {
                self.calls.push(member.property.name.to_string());
            }
            _ => {}
        }
        walk::walk_call_expression(self, it);
    }
}