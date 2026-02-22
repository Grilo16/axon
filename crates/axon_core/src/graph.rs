use crate::ids::{FileId, SymbolId};
use crate::path::RelativeAxonPath;
use crate::tree::node::file::symbol::Symbol;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use std::collections::{HashMap, HashSet};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

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
    pub id: String, // React Flow likes string IDs
    pub label: String,
    pub path: String,
    pub symbols: Vec<Symbol>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "graph.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct FileEdgeView {
    pub id: String,
    pub source: String,
    pub target: String,
}


pub struct AxonGraph {
    /// Layer 1: File-level dependencies (Your existing maps)
    forward: HashMap<FileId, HashSet<FileId>>,
    reverse: HashMap<FileId, HashSet<FileId>>,

    /// Layer 2: The Global Symbol Registry
    /// This allows us to find ANY symbol in the project by ID instantly.
    symbols: HashMap<SymbolId, Symbol>,

    /// Layer 3: File Ownership
    /// Maps a File to its top-level (root) symbols.
    file_roots: HashMap<FileId, Vec<SymbolId>>,
}

impl AxonGraph {
    pub fn new(tree: &AxonTree<Analyzed>) -> Self {
        let mut forward: HashMap<FileId, HashSet<FileId>> = HashMap::new();
        let mut reverse: HashMap<FileId, HashSet<FileId>> = HashMap::new();
        let mut symbols = HashMap::new();
        let mut file_roots = HashMap::new();

        // --- Layer 1: Resolve File Dependencies ---
        for file in tree.files() {
            let source_id = file.id();

            let mut roots = Vec::new();

            for symbol in file.symbols() {
                symbols.insert(symbol.id, symbol.clone());

                if symbol.parent.is_none() {
                    roots.push(symbol.id);
                }
            }

            file_roots.insert(source_id, roots);
            // Standard import resolution
            for import in file.imports() {
                if let Some(target_id) = resolve_id(tree, source_id, &import.raw_path) {
                    forward.entry(source_id).or_default().insert(target_id);
                    reverse.entry(target_id).or_default().insert(source_id);
                }
            }
        }

        Self {
            forward,
            reverse,
            symbols,
            file_roots,
        }
    }

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

    /// Get outbound dependencies for a file
    pub fn dependencies_of(&self, id: FileId) -> Option<&HashSet<FileId>> {
        self.forward.get(&id)
    }

    /// Get inbound dependents for a file
    pub fn dependents_of(&self, id: FileId) -> Option<&HashSet<FileId>> {
        self.reverse.get(&id)
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
            let deps_count = self.dependencies_of(file.id()).map(|d| d.len()).unwrap_or(0);
            let rev_count = self.dependents_of(file.id()).map(|d| d.len()).unwrap_or(0);
            
            if deps_count > 0 || rev_count > 0 {
                println!("{:<40} | Out: {:>2} | In: {:>2}", 
                    file.name(), 
                    deps_count, 
                    rev_count
                );
            }
        }
    }

    pub fn to_view(&self, tree: &AxonTree<Analyzed>) -> AxonGraphView {
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        // 1. Build Nodes
        for file in tree.files() {
            nodes.push(FileNodeView {
                id: file.id().to_string(),
                label: file.name().to_string(),
                path: file.path().as_str().to_string(),
                symbols: file.symbols().to_vec(),
            });

            // 2. Build Edges from the 'forward' map
            if let Some(targets) = self.forward.get(&file.id()) {
                for &target_id in targets {
                    edges.push(FileEdgeView {
                        id: format!("{}-{}", file.id(), target_id),
                        source: file.id().to_string(),
                        target: target_id.to_string(),
                    });
                }
            }
        }

        AxonGraphView { nodes, edges }
    }

}



fn resolve_id(tree: &AxonTree<Analyzed>, source_id: FileId, raw: &str) -> Option<FileId> {
    // 1. Handle Aliases (Simple version: just treat them as relative to src)
    // You can expand this later to read actual tsconfig paths!
    let sanitized_path = if raw.starts_with('@') {
        // Example: Change "@app/store" to "src/store"
        // Adjust "src/" to match your actual project structure!
        raw.replacen('@', "src/", 1).replace("//", "/")
    } else if raw.starts_with('.') {
        let source_file = tree.file(source_id)?;
        let current_dir = source_file.path().parent()?;
        let raw_path = RelativeAxonPath::from(raw);
        current_dir.join(&raw_path).as_str().to_string()
    } else {
        // Likely a node_module, skip for internal graph
        return None;
    };

    let base_candidate = RelativeAxonPath::from(sanitized_path.as_str());

    // 2. The Probe Loop
    let extensions = ["ts", "tsx", "js", "jsx"];

    // Check direct file
    for ext in &extensions {
        let path_str = format!("{}.{}", base_candidate.as_str(), ext);
        if let Some(id) = tree.file_id_by_path(&path_str) {
            return Some(id);
        }
    }

    // Check index files
    for ext in &extensions {
        let path_str = format!("{}/index.{}", base_candidate.as_str(), ext);
        if let Some(id) = tree.file_id_by_path(&path_str) {
            return Some(id);
        }
    }

    None
}
