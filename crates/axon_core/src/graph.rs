// --- FILE: graph.rs ---
pub mod builder;

#[cfg(test)]
pub(crate) mod test_utils;

use crate::ids::{FileId, SymbolId};
use crate::tree::node::file::symbol::Symbol;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
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
    pub fn build(tree: &AxonTree<Analyzed>) -> Self {
        GraphBuilder::new(tree).build()
    }

    // --- RESTORED HELPER METHODS ---

    /// Find a symbol and all its nested children recursively
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

    /// Get the root symbols for a specific file
    pub fn root_symbols_for(&self, id: FileId) -> Option<&Vec<SymbolId>> {
        self.file_roots.get(&id)
    }

    /// A quick summary reporter to silence warnings and show off the graph
    pub fn print_summary(&self, tree: &AxonTree<Analyzed>) {
        println!("\n🕸️  Project Dependency Graph Summary");
        println!("------------------------------------");
        for file in tree.files() {
            let deps_count = self.dependencies_of(file.id()).map_or(0, |d| d.len());
            let rev_count = self.dependents_of(file.id()).map_or(0, |d| d.len());

            if deps_count > 0 || rev_count > 0 {
                println!(
                    "{:<40} | Out: {:>2} | In: {:>2}",
                    file.name(),
                    deps_count,
                    rev_count
                );
            }
        }
    }

    // --- DEPENDENCY METHODS ---

    pub fn dependencies_of(&self, id: FileId) -> Option<&HashSet<FileId>> {
        self.forward.get(&id)
    }

    pub fn dependents_of(&self, id: FileId) -> Option<&HashSet<FileId>> {
        self.reverse.get(&id)
    }

    pub fn to_view(
        &self,
        tree: &AxonTree<Analyzed>,
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

        // 1. Determine our working set of FileIds
        // Since we already early-exited on empty, we strictly map the requested paths!
        let mut focus_set = HashSet::new();
        for &path in focus_paths {
            if let Some(id) = tree.file_id_by_path(path) {
                focus_set.insert(id);
            }
        }

        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        // Safe helper to map FileIds to paths, aggressively stripping hidden files
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

                nodes.push(FileNodeView {
                    id: file_path.to_string(),
                    label: file.name().to_string(),
                    path: file_path.to_string(),
                    symbols: file.symbols().to_vec(),
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
#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::test_utils::MockTreeBuilder;
    use std::collections::HashMap;

    #[test]
    fn test_unified_to_view_filtering() {
        let mut builder = MockTreeBuilder::new();
        builder.add_file("src/utils.ts", vec![], vec![], vec![]);
        let index_id = builder.add_file("src/index.ts", vec![], vec![], vec![]);
        let main_id = builder.add_file("src/main.ts", vec![], vec![("./index", vec![])], vec![]);

        let tree = builder.build();
        let mut graph = AxonGraph { 
            forward: HashMap::new(),
            reverse: HashMap::new(),
            symbols: HashMap::new(),
            file_roots: HashMap::new(),
        };
        
        graph.forward.entry(main_id).or_default().insert(index_id);
        graph.reverse.entry(index_id).or_default().insert(main_id);

  
        let focus_paths = ["src/main.ts", "src/utils.ts", "src/index.ts"];
        let view = graph.to_view(&tree, &focus_paths, true); 
        
        // Test 1: Hide Index file
        assert!(!view.nodes.iter().any(|n| n.label == "index.ts"), "Index file should be completely hidden");
        
        // Test 2: Ensure imports are stripped
        let main_node = view.nodes.iter().find(|n| n.label == "main.ts")
            .expect("main.ts should exist in the view!"); // .expect() is better than .unwrap() for tests!
            
        assert!(main_node.imports.is_empty(), "Index file should be stripped from imports array");
    }
}