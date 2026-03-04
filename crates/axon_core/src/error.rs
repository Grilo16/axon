use crate::ids::{DirectoryId, FileId, SymbolId};
use crate::path::RelativeAxonPath;
use std::path::PathBuf;
use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde::{Serialize};
use serde_json::json;
use thiserror::Error;
use ts_rs::TS;

#[derive(Debug, Error, Serialize, TS)] 
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
#[ts(export_to = "error.ts", rename_all = "camelCase")]
pub enum AxonError {
    // --- 1. IO & Filesystem (The "Standard" stuff) ---
   #[error("IO failure at '{path}': {message}")]
    Io {
        path: PathBuf,
        message: String, 
    },

    #[error("JSON error: {0}")]
    Json(String), 

    #[error("walk error: {0}")]
    Walk(String), 


    #[error("root path does not exist: {0}")]
    RootNotFound(PathBuf),

    #[error("root path is not a directory: {0}")]
    RootNotDirectory(PathBuf),

    // --- 2. Path & Integrity (The "Tree" stuff) ---
    #[error("path is not valid utf-8: {0}")]
    NonUtf8Path(PathBuf),

    #[error("failed to strip prefix root={root} from path={path}")]
    StripPrefix { root: PathBuf, path: PathBuf },

    #[error("invalid path segment: {0}")]
    InvalidPathSegment(String),

    #[error("Unsupported path component '{component}' in path: {path}")]
    UnsupportedPath { component: String, path: PathBuf },

    #[error("too many items: {0}")]
    Overflow(String),

    #[error("missing {entity} with ID: {id}")]
    NotFound { entity: &'static str, id: String },

    // --- 3. Parsing & Semantic (The "Oxc/JS" stuff) ---
    #[error("failed to determine SourceType for {path}: {reason}")]
    UnknownSourceType {
        path: RelativeAxonPath,
        reason: String,
    },

    #[error("parse failure in {path}: {message}")]
    Parse {
        path: RelativeAxonPath,
        message: String,
    },

    #[error("invalid text range: start {start} > end {end}")]
    InvalidRange { start: u32, end: u32 },

    #[error("byte offset {offset} is out of bounds for source text")]
    OutOfBounds { offset: u32 },

    // --- 4. Backend (The "OsSource" stuff) ---
    #[error("source backend error: {0}")]
    Backend(String),

    #[error("authentication error: {0}")]
    Auth(String),

    #[error("network error: {0}")]
    Network(String),

    #[error("tauri ipc execution error: {0}")]
    TauriIpc(String),
}

/// The default Result type for the entire Axon crate.
pub type AxonResult<T> = std::result::Result<T, AxonError>;

impl AxonError {
    /// Ergonomic helper for IO errors with context.
    pub fn io(message: std::io::Error, path: impl Into<PathBuf>) -> Self {
        Self::Io {
            path: path.into(),
            message: message.to_string(),
        }
    }

    /// Quick check for "Not Found" style errors.
    pub fn is_not_found(&self) -> bool {
        matches!(self, Self::RootNotFound(_) | Self::NotFound { .. })
    }

    /// Factory for Directory/File/Symbol lookup failures.
    pub fn missing_file(id: FileId) -> Self {
        Self::NotFound {
            entity: "File",
            id: format!("{:?}", id),
        }
    }

    pub fn missing_dir(id: DirectoryId) -> Self {
        Self::NotFound {
            entity: "Directory",
            id: format!("{:?}", id),
        }
    }

    pub fn missing_symbol(id: SymbolId) -> Self {
        Self::NotFound {
            entity: "Symbol",
            id: format!("{:?}", id),
        }
    }
}

/// Allows easy conversion from standard IO errors when the path isn't immediately critical
impl From<std::io::Error> for AxonError {
    fn from(err: std::io::Error) -> Self {
        Self::Backend(err.to_string())
    }
}

impl From<serde_json::Error> for AxonError {
    fn from(err: serde_json::Error) -> Self {
        AxonError::Json(err.to_string())
    }
}

impl From<ignore::Error> for AxonError {
    fn from(err: ignore::Error) -> Self {
        AxonError::Walk(err.to_string())
    }
}


impl IntoResponse for AxonError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AxonError::NotFound { entity, id } => (
                StatusCode::NOT_FOUND,
                format!("{} '{}' not found", entity, id),
            ),
            AxonError::InvalidRange { .. } => (
                StatusCode::BAD_REQUEST,
                "Invalid text range provided".to_string(),
            ),
            AxonError::Backend(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                msg,
            ),
            // Map any other core errors here...
            err => (
                StatusCode::INTERNAL_SERVER_ERROR,
                err.to_string(),
            ),
        };

        let body = Json(json!({
            "error": {
                "message": error_message,
                "code": status.as_u16()
            }
        }));

        (status, body).into_response()
    }
}