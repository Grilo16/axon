use crate::ids::FileId;
use crate::path::RelativeAxonPath;
use crate::spool::AxonSpool;
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

pub struct ImportResolver<'a> {
    tree: &'a AxonTree<Analyzed>,
    /// Cache: directory path -> project root prefix (avoids recomputing per resolve call)
    project_root_cache: RefCell<HashMap<String, String>>,
}

impl<'a> ImportResolver<'a> {
    pub fn new(tree: &'a AxonTree<Analyzed>) -> Self {
        Self {
            tree,
            project_root_cache: RefCell::new(HashMap::new()),
        }
    }

    /// Derives the monorepo project root from a directory path without allocating a Vec.
    fn project_root_for(&self, dir_str: &str) -> String {
        {
            let cache = self.project_root_cache.borrow();
            if let Some(cached) = cache.get(dir_str) {
                return cached.clone();
            }
        }

        let root = Self::compute_project_root(dir_str);

        self.project_root_cache.borrow_mut().insert(dir_str.to_string(), root.clone());
        root
    }

    fn compute_project_root(dir_str: &str) -> String {
        // Find "src" segment position without allocating a Vec.
        if let Some(src_pos) = dir_str.split('/').position(|s| s == "src") {
            if src_pos > 0 {
                // Take everything before the "src" segment by byte offset.
                return dir_str.split('/').take(src_pos).collect::<Vec<_>>().join("/");
            }
            return String::new();
        }

        // Fallback: "apps/X" or "packages/X" → take first two segments
        let mut segments = dir_str.splitn(3, '/');
        if let (Some(first), Some(second)) = (segments.next(), segments.next()) {
            if first == "apps" || first == "packages" {
                let mut root = String::with_capacity(first.len() + 1 + second.len());
                root.push_str(first);
                root.push('/');
                root.push_str(second);
                return root;
            }
        }

        String::new()
    }

    pub fn trace_symbol(
        &self, 
        spool: &AxonSpool, 
        commit_hash: &str, 
        start_id: FileId, 
        symbol_name: &str
    ) -> Option<FileId> {
        let mut visited = HashSet::new();
        self.trace_internal(spool, commit_hash, start_id, symbol_name, &mut visited)
    }

    fn trace_internal(
        &self,
        spool: &AxonSpool,
        commit_hash: &str,
        current_id: FileId,
        symbol_name: &str,
        visited: &mut HashSet<FileId>,
    ) -> Option<FileId> {
        // 1. Prevent infinite import cycles
        if !visited.insert(current_id) {
            return None;
        }

        // Lazy load the AST chunk from NVMe
        let chunk = self.tree.get_file_chunk(spool, commit_hash, current_id).ok()?;

        // 2. Concrete Symbol Match
        if chunk.symbols.iter().any(|s| s.name.as_str() == symbol_name) {
            return Some(current_id);
        }

        // 3. Trace Explicit Named Exports
        for exp in &chunk.exports {
            if exp.name.as_str() == symbol_name {
                if let Some(source) = &exp.source {
                    if let Some(next_file) = self.resolve_path(current_id, source.as_str()) {
                        if let Some(found) = self.trace_internal(spool, commit_hash, next_file, symbol_name, visited) {
                            return Some(found);
                        }
                    }
                } else {
                    // It explicitly exports it but has no source (defined locally)
                    return Some(current_id);
                }
            }
        }

        // 4. Trace Wildcard Re-exports (`export * from './module'`)
        for exp in &chunk.exports {
            if exp.name.as_str() == "*" {
                if let Some(source) = &exp.source {
                    if let Some(next_file) = self.resolve_path(current_id, source.as_str()) {
                        if let Some(found) = self.trace_internal(spool, commit_hash, next_file, symbol_name, visited) {
                            return Some(found);
                        }
                    }
                }
            }
        }

        // 5. Semantic Fallback
        // If we hit a dead end, but the requested symbol is "default" or "*", 
        // the current file is the authoritative source.
        if symbol_name == "*" || symbol_name == "default" {
            return Some(current_id);
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

        let mut candidates = Vec::with_capacity(8);
        let mut buf = String::with_capacity(128);

        if raw.starts_with('.') {
            let joined = current_dir.join(&RelativeAxonPath::from(raw));
            candidates.push(joined.normalize());
        } else {
            let mut matched_alias = false;
            let tsconfig = &options.compiler_options;
            let current_dir_str = current_dir.as_str();

            let project_root = self.project_root_for(current_dir_str);

            for (alias, targets) in &tsconfig.paths {
                if let Some(prefix) = alias.strip_suffix("/*") {
                    if let Some(suffix) = raw.strip_prefix(prefix) {
                        let clean_suffix = suffix.trim_start_matches('/');

                        for target in targets {
                            if let Some(target_prefix) = target.as_str().strip_suffix("/*") {
                                let target_prefix_clean = target_prefix.trim_end_matches('/').trim_start_matches("./");

                                buf.clear();
                                buf.push_str(target_prefix_clean);
                                if !clean_suffix.is_empty() {
                                    buf.push('/');
                                    buf.push_str(clean_suffix);
                                }

                                if !project_root.is_empty() && !buf.starts_with(project_root.as_str()) {
                                    let candidate_len = buf.len();
                                    let prefix_buf = {
                                        let mut tmp = String::with_capacity(project_root.len() + 1 + candidate_len);
                                        tmp.push_str(&project_root);
                                        tmp.push('/');
                                        tmp.push_str(&buf);
                                        tmp
                                    };
                                    candidates.push(RelativeAxonPath::from(prefix_buf.as_str()).normalize());
                                }
                                candidates.push(RelativeAxonPath::from(buf.as_str()).normalize());
                            }
                        }
                        matched_alias = true;
                    }
                } else if alias == raw {
                    for target in targets {
                        let target_clean = target.as_str().trim_start_matches("./");
                        if !project_root.is_empty() && !target_clean.starts_with(project_root.as_str()) {
                            buf.clear();
                            buf.push_str(&project_root);
                            buf.push('/');
                            buf.push_str(target_clean);
                            candidates.push(RelativeAxonPath::from(buf.as_str()).normalize());
                        }
                        candidates.push(RelativeAxonPath::from(target_clean).normalize());
                    }
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

                let stripped_alias = if let Some(s) = raw.strip_prefix("@/") {
                    Some(s)
                } else if let Some(s) = raw.strip_prefix("~/") {
                    Some(s)
                } else if let Some(s) = raw.strip_prefix("@") {
                    Some(s)
                } else {
                    None
                };

                if let Some(stripped) = stripped_alias {
                    buf.clear();
                    if !project_root.is_empty() {
                        buf.push_str(&project_root);
                        buf.push_str("/src/");
                    } else {
                        buf.push_str("src/");
                    }
                    buf.push_str(stripped);
                    candidates.push(RelativeAxonPath::from(buf.as_str()).normalize());

                    buf.clear();
                    buf.push_str("src/");
                    buf.push_str(stripped);
                    candidates.push(RelativeAxonPath::from(buf.as_str()).normalize());

                    candidates.push(RelativeAxonPath::from(stripped).normalize());
                }
            }
        }

        // Expanded extension heuristic to map static assets correctly
        let extensions = [
            "ts", "tsx", "js", "jsx", "mjs", "cjs",
            "d.ts", "json", "css", "scss", "svg"
        ];

        // Reusable buffer to avoid allocating a new String per extension probe
        let mut buf = String::with_capacity(128);

        for candidate in candidates {
            let base_str = candidate.as_str();

            // 1. Exact String Match (crucial for things like "styles.css")
            if let Some(id) = self.tree.file_id_by_path(base_str) {
                return Some(id);
            }
            // 2. Implicit Extensions
            for ext in &extensions {
                buf.clear();
                buf.push_str(base_str);
                buf.push('.');
                buf.push_str(ext);
                if let Some(id) = self.tree.file_id_by_path(&buf) {
                    return Some(id);
                }
            }
            // 3. Implicit Barrel Exports
            for ext in &extensions {
                buf.clear();
                buf.push_str(base_str);
                buf.push_str("/index.");
                buf.push_str(ext);
                if let Some(id) = self.tree.file_id_by_path(&buf) {
                    return Some(id);
                }
            }
        }

        None
    }
}