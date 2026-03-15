use crate::tree::node::{
    AxonFile, file::{
        state::Outlined,
        symbol::{Export, Symbol, SymbolKind, UnresolvedReference},
    }
};

impl Outlined {
    pub fn find_symbol(&self, name: &str) -> Option<&Symbol> {
        self.symbols.iter().find(|s| s.name == name)
    }

    pub fn symbols_of_kind(&self, kind: SymbolKind) -> impl Iterator<Item = &Symbol> {
        self.symbols.iter().filter(move |s| s.kind == kind)
    }
}

impl AxonFile<Outlined> {
    pub fn content(&self) -> &str {
        &self.state.content
    }

    pub fn line_count(&self) -> usize {
        self.state.content.lines().count()
    }

    pub fn symbols(&self) -> &[Symbol] {
        &self.state.symbols
    }

    pub fn imports(&self) -> &[UnresolvedReference] {
        &self.state.imports
    }

    pub fn exports(&self) -> &[Export] {
        &self.state.exports
    }

    pub fn find_symbol(&self, name: &str) -> Option<&Symbol> {
        self.state.find_symbol(name)
    }

    pub fn symbols_of_kind(&self, kind: SymbolKind) -> impl Iterator<Item = &Symbol> {
        self.state.symbols_of_kind(kind)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ids::{DirectoryId, FileId, SymbolId};
    use crate::tree::node::file::symbol::{Symbol, SymbolKind, TextRange};
    use std::sync::Arc;
    use oxc_span::SourceType;

    #[test]
    fn test_outlined_delegation() {
        let content = Arc::from("const x = 10;");
        let sym = Symbol::new(
            SymbolId::from(0),
            SymbolKind::Variable,
            "x".to_string().into(),
            TextRange::new(0, 13).unwrap(),
            TextRange::new(6, 7).unwrap(),
        ).unwrap();

        let file = AxonFile::transition(
            FileId(1),
            "test.js".into(),
            DirectoryId(0),
            SourceType::default(),
            Outlined {
                content,
                symbols: vec![sym],
                imports: vec![],
                exports: vec![],
            },
        );

        assert_eq!(file.find_symbol("x").unwrap().kind, SymbolKind::Variable);
        assert_eq!(file.line_count(), 1);
    }
}