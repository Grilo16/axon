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

    #[error("server busy: {0}")]
    Busy(String),

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
            AxonError::Busy(msg) => (StatusCode::TOO_MANY_REQUESTS, msg.clone()),
            AxonError::Parse { .. } | AxonError::UnknownSourceType { .. } | AxonError::OutOfBounds { .. } => {
                (StatusCode::BAD_REQUEST, "Invalid input".to_string())
            }
            AxonError::Config(_) | AxonError::Database(_) | AxonError::Startup(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal infrastructure error".to_string())
            }
            _err => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string()),
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use http_body_util::BodyExt;

    /// Extract the HTTP status code from an AxonError's response.
    async fn status_of(err: AxonError) -> StatusCode {
        err.into_response().status()
    }

    /// Extract the JSON body from an AxonError's response.
    async fn body_of(err: AxonError) -> serde_json::Value {
        let response = err.into_response();
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        serde_json::from_slice(&bytes).unwrap()
    }

    // ==========================================
    // IntoResponse: Status Code Mapping
    // ==========================================

    #[tokio::test]
    async fn not_found_returns_404() {
        let err = AxonError::NotFound { entity: "Workspace", id: "abc".into() };
        assert_eq!(status_of(err).await, StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn auth_returns_401() {
        let err = AxonError::Auth("forbidden".into());
        assert_eq!(status_of(err).await, StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn busy_returns_429() {
        let err = AxonError::Busy("try later".into());
        assert_eq!(status_of(err).await, StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn invalid_range_returns_400() {
        let err = AxonError::InvalidRange { start: 10, end: 5 };
        assert_eq!(status_of(err).await, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn parse_error_returns_400() {
        let err = AxonError::Parse { path: "file.ts".into(), message: "bad".into() };
        assert_eq!(status_of(err).await, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn out_of_bounds_returns_400() {
        let err = AxonError::OutOfBounds { offset: 999 };
        assert_eq!(status_of(err).await, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn database_returns_500() {
        let err = AxonError::Database("connection refused".into());
        assert_eq!(status_of(err).await, StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[tokio::test]
    async fn config_returns_500() {
        let err = AxonError::Config("missing env".into());
        assert_eq!(status_of(err).await, StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[tokio::test]
    async fn backend_returns_500() {
        let err = AxonError::Backend("something broke".into());
        assert_eq!(status_of(err).await, StatusCode::INTERNAL_SERVER_ERROR);
    }

    // ==========================================
    // IntoResponse: JSON Body Structure
    // ==========================================

    #[tokio::test]
    async fn not_found_body_contains_entity_and_id() {
        let err = AxonError::NotFound { entity: "Bundle", id: "xyz-123".into() };
        let body = body_of(err).await;

        let msg = body["error"]["message"].as_str().unwrap();
        assert!(msg.contains("Bundle"), "expected 'Bundle' in message, got: {msg}");
        assert!(msg.contains("xyz-123"), "expected 'xyz-123' in message, got: {msg}");
        assert_eq!(body["error"]["code"], 404);
    }

    #[tokio::test]
    async fn database_error_does_not_leak_internals() {
        let err = AxonError::Database("password=secret host=prod.db".into());
        let body = body_of(err).await;

        let msg = body["error"]["message"].as_str().unwrap();
        assert!(!msg.contains("password"), "DB error leaked sensitive info: {msg}");
        assert!(!msg.contains("prod.db"), "DB error leaked host info: {msg}");
        assert_eq!(msg, "Internal infrastructure error");
    }

    #[tokio::test]
    async fn auth_body_preserves_message() {
        let err = AxonError::Auth("Token expired".into());
        let body = body_of(err).await;
        assert_eq!(body["error"]["message"], "Token expired");
        assert_eq!(body["error"]["code"], 401);
    }

    // ==========================================
    // Helper Constructors
    // ==========================================

    #[test]
    fn is_not_found_returns_true_for_not_found_variant() {
        let err = AxonError::NotFound { entity: "File", id: "1".into() };
        assert!(err.is_not_found());
    }

    #[test]
    fn is_not_found_returns_true_for_root_not_found() {
        let err = AxonError::RootNotFound(PathBuf::from("/missing"));
        assert!(err.is_not_found());
    }

    #[test]
    fn is_not_found_returns_false_for_other_variants() {
        let err = AxonError::Auth("nope".into());
        assert!(!err.is_not_found());
    }

    #[test]
    fn missing_file_constructs_not_found_with_file_entity() {
        let err = AxonError::missing_file(FileId::new(42));
        match err {
            AxonError::NotFound { entity, .. } => assert_eq!(entity, "File"),
            other => panic!("expected NotFound, got: {:?}", other),
        }
    }

    #[test]
    fn missing_dir_constructs_not_found_with_directory_entity() {
        let err = AxonError::missing_dir(DirectoryId::new(7));
        match err {
            AxonError::NotFound { entity, .. } => assert_eq!(entity, "Directory"),
            other => panic!("expected NotFound, got: {:?}", other),
        }
    }

    #[test]
    fn missing_symbol_constructs_not_found_with_symbol_entity() {
        let err = AxonError::missing_symbol(SymbolId::new(0));
        match err {
            AxonError::NotFound { entity, .. } => assert_eq!(entity, "Symbol"),
            other => panic!("expected NotFound, got: {:?}", other),
        }
    }

    // ==========================================
    // From Implementations
    // ==========================================

    #[test]
    fn io_error_converts_to_backend() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file gone");
        let axon_err: AxonError = io_err.into();
        assert!(matches!(axon_err, AxonError::Backend(msg) if msg.contains("file gone")));
    }

    #[test]
    fn serde_error_converts_to_json() {
        let serde_err = serde_json::from_str::<serde_json::Value>("not json").unwrap_err();
        let axon_err: AxonError = serde_err.into();
        assert!(matches!(axon_err, AxonError::Json(_)));
    }

    // ==========================================
    // thiserror Display
    // ==========================================

    #[test]
    fn display_not_found_includes_entity_and_id() {
        let err = AxonError::NotFound { entity: "Workspace", id: "w-1".into() };
        let msg = err.to_string();
        assert!(msg.contains("Workspace"), "Display missing entity: {msg}");
        assert!(msg.contains("w-1"), "Display missing id: {msg}");
    }

    #[test]
    fn display_invalid_range_includes_bounds() {
        let err = AxonError::InvalidRange { start: 100, end: 50 };
        let msg = err.to_string();
        assert!(msg.contains("100") && msg.contains("50"), "Display missing bounds: {msg}");
    }
}