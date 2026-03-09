use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
    Extension,
};
use crate::api::prelude::*;


pub struct AuthContext {
    pub state: AppState,
    pub user_id: String,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthContext {
    type Rejection = AxonError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        // 1. Extract the Keycloak token from the request extensions
        let Extension(token) = Extension::<KeycloakToken<String>>::from_request_parts(parts, state)
            .await
            .map_err(|_| AxonError::Auth("Unauthorized: Missing Keycloak Token".into()))?;

        // 2. Return our beautifully clean context
        Ok(Self {
            state: state.clone(), 
            user_id: token.subject,
        })
    }
}