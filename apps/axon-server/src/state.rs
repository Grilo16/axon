use axon_core::{
    domain::{bundle::BundleRepository, workspace::WorkspaceRepository},
    error::{AxonError, AxonResult},
    spool::AxonSpool,
    tree::{state::Analyzed, AxonTree},
};
use moka::future::Cache;
use std::sync::Arc;
use tokio::sync::Semaphore;
use tracing::instrument;

/// Number of git-clone + parse operations allowed to run concurrently.
/// Set to 2 to match the 2 vCPU budget without starving async I/O.
const MAX_CONCURRENT_SCANS: usize = 2;

#[derive(Clone)]
pub struct AppState {
    pub workspace_repo: Arc<dyn WorkspaceRepository>,
    pub bundle_repo: Arc<dyn BundleRepository>,
    pub spool: Arc<AxonSpool>,
    pub admin_user_id: Option<String>,
    pub scan_semaphore: Arc<Semaphore>,
    active_trees: Cache<String, Arc<AxonTree<Analyzed>>>,
}

impl AppState {
    pub fn new(
        workspace_repo: Arc<dyn WorkspaceRepository>,
        bundle_repo: Arc<dyn BundleRepository>,
        spool: Arc<AxonSpool>,
        admin_user_id: Option<String>,
    ) -> Self {
        let active_trees = Cache::builder()
            .time_to_idle(std::time::Duration::from_secs(30 * 60))
            .max_capacity(1000)
            .build();

        Self {
            workspace_repo,
            bundle_repo,
            spool,
            admin_user_id,
            scan_semaphore: Arc::new(Semaphore::new(MAX_CONCURRENT_SCANS)),
            active_trees,
        }
    }

    /// Retrieves an analyzed tree from the cache, or computes it if missing.
    /// Moka ensures that concurrent requests for the same key will coalesce,
    /// preventing the "thundering herd" problem and redundant CPU cycles.
    #[instrument(skip(self, compute_fn), err)]
    pub async fn get_or_compute_tree<F, Fut>(
        &self,
        tree_id: &str,
        compute_fn: F,
    ) -> AxonResult<Arc<AxonTree<Analyzed>>>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = AxonResult<AxonTree<Analyzed>>>,
    {
        let key = tree_id.to_string();

        self.active_trees
            .try_get_with(key, async move {
                let tree = compute_fn().await?;
                Ok::<_, AxonError>(Arc::new(tree))
            })
            .await
            .map_err(|e| AxonError::Backend(format!("Cache computation failed: {}", e)))
    }

    /// Evicts a tree from the in-memory cache, forcing the next access to recompute it.
    pub async fn invalidate_tree(&self, tree_id: &str) {
        self.active_trees.remove(tree_id).await;
    }
}