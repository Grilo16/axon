pub mod visitor;

use oxc_allocator::Allocator;
use oxc_ast::Visit;
use oxc_parser::Parser;
use oxc_span::SourceType;
use visitor::SymbolVisitor;

use crate::error::{AxonResult};
use crate::parser::{AxonParser, ParseOutput};

pub struct JsTsParser;

impl AxonParser for JsTsParser {
    fn parse(&self, source: &str, source_type: SourceType) -> AxonResult<ParseOutput> {
        let allocator = Allocator::default();
        let parser_ret = Parser::new(&allocator, source, source_type).parse();

        if !parser_ret.errors.is_empty() {
            tracing::warn!(
                "⚠️ Oxc parser encountered syntax errors, but will attempt to recover. Errors: {:?}", 
                parser_ret.errors
            );
        }

        let mut visitor = SymbolVisitor::new(source, &parser_ret.trivias);
        visitor.visit_program(&parser_ret.program);

        Ok(ParseOutput {
            symbols: visitor.symbols,
            imports: visitor.imports,
            exports: visitor.exports,
        })
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use oxc_span::SourceType;

    #[test]
    fn test_redux_slice_body_capture() {
        let source = "const workspacesSlice = createSlice({ name: 'workspaces', initialState });";
        let parser = JsTsParser;

        let output = parser.parse(source, SourceType::default()).unwrap();

        let sym = output
            .symbols
            .iter()
            .find(|s| s.name == "workspacesSlice")
            .unwrap();
        assert!(sym.body_range.is_some());

        let body_text = &source[sym.body_range.unwrap().as_range()];
        assert!(body_text.contains("createSlice"));
    }

    #[test]
fn test_jsdoc_attachment() {
    let source = "/** This is a test function */\nfunction test() {}";
    let parser = JsTsParser;
    let output = parser.parse(source, SourceType::default()).unwrap();

    let doc = output.symbols[0].docstring.as_deref();
    
    // OXC MultiLine trivia span for "/** text */" 
    // results in the inner content: "* This is a test function "
    assert_eq!(doc, Some("* This is a test function "));
}
    #[test]
    fn test_import_analysis() {
        let source = "import { useState, useEffect } from 'react';";
        let parser = JsTsParser;
        let output = parser.parse(source, SourceType::default()).unwrap();

        assert_eq!(output.imports.len(), 1);
        assert_eq!(output.imports[0].raw_path, "react");
        use compact_str::CompactString;
        assert!(output.imports[0].symbols.contains(&CompactString::from("useState")));
    }

    #[test]
fn test_variable_body_capture() {
    let source = "const myConfig = { a: 1, b: 2 };";
    let parser = JsTsParser;
    let output = parser.parse(source, SourceType::default()).unwrap();

    let sym = output.symbols.iter().find(|s| s.name == "myConfig").unwrap();
    
    // This would have been None before! Now it's the { object }
    assert!(sym.body_range.is_some());
    let body_text = &source[sym.body_range.unwrap().as_range()];
    assert_eq!(body_text, "{ a: 1, b: 2 }");
}
}
