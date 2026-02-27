use std::sync::Arc;
use tokio::sync::RwLock;
use axon_core::tree::{AxonTree, state::Analyzed};

pub struct AxonAppState {
    pub tree_cache: RwLock<Option<Arc<AxonTree<Analyzed>>>>,
}

impl AxonAppState {
    pub fn new() -> Self {
        Self {
            tree_cache: RwLock::new(None),
        }
    }
}