#![allow(unused_imports)]

pub use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
pub use axum_keycloak_auth::decode::KeycloakToken;
pub use tracing::{debug, error, info, instrument, warn};

pub use crate::state::AppState;
pub use crate::api::extractor::AuthContext;
pub use axon_core::error::{AxonError, AxonResult};

/// Rejects paths containing traversal segments (`..`) to prevent directory escape.
pub fn validate_user_path(path: &str) -> AxonResult<()> {
    if path.split('/').any(|seg| seg == "..") {
        return Err(AxonError::Parse {
            path: path.into(),
            message: "Path traversal ('..') is not allowed".into(),
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_path_accepted() {
        assert!(validate_user_path("src/components/App.tsx").is_ok());
    }

    #[test]
    fn root_path_accepted() {
        assert!(validate_user_path("").is_ok());
    }

    #[test]
    fn deeply_nested_path_accepted() {
        assert!(validate_user_path("a/b/c/d/e/f/g.ts").is_ok());
    }

    #[test]
    fn traversal_at_start_rejected() {
        let err = validate_user_path("../etc/passwd").unwrap_err();
        assert!(matches!(err, AxonError::Parse { .. }));
    }

    #[test]
    fn traversal_in_middle_rejected() {
        let err = validate_user_path("src/../../secrets").unwrap_err();
        assert!(matches!(err, AxonError::Parse { .. }));
    }

    #[test]
    fn traversal_at_end_rejected() {
        let err = validate_user_path("src/..").unwrap_err();
        assert!(matches!(err, AxonError::Parse { .. }));
    }

    #[test]
    fn double_dot_in_filename_is_allowed() {
        // "file..ts" is NOT a traversal — only bare ".." segments are
        assert!(validate_user_path("src/file..ts").is_ok());
    }

    #[test]
    fn triple_dot_segment_is_allowed() {
        // "..." is not ".." — only exact ".." match is rejected
        assert!(validate_user_path("src/.../file.ts").is_ok());
    }
}
