use crate::tree::{
    node::file::symbol::Symbol,
    state::{Analyzed, RegistryAccess},
    AxonTree,
};

impl AxonTree<Analyzed> {
    /// Returns the total number of symbols found across the entire project.
    /// Note: This uses .files() which is available via Deref + RegistryAccess!
    pub fn total_symbol_count(&self) -> usize {
        self.files().iter().map(|f| f.symbols().len()).sum()
    }

    /// Global search for a symbol by name across the entire project.
    /// Returns a list of (FileId, Symbol) pairs.
    pub fn find_symbols_by_name<'a>(
        &'a self,
        name: &'a str,
    ) -> Vec<(crate::ids::FileId, &'a Symbol)> {
        self.files()
            .iter()
            .flat_map(|f| {
                f.symbols()
                    .iter()
                    .filter(|s| s.name == name)
                    .map(move |s| (f.id(), s))
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ids::{DirectoryId, FileId};
    use crate::path::RelativeAxonPath;
    use crate::tree::node::file::symbol::{ByteOffset, Symbol, SymbolKind, TextRange};
    use crate::tree::node::file::{state::Outlined, AxonFile};
    use crate::tree::state::RegistryAccess; // Important: must be in scope
    use crate::tree::state::TreeRegistry;
    use crate::tree::AxonTreeCore;
    use oxc_span::SourceType;
    use std::collections::{HashMap, HashSet};
    use std::path::PathBuf;
    use std::sync::Arc;

    fn setup_analyzed_tree() -> AxonTree<Analyzed> {
        let file_id = FileId(0);
        let path = RelativeAxonPath::from("src/test.ts");
        let root_id = DirectoryId(0);

        // Create a dummy symbol
        let symbol = Symbol::new(
            crate::ids::SymbolId(0),
            SymbolKind::Function,
            "myFunction".to_string(),
            TextRange {
                start: ByteOffset(0),
                end: ByteOffset(10),
            },
            TextRange {
                start: ByteOffset(0),
                end: ByteOffset(5),
            },
        )
        .unwrap();

        let outlined = Outlined {
            content: Arc::from("function myFunction() {}"),
            symbols: vec![symbol],
            imports: vec![],
            exports: vec![],
        };

        let file = AxonFile::transition(
            file_id,
            path.clone(),
            root_id,
            SourceType::default(),
            outlined,
        );

        let registry = TreeRegistry {
            root_dir_id: root_id,
            directories: vec![],
            files: vec![file],
            dir_by_path: HashMap::new(),
            file_by_path: HashMap::from([(path, file_id)]),
        };

        AxonTree {
            core: AxonTreeCore {
                root: PathBuf::from("/test"),
                scan: crate::tree::options::AxonScanOptions {
                    allowed_extensions: HashSet::from(["ts".to_string()]),
                },
            },
            state: Analyzed(registry),
        }
    }

    #[test]
    fn test_analyzed_ergonomics() {
        let tree = setup_analyzed_tree();

        // 1. Check Deref + RegistryAccess
        assert_eq!(tree.files().len(), 1);
        assert!(tree.file_id_by_path("src/test.ts").is_some());

        // 2. Check Semantic Helpers
        assert_eq!(tree.total_symbol_count(), 1);

        // 3. Check Symbol Search
        let results = tree.find_symbols_by_name("myFunction");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].1.name, "myFunction");
    }
}
