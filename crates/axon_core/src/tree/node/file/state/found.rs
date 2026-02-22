use std::sync::Arc;

use crate::tree::node::{
    file::state::{Found, Read},
    AxonFile,
};

impl AxonFile<Found> {
    /// Found -> Read: Injects the actual source code into the file.
    pub fn hydrate(self, content: Arc<str>) -> AxonFile<Read> {
        AxonFile::transition(
            self.id,
            self.path,
            self.parent,
            self.source_type,
            Read { content },
        )
    }
}

#[cfg(test)]
mod tests {
    use oxc_span::SourceType;

    use super::*;
    use crate::{ids::{DirectoryId, FileId}, path::RelativeAxonPath};

    #[test]
    fn test_hydration_transition() {
        let id = FileId(10);
        let path = RelativeAxonPath::from("lib.rs");
        let parent = DirectoryId(0);
        let st = SourceType::default();

        // Create Found state manually for test
        let file_found = AxonFile::transition(id, path.clone(), parent, st, Found);

        let content = Arc::<str>::from("pub fn axon() {}");
        let file_read = file_found.hydrate(content.clone());

        assert_eq!(file_read.id(), id);
        assert_eq!(file_read.content(), "pub fn axon() {}");
        // Verify zero-copy hydration
        assert!(Arc::ptr_eq(&file_read.state.content, &content));
    }
}
