pub mod empty;
pub mod scanned;
pub mod loaded;
pub mod analyzed;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

use crate::{
    ids::{DirectoryId, FileId},
    path::RelativeAxonPath,
    tree::node::{AxonDirectory, AxonFile, file::state::Outlined},
};
use crate::tree::node::file::state::{Found, Read};

/// A generic container for the tree structure.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeRegistry<F> {
    pub root_dir_id: DirectoryId,
    pub directories: Vec<AxonDirectory>,
    pub files: Vec<AxonFile<F>>,
    pub dir_by_path: HashMap<RelativeAxonPath, DirectoryId>,
    pub file_by_path: HashMap<RelativeAxonPath, FileId>,
}

/// The "Ergonomics Engine": Share behavior across all Tree states.
/// We add the 'static bound to F to ensure the registry owns its data.
pub trait RegistryAccess<F: 'static> {
    fn registry(&self) -> &TreeRegistry<F>;

    fn root_dir_id(&self) -> DirectoryId {
        self.registry().root_dir_id
    }

    fn files(&self) -> &[AxonFile<F>] {
        &self.registry().files
    }

    fn file(&self, id: FileId) -> Option<&AxonFile<F>> {
        self.registry().files.get(id.as_usize())
    }

    fn file_id_by_path(&self, path: &str) -> Option<FileId> {
        self.registry().file_by_path.get(&RelativeAxonPath::from(path)).copied()
    }

    // --- Directory Accessors ---

    fn directories(&self) -> &[AxonDirectory] {
        &self.registry().directories
    }

    fn directory(&self, id: DirectoryId) -> Option<&AxonDirectory> {
        self.registry().directories.get(id.as_usize())
    }

    fn dir_id_by_path(&self, path: &str) -> Option<DirectoryId> {
        self.registry().dir_by_path.get(&RelativeAxonPath::from(path)).copied()
    }
}

// --- States ---

#[derive(Debug, Clone, Copy)]
pub struct Empty;

#[derive(Debug, Clone)]
pub struct Scanned(pub TreeRegistry<Found>);

#[derive(Debug, Clone)]
pub struct Loaded(pub TreeRegistry<Read>);

#[derive(Debug, Clone)]
pub struct Analyzed(pub TreeRegistry<Outlined>);

// --- Registry Implementations ---

impl RegistryAccess<Found> for Scanned {
    fn registry(&self) -> &TreeRegistry<Found> { &self.0 }
}

impl RegistryAccess<Read> for Loaded {
    fn registry(&self) -> &TreeRegistry<Read> { &self.0 }
}

impl RegistryAccess<Outlined> for Analyzed {
    fn registry(&self) -> &TreeRegistry<Outlined> { &self.0 }
}

// --- Line Count Helpers ---
// We implement these specifically where they make sense to avoid 
// trait bound complexity.

impl Loaded {
    pub fn total_line_count(&self) -> usize {
        self.0.files.iter().map(|f| f.line_count()).sum()
    }
}

impl Analyzed {
    pub fn total_line_count(&self) -> usize {
        self.0.files.iter().map(|f| f.line_count()).sum()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tree::node::file::state::Found;
    use oxc_span::SourceType;

    #[test]
    fn test_registry_access_trait() {
        let root_id = DirectoryId(0);
        let file_id = FileId(0);
        let path = RelativeAxonPath::from("test.ts");

        let registry = TreeRegistry {
            root_dir_id: root_id,
            directories: vec![AxonDirectory::new_root(root_id)],
            files: vec![AxonFile::transition(file_id, path.clone(), root_id, SourceType::default(), Found)],
            dir_by_path: HashMap::from([(RelativeAxonPath::base(), root_id)]),
            file_by_path: HashMap::from([(path, file_id)]),
        };

        let scanned = Scanned(registry);

        // Verify we can access directories and files via the trait
        assert_eq!(scanned.directories().len(), 1);
        assert_eq!(scanned.files().len(), 1);
        assert_eq!(scanned.root_dir_id(), root_id);
        
        // Verify lookups
        assert!(scanned.directory(root_id).is_some());
        assert!(scanned.file(file_id).is_some());
        assert_eq!(scanned.file_id_by_path("test.ts"), Some(file_id));
    }
}