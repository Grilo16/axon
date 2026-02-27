// --- FILE: graph/test_utils.rs ---
use crate::ids::{DirectoryId, FileId, SymbolId};
use crate::path::RelativeAxonPath;
use crate::tree::node::file::state::Outlined;
use crate::tree::node::file::symbol::{
    Export, Symbol, SymbolKind, TextRange, UnresolvedReference,
};
use crate::tree::node::AxonFile;
use crate::tree::options::AxonScanOptions;
use crate::tree::state::{Analyzed, TreeRegistry};
use crate::tree::{AxonTree, AxonTreeCore};
use oxc_span::SourceType;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::Arc;

pub struct MockTreeBuilder {
    files: Vec<AxonFile<Outlined>>,
    file_by_path: HashMap<RelativeAxonPath, FileId>,
}

impl MockTreeBuilder {
    pub fn new() -> Self {
        Self {
            files: Vec::new(),
            file_by_path: HashMap::new(),
        }
    }

    pub fn add_file(
        &mut self,
        path: &str,
        symbols: Vec<&str>,
        imports: Vec<(&str, Vec<&str>)>,
        exports: Vec<(&str, Option<&str>)>,
    ) -> FileId {
        let id = FileId::from(self.files.len() as u32);
        let rel_path = RelativeAxonPath::from(path);

        let mock_symbols = symbols
            .into_iter()
            .enumerate()
            .map(|(i, name)| {
                Symbol::new(
                    SymbolId::from(i as u32),
                    SymbolKind::Variable,
                    name.to_string(),
                    TextRange::new(0, 1).unwrap(),
                    TextRange::new(0, 1).unwrap(),
                )
                .unwrap()
            })
            .collect();

        let mock_imports = imports
            .into_iter()
            .map(|(p, syms)| UnresolvedReference {
                raw_path: p.to_string(),
                symbols: syms.into_iter().map(|s| s.to_string()).collect(),
                is_type_only: false,
            })
            .collect();

        let mock_exports = exports
            .into_iter()
            .map(|(name, source)| Export {
                name: name.to_string(),
                is_reexport: source.is_some(),
                source: source.map(|s| s.to_string()),
            })
            .collect();

        let file = AxonFile::transition(
            id,
            rel_path.clone(),
            DirectoryId(0),
            SourceType::default(),
            Outlined {
                content: Arc::from(""),
                symbols: mock_symbols,
                imports: mock_imports,
                exports: mock_exports,
            },
        );

        self.file_by_path.insert(rel_path, id);
        self.files.push(file);
        id
    }

    pub fn build(self) -> AxonTree<Analyzed> {
        let registry = TreeRegistry {
            root_dir_id: DirectoryId(0),
            directories: vec![],
            files: self.files,
            dir_by_path: HashMap::new(),
            file_by_path: self.file_by_path,
        };

        AxonTree {
            core: AxonTreeCore {
                root: PathBuf::from("/mock"),
                scan: AxonScanOptions {
                    allowed_extensions: HashSet::from(["ts".to_string(), "tsx".to_string()]),
                    ..Default::default()
                },
            },
            state: Analyzed(registry),
        }
    }
}