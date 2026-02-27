// --- FILE: graph/builder.rs ---
use crate::ids::{FileId, SymbolId};
use crate::tree::node::file::symbol::Symbol;
use crate::tree::resolver::ImportResolver;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use std::collections::{HashMap, HashSet};

use super::AxonGraph;

pub struct GraphBuilder<'a> {
    tree: &'a AxonTree<Analyzed>,
    resolver: ImportResolver<'a>,
    forward: HashMap<FileId, HashSet<FileId>>,
    reverse: HashMap<FileId, HashSet<FileId>>,
    symbols: HashMap<SymbolId, Symbol>,
    file_roots: HashMap<FileId, Vec<SymbolId>>,
}

impl<'a> GraphBuilder<'a> {
    pub fn new(tree: &'a AxonTree<Analyzed>) -> Self {
        Self {
            tree,
            resolver: ImportResolver::new(tree),
            forward: HashMap::new(),
            reverse: HashMap::new(),
            symbols: HashMap::new(),
            file_roots: HashMap::new(),
        }
    }

    pub fn build(mut self) -> AxonGraph {
        for file in self.tree.files() {
            self.process_file(file);
        }

        AxonGraph {
            forward: self.forward,
            reverse: self.reverse,
            symbols: self.symbols,
            file_roots: self.file_roots,
        }
    }

    fn add_edge(&mut self, source: FileId, target: FileId) {
        self.forward.entry(source).or_default().insert(target);
        self.reverse.entry(target).or_default().insert(source);
    }

    fn process_file(
        &mut self,
        file: &crate::tree::node::AxonFile<crate::tree::node::file::state::Outlined>,
    ) {
        let source_id = file.id();
        let mut roots = Vec::new();

        for symbol in file.symbols() {
            self.symbols.insert(symbol.id, symbol.clone());
            if symbol.parent.is_none() {
                roots.push(symbol.id);
            }
        }
        self.file_roots.insert(source_id, roots);

        for import in file.imports() {
            if let Some(initial_target) = self.resolver.resolve_path(source_id, &import.raw_path) {
                if import.symbols.is_empty() {
                    self.add_edge(source_id, initial_target);
                    continue;
                }

                for sym in &import.symbols {
                    let concrete_target = self
                        .resolver
                        .trace_symbol(initial_target, sym)
                        .unwrap_or(initial_target);

                    self.add_edge(source_id, concrete_target);
                }
            }
        }

        for export in file.exports() {
            if let Some(raw_path) = &export.source {
                if let Some(target_id) = self.resolver.resolve_path(source_id, raw_path) {
                    self.add_edge(source_id, target_id);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::test_utils::MockTreeBuilder;

    #[test]
    fn test_graph_builder_traces_edges() {
        let mut builder = MockTreeBuilder::new();
        let target_id = builder.add_file("src/utils.ts", vec!["helper"], vec![], vec![]);
        let source_id = builder.add_file("src/main.ts", vec![], vec![("./utils", vec!["helper"])], vec![]);

        let tree = builder.build();
        let graph = GraphBuilder::new(&tree).build();

        let deps = graph.dependencies_of(source_id).expect("Dependencies missing");
        assert!(deps.contains(&target_id));
    }
}