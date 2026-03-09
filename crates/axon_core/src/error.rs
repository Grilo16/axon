use crate::ids::{DirectoryId, FileId, SymbolId};
use crate::path::RelativeAxonPath;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;
use serde_json::json;
use std::path::PathBuf;
use thiserror::Error;
use ts_rs::TS;

#[derive(Debug, Error, Serialize, TS)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
#[ts(export_to = "error.ts", rename_all = "camelCase")]
pub enum AxonError {
    // --- 0. Infrastructure & Bootstrapping ---
    #[error("configuration error: {0}")]
    Config(String),

    #[error("database error: {0}")]
    #[serde(skip)] // SQLx errors often contain sensitive DB info; hide from frontend
    Database(String),

    #[error("server startup error: {0}")]
    Startup(String),

    // --- 1. IO & Filesystem ---
    #[error("IO failure at '{path}': {message}")]
    Io { path: PathBuf, message: String },

    #[error("JSON error: {0}")]
    Json(String),

    #[error("walk error: {0}")]
    Walk(String),

    #[error("root path does not exist: {0}")]
    RootNotFound(PathBuf),

    #[error("root path is not a directory: {0}")]
    RootNotDirectory(PathBuf),

    // --- 2. Path & Integrity ---
    #[error("path is not valid utf-8: {0}")]
    NonUtf8Path(PathBuf),

    #[error("failed to strip prefix root={root} from path={path}")]
    StripPrefix { root: PathBuf, path: PathBuf },

    #[error("invalid path segment: {0}")]
    InvalidPathSegment(String),

    #[error("unsupported path component '{component}' in path: {path}")]
    UnsupportedPath { component: String, path: PathBuf },

    #[error("too many items: {0}")]
    Overflow(String),

    #[error("missing {entity} with ID: {id}")]
    NotFound { entity: &'static str, id: String },

    // --- 3. Parsing & Semantic ---
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

    // --- 4. Backend ---
    #[error("source backend error: {0}")]
    Backend(String),

    #[error("authentication error: {0}")]
    Auth(String),

    #[error("network error: {0}")]
    Network(String),

    #[error("tauri ipc execution error: {0}")]
    TauriIpc(String),
}

pub type AxonResult<T> = std::result::Result<T, AxonError>;

impl AxonError {
    pub fn io(message: std::io::Error, path: impl Into<PathBuf>) -> Self {
        Self::Io {
            path: path.into(),
            message: message.to_string(),
        }
    }

    pub fn is_not_found(&self) -> bool {
        matches!(self, Self::RootNotFound(_) | Self::NotFound { .. })
    }

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

impl From<sqlx::Error> for AxonError {
    fn from(err: sqlx::Error) -> Self {
        AxonError::Database(err.to_string())
    }
}

impl IntoResponse for AxonError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AxonError::NotFound { entity, id } => {
                (StatusCode::NOT_FOUND, format!("{} '{}' not found", entity, id))
            }
            AxonError::InvalidRange { .. } => {
                (StatusCode::BAD_REQUEST, "Invalid text range provided".to_string())
            }
            AxonError::Auth(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AxonError::Config(_) | AxonError::Database(_) | AxonError::Startup(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal infrastructure error".to_string())
            }
            err => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
        };

        // Log the actual internal error for telemetry, while returning a safe message to the client
        tracing::error!("Request failed: {:?}", self);

        let body = Json(json!({
            "error": {
                "message": error_message,
                "code": status.as_u16()
            }
        }));

        (status, body).into_response()
    }
}