use std::collections::HashMap;
use std::path::{Path, PathBuf};
use ignore::WalkBuilder;
use tracing::{debug, warn};
use oxc_span::SourceType;

use tracing::instrument;
use crate::error::{AxonError, AxonResult};
use crate::tree::state::{Empty, Scanned, TreeRegistry};
use crate::{
    ids::{DirectoryId, FileId},
    path::RelativeAxonPath,
    tree::{
        AxonTree, AxonTreeCore, 
        node::{AxonDirectory, AxonFile, file::state::Found}, 
        options::AxonScanOptions, 
    },
};

impl AxonTree<Empty> {
    /// Constructor for a fresh tree.
    pub fn new(root: PathBuf, scan: AxonScanOptions) -> AxonResult<Self> {
        if !root.exists() {
            return Err(AxonError::RootNotFound(root));
        }
        if !root.is_dir() {
            return Err(AxonError::RootNotDirectory(root));
        }

        Ok(Self {
            core: AxonTreeCore { root, scan },
            state: Empty,
        })
    }

    /// Transition: Walk the OS and build the initial Scanned state.
    #[instrument(skip(self), fields(root = %self.core.root.display()), err)]
    pub fn scan_os(self) -> AxonResult<AxonTree<Scanned>> {
        debug!("Scanning project root: {}", self.core.root.display());
        
        let mut builder = TreeScanner::new();
        let walker = WalkBuilder::new(&self.core.root)
            .standard_filters(true) // Respects .gitignore automatically!
            .follow_links(false)
            .build();

        for entry in walker {
            let entry = match entry {
                Ok(e) => e,
                Err(err) => {
                    warn!("walk error: {err}");
                    continue;
                }
            };

            if self.should_ingest(&entry) {
                // Wrap potential IO/Path errors with context
                builder.ingest_file(entry.path(), &self.core.root)?;
            }
        }

        Ok(AxonTree {
            core: self.core,
            state: builder.finish(),
        })
    }

    fn should_ingest(&self, entry: &ignore::DirEntry) -> bool {
        if !entry.file_type().map_or(false, |ft| ft.is_file()) {
            return false;
        }

        let ext = entry.path().extension()
            .and_then(|s| s.to_str())
            .map(|s| s.to_lowercase())
            .unwrap_or_default();

        self.core.scan.allowed_extensions.contains(&ext)
    }
}

/// Helper struct to maintain state during the discovery phase.
struct TreeScanner {
    directories: Vec<AxonDirectory>,
    files: Vec<AxonFile<Found>>,
    dir_by_path: HashMap<RelativeAxonPath, DirectoryId>,
    file_by_path: HashMap<RelativeAxonPath, FileId>,
}

impl TreeScanner {
    fn new() -> Self {
        let root_id = DirectoryId(0);
        let mut dir_by_path = HashMap::new();
        dir_by_path.insert(RelativeAxonPath::base(), root_id);

        Self {
            directories: vec![AxonDirectory::new_root(root_id)],
            files: Vec::new(),
            dir_by_path,
            file_by_path: HashMap::new(),
        }
    }

    fn ingest_file(&mut self, abs_path: &Path, root: &Path) -> AxonResult<()> {
        let rel = RelativeAxonPath::from_absolute(root, abs_path)?;
        let parent_id = self.ensure_directories(&rel)?;
        
        let file_id = FileId::from(self.files.len() as u32);
        let source_type = SourceType::from_path(abs_path).unwrap_or_default();

        let file = AxonFile::<Found>::transition(file_id, rel.clone(), parent_id, source_type, Found);
        
        // Internal consistency: Update the parent directory's children list
        if let Some(parent_dir) = self.directories.get_mut(parent_id.as_usize()) {
            parent_dir.add_file(file_id);
        }

        self.file_by_path.insert(rel, file_id);
        self.files.push(file);

        Ok(())
    }

    fn ensure_directories(&mut self, file_path: &RelativeAxonPath) -> AxonResult<DirectoryId> {
        let mut current_id = DirectoryId(0);
        let mut current_path = RelativeAxonPath::base();

        let segments: Vec<_> = file_path.segments().collect();
        if segments.len() <= 1 { return Ok(current_id); }
        
        for &seg in &segments[..segments.len() - 1] {
            current_path = current_path.join_segment(seg)?;
            
            if let Some(&existing_id) = self.dir_by_path.get(&current_path) {
                current_id = existing_id;
            } else {
                let new_id = DirectoryId::from(self.directories.len() as u32);
                let new_dir = AxonDirectory::new(new_id, current_path.clone(), Some(current_id));
                
                if let Some(parent) = self.directories.get_mut(current_id.as_usize()) {
                    parent.add_dir(new_id);
                }

                self.directories.push(new_dir);
                self.dir_by_path.insert(current_path.clone(), new_id);
                current_id = new_id;
            }
        }

        Ok(current_id)
    }

    fn finish(self) -> Scanned {
        Scanned(TreeRegistry {
            root_dir_id: DirectoryId(0),
            directories: self.directories,
            files: self.files,
            dir_by_path: self.dir_by_path,
            file_by_path: self.file_by_path,
        })
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::tree::state::RegistryAccess;

    #[test]
    fn test_tree_scanner_nesting() {
        let mut scanner = TreeScanner::new();
        let root = Path::new("/project");
        
        // 1. Ingest files at different depths
        let file1 = root.join("src").join("main.rs");
        scanner.ingest_file(&file1, root).expect("Failed to ingest main.rs");

        let file2 = root.join("src").join("utils").join("mod.rs");
        scanner.ingest_file(&file2, root).expect("Failed to ingest mod.rs");

        let scanned = scanner.finish();
        
        // 2. Use our Trait ergonomics to verify
        assert_eq!(scanned.files().len(), 2);
        assert_eq!(scanned.directories().len(), 3); // Root, src, src/utils

        // 3. Verify path mapping
        assert!(scanned.file_id_by_path("src/main.rs").is_some());
        
        // 4. Verify structural integrity
        let root_dir = &scanned.directories()[0];
        assert_eq!(root_dir.child_dirs().len(), 1, "Root should contain exactly 'src'");
        
        let src_id = root_dir.child_dirs()[0];
        let src_dir = &scanned.directories()[src_id.as_usize()];
        assert_eq!(src_dir.child_files().len(), 1, "src should contain main.rs");
        assert_eq!(src_dir.child_dirs().len(), 1, "src should contain utils/");
    }
}