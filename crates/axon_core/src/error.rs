use thiserror::Error;
use std::path::PathBuf;

#[derive(Error, Debug)]
pub enum AxonError {
    #[error("Failed to read file '{path}': {source}")]
    ReadFile {
        path: PathBuf,
        source: std::io::Error,
    },

    #[error("JSON Parsing error: {0}")]
    JsonParse(#[from] serde_json::Error),

    #[error("Could not determine parent directory for '{0}'")]
    NoParentDir(PathBuf),

    #[error("Path canonicalization failed for '{path}': {source}")]
    InvalidPath {
        path: PathBuf,
        source: std::io::Error,
    },

    #[error("Analysis error: {0}")]
    Analysis(String),
    
    #[error("Unknown error")]
    Unknown,
}

// A handy alias for Result<T, AxonError>
pub type Result<T> = std::result::Result<T, AxonError>;