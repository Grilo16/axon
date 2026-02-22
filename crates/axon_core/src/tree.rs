pub mod source;
pub mod options;
pub mod state;
pub mod node;

use std::{ops::Deref, path::PathBuf};

use crate::tree::options::AxonScanOptions;

/// AxonTree itself (typestate-driven).
#[derive(Debug, Clone)]
pub struct AxonTree<S> {
    core: AxonTreeCore,
    state: S,
}

/// Internal: core config shared across states.
#[derive(Debug, Clone)]
struct AxonTreeCore {
    root: PathBuf,
    scan: AxonScanOptions,
}

impl<S> Deref for AxonTree<S> {
    type Target = S;
    fn deref(&self) -> &Self::Target {
        &self.state
    }
}