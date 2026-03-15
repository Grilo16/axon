pub mod state;
pub mod symbol;

use oxc_span::SourceType;
use serde::{Deserialize, Serialize};

use crate::{
    ids::{DirectoryId, FileId},
    path::RelativeAxonPath,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AxonFile<S> {
    pub(crate) id: FileId,
    pub(crate) path: RelativeAxonPath,
    pub(crate) parent: DirectoryId,
    #[serde(skip)]
    pub(crate) source_type: SourceType,
    pub(crate) state: S,
}

impl<S> AxonFile<S> {
    pub fn id(&self) -> FileId {
        self.id
    }
    pub fn path(&self) -> &RelativeAxonPath {
        &self.path
    }
    pub fn source_type(&self) -> SourceType {
        self.source_type
    }
    pub fn parent_id(&self) -> DirectoryId {
        self.parent
    }
    pub fn name(&self) -> &str {
        self.path.segments().last().unwrap_or("")
    }

    pub(crate) fn transition(
        id: FileId,
        path: RelativeAxonPath,
        parent: DirectoryId,
        source_type: SourceType,
        state: S,
    ) -> Self {
        Self {
            id,
            path,
            parent,
            source_type,
            state,
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::tree::node::file::state::{Found, Read};
    use std::sync::Arc;

    #[test]
    fn test_file_metadata_preservation() {
        let id = FileId(42);
        let path = RelativeAxonPath::from("src/main.rs");
        let parent = DirectoryId(0);
        let st = SourceType::default();

        // 1. Create in 'Found' state
        let file_found = AxonFile::transition(id, path.clone(), parent, st, Found);
        assert_eq!(file_found.id(), id);
        assert_eq!(file_found.name(), "main.rs");

        // 2. Transition to 'Read' state manually
        let file_read = AxonFile::transition(
            file_found.id,
            file_found.path.clone(),
            file_found.parent,
            file_found.source_type,
            Read { content: Arc::from("println!(\"hello\");") }
        );

        // 3. Verify identity is unchanged
        assert_eq!(file_read.id(), id);
        assert_eq!(file_read.path(), &path);
        assert_eq!(file_read.state.content.as_ref(), "println!(\"hello\");");
    }

    #[test]
    fn test_file_name_extraction() {
        let path = RelativeAxonPath::from("a/b/c/deep_file.ts");
        let file = AxonFile::transition(
            FileId(0), 
            path, 
            DirectoryId(0), 
            SourceType::default(), 
            Found
        );
        assert_eq!(file.name(), "deep_file.ts");
    }
}