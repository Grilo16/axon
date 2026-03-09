use axon_core::error::{AxonError, AxonResult};
use axum::http::HeaderValue;
use axum_keycloak_auth::Url;
use std::env;

pub struct Port(pub(crate) u16);
pub struct FrontendUrl(pub(crate) HeaderValue);
pub struct KeycloakClient(pub(crate) String);
pub struct DatabaseUrl(pub(crate) String);

pub struct AppConfig {
    pub port: Port,
    pub frontend_url: FrontendUrl,
    pub db_url: DatabaseUrl, // Added to config
    pub kc_url: Url,
    pub kc_realm: String,
    pub kc_client: KeycloakClient,
}

impl AppConfig {
    pub fn load() -> AxonResult<Self> {
        let port = env::var("PORT_RUST_API")
            .unwrap_or_else(|_| "3000".into())
            .parse::<u16>()
            .map_err(|e| AxonError::Config(format!("Invalid PORT_RUST_API: {}", e)))?;

        let frontend_raw =
            env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".into());
        let frontend_url = frontend_raw
            .parse::<HeaderValue>()
            .map_err(|_| AxonError::Config("Invalid FRONTEND_URL header value".into()))?;

        let db_raw = env::var("DATABASE_URL")
            .map_err(|_| AxonError::Config("DATABASE_URL must be set".into()))?;

        let kc_raw = env::var("KEYCLOAK_URL").unwrap_or_else(|_| "http://localhost:8080".into());
        let kc_url =
            Url::parse(&kc_raw).map_err(|_| AxonError::Config("Invalid Keycloak URL".into()))?;

        let kc_realm = env::var("KC_REALM").unwrap_or_else(|_| "axon".into());
        let kc_client = KeycloakClient(
            env::var("KC_CLIENT_ID")
                .unwrap_or_else(|_| "axon-client".into())
                .trim() 
                .to_string(),
        );

        Ok(Self {
            port: Port(port),
            frontend_url: FrontendUrl(frontend_url),
            db_url: DatabaseUrl(db_raw),
            kc_url,
            kc_realm,
            kc_client,
        })
    }
}
