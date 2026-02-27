pub mod source;
pub mod options;
pub mod state;
pub mod node;
pub mod resolver;

use std::{ops::Deref, path::PathBuf};

use crate::tree::options::AxonScanOptions;

/// AxonTree itself (typestate-driven).
#[derive(Debug, Clone)]
pub struct AxonTree<S> {
    pub core: AxonTreeCore,
    pub state: S,
}

/// Internal: core config shared across states.
#[derive(Debug, Clone)]
pub struct AxonTreeCore {
    pub root: PathBuf,
    pub scan: AxonScanOptions,
}

impl<S> Deref for AxonTree<S> {
    type Target = S;
    fn deref(&self) -> &Self::Target {
        &self.state
    }
}

impl<S> AxonTree<S> {
    pub fn options(&self) -> &AxonScanOptions {
        &self.core.scan
    }
}