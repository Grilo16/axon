// --- FILE: graph/resolver.rs ---
use crate::ids::FileId;
use crate::path::RelativeAxonPath;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use std::collections::HashSet;

pub struct ImportResolver<'a> {
    tree: &'a AxonTree<Analyzed>,
}

impl<'a> ImportResolver<'a> {
    pub fn new(tree: &'a AxonTree<Analyzed>) -> Self {
        Self { tree }
    }

    pub fn trace_symbol(&self, start_id: FileId, symbol_name: &str) -> Option<FileId> {
        let mut visited = HashSet::new();
        self.trace_internal(start_id, symbol_name, &mut visited)
    }

    fn trace_internal(
        &self,
        current_id: FileId,
        symbol_name: &str,
        visited: &mut HashSet<FileId>,
    ) -> Option<FileId> {
        if !visited.insert(current_id) {
            return None;
        }

        let file = self.tree.file(current_id)?;

        if symbol_name == "*" || symbol_name == "default" {
            return Some(current_id);
        }
        if file.symbols().iter().any(|s| s.name == symbol_name) {
            return Some(current_id);
        }

        for exp in file.exports() {
            if exp.name == symbol_name {
                if let Some(source) = &exp.source {
                    if let Some(next_file) = self.resolve_path(current_id, source) {
                        if let Some(found) = self.trace_internal(next_file, symbol_name, visited) {
                            return Some(found);
                        }
                    }
                } else {
                    return Some(current_id);
                }
            }
        }

        for exp in file.exports() {
            if exp.name == "*" {
                if let Some(source) = &exp.source {
                    if let Some(next_file) = self.resolve_path(current_id, source) {
                        if let Some(found) = self.trace_internal(next_file, symbol_name, visited) {
                            return Some(found);
                        }
                    }
                }
            }
        }

        None
    }

    pub fn resolve_path(&self, source_id: FileId, raw: &str) -> Option<FileId> {
        let source_file = self.tree.file(source_id)?;
        let current_dir = source_file
            .path()
            .parent()
            .unwrap_or_else(RelativeAxonPath::base);
        let options = self.tree.options();

        let mut candidates = Vec::new();

        if raw.starts_with('.') {
            let joined = current_dir.join(&RelativeAxonPath::from(raw));
            candidates.push(joined.normalize());
        } else {
            let mut matched_alias = false;
            let tsconfig = &options.compiler_options;

            for (alias, targets) in &tsconfig.paths {
                if let Some(prefix) = alias.strip_suffix("/*") {
                    if let Some(suffix) = raw.strip_prefix(prefix) {
                        let clean_suffix = suffix.trim_start_matches('/');

                        for target in targets {
                            if let Some(target_prefix) = target.as_str().strip_suffix("/*") {
                                let target_prefix_clean = target_prefix.trim_end_matches('/');

                                let candidate_str = if clean_suffix.is_empty() {
                                    target_prefix_clean.to_string()
                                } else {
                                    format!("{}/{}", target_prefix_clean, clean_suffix)
                                };

                                candidates.push(
                                    RelativeAxonPath::from(candidate_str.as_str()).normalize(),
                                );
                            }
                        }
                        matched_alias = true;
                    }
                } else if alias == raw {
                    candidates.extend(targets.iter().map(|p| p.normalize()));
                    matched_alias = true;
                }
            }

            if !matched_alias {
                if let Some(base_url) = &tsconfig.base_url {
                    let joined = base_url.join(&RelativeAxonPath::from(raw));
                    candidates.push(joined.normalize());
                } else {
                    candidates.push(RelativeAxonPath::from(raw).normalize());
                }
            }
        }

        let extensions = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

        for candidate in candidates {
            let base_str = candidate.as_str();

            if let Some(id) = self.tree.file_id_by_path(base_str) {
                return Some(id);
            }
            for ext in &extensions {
                let path_str = format!("{}.{}", base_str, ext);
                if let Some(id) = self.tree.file_id_by_path(&path_str) {
                    return Some(id);
                }
            }
            for ext in &extensions {
                let path_str = format!("{}/index.{}", base_str, ext);
                if let Some(id) = self.tree.file_id_by_path(&path_str) {
                    return Some(id);
                }
            }
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::test_utils::MockTreeBuilder;

    #[test]
    fn test_resolver_relative_paths() {
        let mut builder = MockTreeBuilder::new();
        let target_id = builder.add_file("src/utils/math.ts", vec![], vec![], vec![]);
        let source_id = builder.add_file("src/main.ts", vec![], vec![], vec![]);

        let tree = builder.build();
        let resolver = ImportResolver::new(&tree);

        let resolved = resolver.resolve_path(source_id, "./utils/math");
        assert_eq!(resolved, Some(target_id));
    }
}