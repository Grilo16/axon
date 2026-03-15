pub mod builder;

#[cfg(test)]
pub(crate) mod test_utils;

use crate::ids::{FileId, SymbolId};
use crate::tree::node::file::symbol::Symbol;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use crate::spool::AxonSpool;
use builder::GraphBuilder;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

// ============================================================================
// 1. DATA TRANSFER OBJECTS (VIEWS)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "graph.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct AxonGraphView {
    pub nodes: Vec<FileNodeView>,
    pub edges: Vec<FileEdgeView>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "graph.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct FileNodeView {
    pub id: String,
    pub label: String,
    pub path: String,
    pub symbols: Vec<Symbol>,
    pub imports: Vec<String>,
    pub used_by: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "graph.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct FileEdgeView {
    pub id: String,
    pub source: String,
    pub target: String,
}

// ============================================================================
// 2. THE CORE GRAPH
// ============================================================================

pub struct AxonGraph {
    pub(crate) forward: HashMap<FileId, HashSet<FileId>>,
    pub(crate) reverse: HashMap<FileId, HashSet<FileId>>,
    pub(crate) symbols: HashMap<SymbolId, Symbol>,
    pub(crate) file_roots: HashMap<FileId, Vec<SymbolId>>,
}

impl AxonGraph {
    pub fn build(tree: &AxonTree<Analyzed>, spool: &AxonSpool, commit_hash: &str) -> Self {
        GraphBuilder::new(tree, spool, commit_hash).build()
    }

    pub fn get_symbol_tree(&self, id: SymbolId) -> Vec<&Symbol> {
        let mut results = Vec::new();
        if let Some(symbol) = self.symbols.get(&id) {
            results.push(symbol);
            for child_id in &symbol.children {
                results.extend(self.get_symbol_tree(*child_id));
            }
        }
        results
    }

    pub fn root_symbols_for(&self, id: FileId) -> Option<&Vec<SymbolId>> {
        self.file_roots.get(&id)
    }

    pub fn dependencies_of(&self, id: FileId) -> Option<&HashSet<FileId>> {
        self.forward.get(&id)
    }

    pub fn dependents_of(&self, id: FileId) -> Option<&HashSet<FileId>> {
        self.reverse.get(&id)
    }

    pub fn to_view(
        &self,
        tree: &AxonTree<Analyzed>,
        spool: &AxonSpool,
        commit_hash: &str,
        focus_paths: &[&str],
        hide_index_files: bool,
    ) -> AxonGraphView {
        if focus_paths.is_empty() {
            return AxonGraphView {
                nodes: Vec::new(),
                edges: Vec::new(),
            };
        }

        let is_index = |name: &str| {
            matches!(
                name,
                "index.ts" | "index.tsx" | "index.js" | "index.jsx" | "index.mjs" | "index.cjs"
            )
        };

        let is_hidden = |file: &crate::tree::node::AxonFile<_>| {
            hide_index_files && is_index(file.name())
        };

        let mut focus_set = HashSet::new();
        for &path in focus_paths {
            if let Some(id) = tree.file_id_by_path(path) {
                focus_set.insert(id);
            }
        }

        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        let map_ids_to_paths = |ids: &HashSet<FileId>| -> Vec<String> {
            ids.iter()
                .filter_map(|&id| tree.file(id))
                .filter(|f| !is_hidden(f))
                .map(|f| f.path().as_str().to_string())
                .collect()
        };

        for &file_id in &focus_set {
            if let Some(file) = tree.file(file_id) {
                if is_hidden(file) {
                    continue;
                }

                let file_path = file.path().as_str();
                let imports = self.dependencies_of(file_id).map(map_ids_to_paths).unwrap_or_default();
                let used_by = self.dependents_of(file_id).map(map_ids_to_paths).unwrap_or_default();

                // Lazy load only the specific files required for the node view
                let symbols = tree.get_file_chunk(spool, commit_hash, file_id)
                    .map(|chunk| chunk.symbols)
                    .unwrap_or_default();

                nodes.push(FileNodeView {
                    id: file_path.to_string(),
                    label: file.name().to_string(),
                    path: file_path.to_string(),
                    symbols,
                    imports,
                    used_by,
                });

                if let Some(targets) = self.dependencies_of(file_id) {
                    for &target_id in targets {
                        if focus_set.contains(&target_id) {
                            if let Some(target_file) = tree.file(target_id) {
                                if !is_hidden(target_file) {
                                    let target_path = target_file.path().as_str();
                                    edges.push(FileEdgeView {
                                        id: format!("{}-{}", file_path, target_path),
                                        source: file_path.to_string(),
                                        target: target_path.to_string(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        AxonGraphView { nodes, edges }
    }
}