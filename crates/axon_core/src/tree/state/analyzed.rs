use crate::{
    error::{AxonError, AxonResult},
    ids::FileId,
    ir::FileChunk,
    spool::AxonSpool,
    tree::{
        AxonTree, 
        node::file::symbol::Symbol, 
        resolver::ImportResolver, 
        state::{Analyzed, RegistryAccess}
    },
};
use std::sync::Arc;

impl AxonTree<Analyzed> {
    
    // ==========================================
    // 1. THE LAZY SPOOL FETCHERS
    // ==========================================

    /// Fetches a specific file's AST chunk, hitting the lightning-fast L1 cache first.
    pub fn get_file_chunk(
        &self,
        spool: &AxonSpool,
        commit_hash: &str,
        file_id: FileId,
    ) -> AxonResult<Arc<FileChunk>> {
        let file = self.file(file_id).ok_or_else(|| AxonError::missing_file(file_id))?;
        spool.get_cached_chunk(commit_hash, file.path().as_str())
    }

    // ==========================================
    // 2. DISK-BACKED SEMANTIC QUERIES
    // ==========================================

    pub fn find_symbols_by_name(
        &self,
        spool: &AxonSpool,
        commit_hash: &str,
        name: &str,
    ) -> AxonResult<Vec<(FileId, Symbol)>> {
        let mut results = Vec::new();
        
        for file in self.files() {
            if let Ok(chunk) = self.get_file_chunk(spool, commit_hash, file.id()) {
                for sym in &chunk.symbols {
                    if sym.name.as_str() == name {
                        results.push((file.id(), sym.clone()));
                    }
                }
            }
        }
        Ok(results)
    }

    pub fn dependencies_of(
        &self, 
        spool: &AxonSpool, 
        commit_hash: &str, 
        file_id: FileId
    ) -> AxonResult<Vec<FileId>> {
        let chunk = self.get_file_chunk(spool, commit_hash, file_id)?;
        let mut deps = Vec::new();
        let resolver = ImportResolver::new(self);

        for import in &chunk.imports {
            if let Some(target_id) = resolver.resolve_path(file_id, import.raw_path.as_str()) {
                deps.push(target_id);
            }
        }

        Ok(deps)
    }

    // ==========================================
    // 3. RAM-BACKED REGISTRY QUERIES
    // ==========================================

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
        let max_files = limit.unwrap_or(usize::MAX);

        if max_files == 0 {
            return Some(Vec::new()); 
        }

        if recursive {
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
                            .take(remaining),
                    );

                    if results.len() >= max_files {
                        break;
                    }

                    stack.extend(dir.child_dirs().iter().copied());
                }
            }

            Some(results)
        } else {
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
    }

    pub fn read_file_content(&self, spool: &AxonSpool, commit_hash: &str, target_path: &str) -> AxonResult<String> {
        let file_id = self.file_id_by_path(target_path)
            .ok_or_else(|| AxonError::NotFound { entity: "File", id: target_path.to_string() })?;
            
        let chunk = self.get_file_chunk(spool, commit_hash, file_id)?;
        Ok(chunk.content.clone())
    }
}