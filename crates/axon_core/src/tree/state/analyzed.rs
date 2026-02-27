use crate::tree::{
    AxonTree, node::file::symbol::Symbol, resolver::ImportResolver, state::{Analyzed, RegistryAccess}
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

    pub fn get_all_file_paths(&self, limit: Option<usize>) -> Vec<String> {
        self.files()
            .iter()
            .map(|f| f.path().as_str().to_string())
            .take(limit.unwrap_or(usize::MAX))
            .collect()
    }

    pub fn get_file_paths_by_dir(
        &self,
        target_path: &str,
        recursive: bool,
        limit: Option<usize>,
    ) -> Option<Vec<String>> {
        let start_dir_id = self.dir_id_by_path(target_path)?;

        // If no limit is provided, use the absolute maximum possible size
        let max_files = limit.unwrap_or(usize::MAX);

        if max_files == 0 {
            return Some(Vec::new()); // Early exit for zero
        }

        match recursive {
            false => {
                let paths = self
                    .directory(start_dir_id)?
                    .child_files()
                    .iter()
                    .filter_map(|&id| self.file(id))
                    .map(|f| f.path().as_str().to_string())
                    .take(max_files)
                    .collect();

                Some(paths)
            }
            true => {
                let mut results = Vec::new();
                let mut stack = vec![start_dir_id];

                while let Some(current_dir_id) = stack.pop() {
                    if let Some(dir) = self.directory(current_dir_id) {
                        let remaining = max_files.saturating_sub(results.len());

                        results.extend(
                            dir.child_files()
                                .iter()
                                .filter_map(|&id| self.file(id))
                                .map(|f| f.path().as_str().to_string())
                                .take(remaining), // 🛡️ Never take more than we need
                        );

                        // If we hit the absolute limit, stop digging deeper!
                        if results.len() >= max_files {
                            break;
                        }

                        // Push all subdirectories onto the stack
                        stack.extend(dir.child_dirs().iter().copied());
                    }
                }

                Some(results)
            }
        }
    }

    pub fn read_file_content(&self, target_path: &str) -> Option<String> {
        let file_id = self.file_id_by_path(target_path)?;
        let file = self.file(file_id)?;

        // Grab the content and convert it to an owned String for Tauri serialization
        Some(file.content().to_string())
    }

    pub fn dependencies_of(&self, file_id: crate::ids::FileId) -> Option<Vec<crate::ids::FileId>> {
        let file = self.file(file_id)?;
        let mut deps = Vec::new();
        let resolver = ImportResolver::new(self);

        for import in file.imports() {
            // Use your brilliant resolve_path logic!
            if let Some(target_id) = resolver.resolve_path(file_id, &import.raw_path) {
                deps.push(target_id);
            }
        }

        Some(deps)
    }

    /// Returns a list of FileIds that import the given file.
    pub fn dependents_of(&self, target_file_id: crate::ids::FileId) -> Option<Vec<crate::ids::FileId>> {
        self.file(target_file_id)?; 

        let mut dependents = Vec::new();

        // Check every file to see if it imports the target
        for file in self.files() {
            if let Some(deps) = self.dependencies_of(file.id()) {
                if deps.contains(&target_file_id) {
                    dependents.push(file.id());
                }
            }
        }

        Some(dependents)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ids::{DirectoryId, FileId};
    use crate::path::RelativeAxonPath;
    use crate::tree::node::file::symbol::{ByteOffset, Symbol, SymbolKind, TextRange};
    use crate::tree::node::file::{state::Outlined, AxonFile};
    use crate::tree::state::RegistryAccess;
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
                    ..Default::default()
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
