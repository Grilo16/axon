use crate::ids::{DirectoryId, FileId, SymbolId};
use crate::path::RelativeAxonPath;
use std::path::PathBuf;
use serde::{Serialize, Serializer};
use thiserror::Error;
use ts_rs::TS;

#[derive(Debug, Error, Serialize, TS)] // Add Serialize here
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
#[ts(export_to = "error.ts", rename_all = "camelCase")]
pub enum AxonError {
    // --- 1. IO & Filesystem (The "Standard" stuff) ---
    #[error("IO failure at '{path}': {source}")]
    Io {
        path: PathBuf,
        #[serde(serialize_with = "serialize_error_string")]
        #[ts(as = "String")]
        source: std::io::Error,
    },

    #[error("JSON error: {0}")]
    Json(
        #[from]
        #[serde(serialize_with = "serialize_error_string")]
        #[ts(as = "String")]
        serde_json::Error
    ),

    #[error("walk error: {0}")]
    Walk(
        #[from]
        #[serde(serialize_with = "serialize_error_string")]
        #[ts(as = "String")]
        ignore::Error
    ),

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
}

/// The default Result type for the entire Axon crate.
pub type AxonResult<T> = std::result::Result<T, AxonError>;

impl AxonError {
    /// Ergonomic helper for IO errors with context.
    pub fn io(source: std::io::Error, path: impl Into<PathBuf>) -> Self {
        Self::Io {
            path: path.into(),
            source,
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
/// or is handled elsewhere.
impl From<std::io::Error> for AxonError {
    fn from(err: std::io::Error) -> Self {
        Self::Backend(err.to_string())
    }
}

fn serialize_error_string<E, S>(err: &E, serializer: S) -> Result<S::Ok, S::Error>
where
    E: std::fmt::Display,
    S: Serializer,
{
    serializer.serialize_str(&err.to_string())
}