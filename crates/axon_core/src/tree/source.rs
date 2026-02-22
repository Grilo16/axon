use async_trait::async_trait;
use std::{path::PathBuf, sync::Arc};

use crate::{error::AxonResult, path::RelativeAxonPath};


#[async_trait]
pub trait AxonSource: Send + Sync {
    async fn read_to_string(&self, path: &RelativeAxonPath) -> AxonResult<Arc<str>>;
}

#[derive(Debug, Clone)]
pub struct OsSource {
    root: PathBuf,
}

impl OsSource {
    pub fn new(root: PathBuf) -> Self {
        Self { root }
    }

    fn abs_path(&self, rel: &RelativeAxonPath) -> PathBuf {
        if rel.is_base() {
            self.root.clone()
        } else {
            self.root.join(rel.as_str())
        }
    }
}

#[async_trait]
impl AxonSource for OsSource {
    async fn read_to_string(&self, path: &RelativeAxonPath) -> AxonResult<Arc<str>> {
        let abs = self.abs_path(path);
        let txt = tokio::fs::read_to_string(abs).await?;
        Ok(Arc::<str>::from(txt))
    }
}