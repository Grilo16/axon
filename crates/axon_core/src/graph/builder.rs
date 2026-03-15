use crate::ids::{FileId, SymbolId};
use crate::tree::node::file::symbol::Symbol;
use crate::tree::resolver::ImportResolver;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use crate::spool::AxonSpool;
use std::collections::{HashMap, HashSet};

use super::AxonGraph;

pub struct GraphBuilder<'a> {
    tree: &'a AxonTree<Analyzed>,
    spool: &'a AxonSpool,
    commit_hash: &'a str,
    resolver: ImportResolver<'a>,
    forward: HashMap<FileId, HashSet<FileId>>,
    reverse: HashMap<FileId, HashSet<FileId>>,
    symbols: HashMap<SymbolId, Symbol>,
    file_roots: HashMap<FileId, Vec<SymbolId>>,
}

impl<'a> GraphBuilder<'a> {
    pub fn new(tree: &'a AxonTree<Analyzed>, spool: &'a AxonSpool, commit_hash: &'a str) -> Self {
        Self {
            tree,
            spool,
            commit_hash,
            resolver: ImportResolver::new(tree),
            forward: HashMap::new(),
            reverse: HashMap::new(),
            symbols: HashMap::new(),
            file_roots: HashMap::new(),
        }
    }

    pub fn build(mut self) -> AxonGraph {
        for file in self.tree.files() {
            self.process_file(file.id());
        }

        AxonGraph {
            forward: self.forward,
            reverse: self.reverse,
            symbols: self.symbols,
            file_roots: self.file_roots,
        }
    }

    fn add_edge(&mut self, source: FileId, target: FileId) {
        // Prevent self-referential edges
        if source != target {
            self.forward.entry(source).or_default().insert(target);
            self.reverse.entry(target).or_default().insert(source);
        }
    }

    fn process_file(&mut self, source_id: FileId) {
        let Ok(chunk) = self.tree.get_file_chunk(self.spool, self.commit_hash, source_id) else {
            return;
        };

        let mut roots = Vec::new();

        for symbol in chunk.symbols {
            if symbol.parent.is_none() {
                roots.push(symbol.id);
            }
            self.symbols.insert(symbol.id, symbol);
        }
        self.file_roots.insert(source_id, roots);

        for import in chunk.imports {
            if let Some(initial_target) = self.resolver.resolve_path(source_id, import.raw_path.as_str()) {
                
                // HEURISTIC FIX: ALWAYS link the literal file imported to prevent disconnected visual nodes.
                self.add_edge(source_id, initial_target);

                // If there are specific symbols, trace them to their concrete definition
                for sym in import.symbols {
                    let concrete_target = self
                        .resolver
                        .trace_symbol(self.spool, self.commit_hash, initial_target, sym.as_str())
                        .unwrap_or(initial_target);

                    // If it traced deep into a re-export, add that semantic edge as well
                    if concrete_target != initial_target {
                        self.add_edge(source_id, concrete_target);
                    }
                }
            }
        }

        for export in chunk.exports {
            if let Some(raw_path) = &export.source {
                if let Some(target_id) = self.resolver.resolve_path(source_id, raw_path.as_str()) {
                    // Export chains (e.g. export * from './module') create semantic edges
                    self.add_edge(source_id, target_id);
                }
            }
        }
    }
}