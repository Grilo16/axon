pub use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
pub use axum_keycloak_auth::decode::KeycloakToken;
pub use tracing::{info, instrument};

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
