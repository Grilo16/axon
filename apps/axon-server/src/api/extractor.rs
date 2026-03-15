use axum::{
    async_trait,
    extract::{FromRequestParts, Path},
    http::request::Parts,
    Extension,
};
use crate::api::prelude::*;
use axon_core::domain::{workspace::WorkspaceRecord, bundle::BundleRecord};

pub struct AuthContext {
    pub state: AppState,
    pub user_id: String,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthContext {
    type Rejection = AxonError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let Extension(token) = Extension::<KeycloakToken<String>>::from_request_parts(parts, state)
            .await
            .map_err(|_| AxonError::Auth("Unauthorized: Missing Keycloak Token".into()))?;

        Ok(Self {
            state: state.clone(), 
            user_id: token.subject,
        })
    }
}

// ==========================================
// 🛡️ TYPE-STATE: VERIFIED WORKSPACE
// ==========================================

pub struct VerifiedWorkspace(pub WorkspaceRecord);

#[async_trait]
impl FromRequestParts<AppState> for VerifiedWorkspace {
    type Rejection = AxonError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        // 1. Ensure the user is authenticated
        let ctx = AuthContext::from_request_parts(parts, state).await?;

        // 2. Extract the ID from the URL path (e.g., /workspaces/:id)
        let Path(id) = Path::<String>::from_request_parts(parts, state)
            .await
            .map_err(|_| AxonError::Parse { 
                path: "URL Path".into(), 
                message: "Missing workspace ID in route".into() 
            })?;

        // 3. Query DB and prove ownership
        let record = state.workspace_repo.get_by_id_and_owner(&id, &ctx.user_id)
            .await?
            .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id })?;

        Ok(Self(record))
    }
}

// ==========================================
// 🛡️ TYPE-STATE: VERIFIED BUNDLE
// ==========================================

pub struct VerifiedBundle(pub BundleRecord);

#[async_trait]
impl FromRequestParts<AppState> for VerifiedBundle {
    type Rejection = AxonError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let ctx = AuthContext::from_request_parts(parts, state).await?;

        let Path(id) = Path::<String>::from_request_parts(parts, state)
            .await
            .map_err(|_| AxonError::Parse { 
                path: "URL Path".into(), 
                message: "Missing bundle ID in route".into() 
            })?;

        let bundle = state.bundle_repo.get_by_id(&id)
            .await?
            .ok_or_else(|| AxonError::NotFound { entity: "Bundle", id: id.clone() })?;

        // Ensure the user actually owns the workspace this bundle belongs to
        let _ = state.workspace_repo.get_by_id_and_owner(&bundle.workspace_id, &ctx.user_id)
            .await?
            .ok_or_else(|| AxonError::Auth("User does not own this bundle's workspace".into()))?;

        Ok(Self(bundle))
    }
}