use futures::{StreamExt, TryStreamExt};
use crate::{
    error::AxonResult, 
    ids::FileId, 
    parser::AxonParser, 
    tree::{
        AxonTree, 
        state::{Analyzed, Loaded, TreeRegistry}
    }
};

impl Loaded {
    /// Specialized source access for the Loaded state.
    /// Note: RegistryAccess handles the basic file lookup.
    pub fn source(&self, file_id: FileId) -> Option<&str> {
        self.0.files.get(file_id.as_usize()).map(|f| f.content())
    }
}

impl AxonTree<Loaded> {
    pub async fn analyze<P: AxonParser + Sync + Send>(self, parser: &P) -> AxonResult<AxonTree<Analyzed>> {
        let registry = self.state.0;
        
        let analyzed_files = futures::stream::iter(registry.files.into_iter())
            .map(|file| async move {
                file.outline_with(parser) 
            })
            .buffered(64) 
            .try_collect::<Vec<_>>()
            .await?;

        Ok(AxonTree {
            core: self.core,
            state: Analyzed(TreeRegistry {
                root_dir_id: registry.root_dir_id,
                directories: registry.directories,
                files: analyzed_files,
                dir_by_path: registry.dir_by_path,
                file_by_path: registry.file_by_path,
            }),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ids::DirectoryId;
    use crate::path::RelativeAxonPath;
    use crate::tree::node::{AxonDirectory, AxonFile};
    use crate::tree::node::file::state::Read;
    use crate::tree::state::{RegistryAccess, TreeRegistry};
    use oxc_span::SourceType;
    use std::collections::{HashMap, HashSet};
    use std::sync::Arc;

    fn setup_test_tree() -> AxonTree<Loaded> {
        let root_id = DirectoryId(0);
        let path = RelativeAxonPath::from("src/lib.rs");
        let file_id = FileId(0);

        // Use the 'transition' helper instead of 'new' to create a Read file
        let file = AxonFile::transition(
            file_id,
            path.clone(),
            root_id,
            SourceType::default(),
            Read {
                content: Arc::from("fn hello() {}"),
            },
        );

        let mut files = Vec::new();
        files.push(file);

        let mut file_by_path = HashMap::new();
        file_by_path.insert(path, file_id);

        let mut dir_by_path = HashMap::new();
        dir_by_path.insert(RelativeAxonPath::base(), root_id);

        let mut directories = Vec::new();
        directories.push(AxonDirectory::new_root(root_id));

        AxonTree {
            core: crate::tree::AxonTreeCore {
                root: std::path::PathBuf::from("/test"),
                scan: crate::tree::options::AxonScanOptions {
                    // FIX: AxonScanOptions usually expects HashSet<String>
                    allowed_extensions: vec!["rs".to_string()].into_iter().collect::<HashSet<_>>(),
                },
            },
            state: Loaded(TreeRegistry {
                root_dir_id: root_id,
                directories,
                files,
                dir_by_path,
                file_by_path,
            }),
        }
    }

    #[test]
    fn test_deref_ergonomics() {
        let tree = setup_test_tree();
        
        // This works via AxonTree -> Deref -> Loaded -> RegistryAccess
        let id = tree.file_id_by_path("src/lib.rs").expect("Should work via deref");
        assert_eq!(id, FileId(0));
        
        // This works via AxonTree -> Deref -> Loaded -> source()
        let source = tree.source(id).unwrap();
        assert_eq!(source, "fn hello() {}");
    }
}
