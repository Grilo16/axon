use std::fmt;

use serde::{Deserialize, Serialize};

use crate::{
    ids::{DirectoryId, FileId},
    path::RelativeAxonPath,
};

/// Directory node in the AxonTree.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AxonDirectory {
    id: DirectoryId,
    path: RelativeAxonPath,
    parent: Option<DirectoryId>,
    child_dirs: Vec<DirectoryId>,
    child_files: Vec<FileId>,
}

impl AxonDirectory {
    pub(crate) fn new_root(id: DirectoryId) -> Self {
        Self {
            id,
            path: RelativeAxonPath::base(),
            parent: None,
            child_dirs: Vec::new(),
            child_files: Vec::new(),
        }
    }

    pub(crate) fn new(
        id: DirectoryId,
        path: RelativeAxonPath,
        parent: Option<DirectoryId>,
    ) -> Self {
        Self {
            id,
            path,
            parent,
            child_dirs: Vec::new(),
            child_files: Vec::new(),
        }
    }

    pub fn id(&self) -> DirectoryId {
        self.id
    }

    pub fn path(&self) -> &RelativeAxonPath {
        &self.path
    }

    pub fn parent(&self) -> Option<DirectoryId> {
        self.parent
    }

    pub fn child_dirs(&self) -> &[DirectoryId] {
        &self.child_dirs
    }

    pub fn child_files(&self) -> &[FileId] {
        &self.child_files
    }

    pub fn name(&self) -> &str {
        if self.path.is_base() {
            "."
        } else {
            self.path.segments().last().unwrap_or(".")
        }
    }

    pub(crate) fn add_dir(&mut self, id: DirectoryId) {
        if !self.child_dirs.contains(&id) {
            self.child_dirs.push(id);
        }
    }

    pub(crate) fn add_file(&mut self, id: FileId) {
        if !self.child_files.contains(&id) {
            self.child_files.push(id);
        }
    }

    pub fn is_empty(&self) -> bool {
        self.child_dirs.is_empty() && self.child_files.is_empty()
    }
}

impl fmt::Display for AxonDirectory {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} (id={:?})", self.path, self.id)
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::path::RelativeAxonPath;

    #[test]
    fn test_directory_naming() {
        let root = AxonDirectory::new_root(DirectoryId(0));
        assert_eq!(root.name(), ".");

        let sub = AxonDirectory::new(
            DirectoryId(1), 
            RelativeAxonPath::from("src/features/auth"), 
            Some(DirectoryId(0))
        );
        assert_eq!(sub.name(), "auth");
    }

    #[test]
    fn test_child_registration_idempotency() {
        let mut dir = AxonDirectory::new_root(DirectoryId(0));
        let child_id = DirectoryId(1);
        let file_id = FileId(10);

        // Add once
        dir.add_dir(child_id);
        dir.add_file(file_id);
        
        // Add again (should be ignored)
        dir.add_dir(child_id);
        dir.add_file(file_id);

        assert_eq!(dir.child_dirs().len(), 1);
        assert_eq!(dir.child_files().len(), 1);
    }

    #[test]
    fn test_is_empty() {
        let mut dir = AxonDirectory::new_root(DirectoryId(0));
        assert!(dir.is_empty());

        dir.add_file(FileId(1));
        assert!(!dir.is_empty());
    }
}