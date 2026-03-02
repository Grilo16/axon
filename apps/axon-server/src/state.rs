use std::sync::Arc;
use moka::future::Cache;
use axon_core::{
    domain::workspace::WorkspaceRepository,
    domain::bundle::BundleRepository,
    tree::{state::Analyzed, AxonTree},
};

#[derive(Clone)]
pub struct AppState {
    pub workspace_repo: Arc<dyn WorkspaceRepository>,
    pub bundle_repo: Arc<dyn BundleRepository>,
    pub active_trees: Cache<String, Arc<AxonTree<Analyzed>>>,
}

impl AppState {
    pub fn new(
        workspace_repo: Arc<dyn WorkspaceRepository>,
        bundle_repo: Arc<dyn BundleRepository>
    ) -> Self {
        let active_trees = Cache::builder()
            .time_to_idle(std::time::Duration::from_secs(30 * 60))
            .max_capacity(1000)
            .build();

        Self { workspace_repo, bundle_repo, active_trees }
    }
}