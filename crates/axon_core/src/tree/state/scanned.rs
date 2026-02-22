use futures::stream::{StreamExt, TryStreamExt};
use crate::{
    error::{AxonError, AxonResult},
    tree::{
        AxonTree, 
        source::AxonSource, 
        state::{Loaded, Scanned, TreeRegistry}
    },
};

impl AxonTree<Scanned> {
    /// Transition: Hydrate all file sources using the provided backend (OS, GitHub, etc).
    pub async fn load_all_sources(self, source: &dyn AxonSource) -> AxonResult<AxonTree<Loaded>> {
        let registry = self.state.0;

        // Process files in parallel with a high concurrency limit
        let hydrated_files = futures::stream::iter(registry.files.into_iter())
            .map(|f| async move {
                let txt = source.read_to_string(f.path()).await?;
                Ok::<_, AxonError>(f.hydrate(txt))
            })
            .buffered(128)
            .try_collect::<Vec<_>>()
            .await?;

        Ok(AxonTree {
            core: self.core,
            state: Loaded(TreeRegistry {
                files: hydrated_files,
                root_dir_id: registry.root_dir_id,
                directories: registry.directories,
                dir_by_path: registry.dir_by_path,
                file_by_path: registry.file_by_path,
            }),
        })
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::tree::node::{AxonDirectory, AxonFile};
    use crate::tree::state::RegistryAccess;
    use crate::ids::{DirectoryId, FileId};
    use crate::path::RelativeAxonPath;
    use crate::tree::node::file::state::Found;
    use crate::tree::options::AxonScanOptions;
    use crate::tree::AxonTreeCore;
    use std::sync::Arc;
    use std::path::PathBuf;
    use std::collections::{HashMap, HashSet};
    use oxc_span::SourceType;

    // --- MOCK SOURCE ---
    struct MockSource {
        should_fail: bool,
    }

    #[async_trait::async_trait]
    impl AxonSource for MockSource {
        async fn read_to_string(&self, path: &RelativeAxonPath) -> AxonResult<Arc<str>> {
            if self.should_fail {
                return Err(AxonError::Backend("Simulated IO Failure".to_string()));
            }
            Ok(Arc::from(format!("source code for {}", path.as_str())))
        }
    }

    // --- HELPER ---
    fn setup_test_scanned_tree() -> AxonTree<Scanned> {
        let root_id = DirectoryId(0);
        let f1_path = RelativeAxonPath::from("a.ts");
        let f1_id = FileId(0);
        
        let file = AxonFile::transition(f1_id, f1_path.clone(), root_id, SourceType::default(), Found);

        let registry = TreeRegistry {
            root_dir_id: root_id,
            directories: vec![AxonDirectory::new_root(root_id)],
            files: vec![file],
            dir_by_path: HashMap::from([(RelativeAxonPath::base(), root_id)]),
            file_by_path: HashMap::from([(f1_path, f1_id)]),
        };

        AxonTree {
            core: AxonTreeCore {
                root: PathBuf::from("/test"),
                scan: AxonScanOptions {
                    allowed_extensions: HashSet::from(["ts".to_string()]),
                },
            },
            state: Scanned(registry),
        }
    }

    // --- TESTS ---

    #[tokio::test]
    async fn test_load_all_sources_success() {
        let tree = setup_test_scanned_tree();
        let source = MockSource { should_fail: false };

        // The transition
        let loaded_tree = tree.load_all_sources(&source).await.expect("Hydration failed");

        // Verify content via the state helper
        let file = loaded_tree.file(FileId(0)).expect("File missing");
        assert_eq!(file.content(), "source code for a.ts");
        
        // Verify we can still find things via path (Trait check)
        assert_eq!(loaded_tree.file_id_by_path("a.ts"), Some(FileId(0)));
    }

    #[tokio::test]
    async fn test_load_all_sources_failure() {
        let tree = setup_test_scanned_tree();
        let source = MockSource { should_fail: true };

        // The transition should fail
        let result = tree.load_all_sources(&source).await;
        
        assert!(result.is_err());
        match result.unwrap_err() {
            AxonError::Backend(msg) => assert_eq!(msg, "Simulated IO Failure"),
            _ => panic!("Expected Backend error"),
        }
    }

    #[tokio::test]
    async fn test_hydration_preserves_ids() {
        let tree = setup_test_scanned_tree();
        let original_root_id = tree.root_dir_id(); // Using deref!
        
        let loaded_tree = tree.load_all_sources(&MockSource { should_fail: false }).await.unwrap();
        
        // ID should remain the same across states
        assert_eq!(loaded_tree.root_dir_id(), original_root_id);
    }
}