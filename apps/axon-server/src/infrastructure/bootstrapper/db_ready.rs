use std::{path::Path, sync::Arc};
use axon_core::error::{AxonError, AxonResult};
use axum::http::{Method, header::{AUTHORIZATION, CONTENT_TYPE}};
use axum_keycloak_auth::{
    PassthroughMode, 
    instance::{KeycloakAuthInstance, KeycloakConfig}, 
    layer::KeycloakAuthLayer
};
use chrono::Utc;
use tower_http::cors::CorsLayer;
use tracing::{info, instrument};
use uuid::Uuid;

use crate::api::app_router;
use crate::state::AppState;
use crate::infrastructure::{
    bootstrapper::Bootstrapper, 
    repositories::{bundle_repo::PostgresBundleRepo, workspace_repo::PostgresWorkspaceRepo}
};

pub struct DbReady {
    pub pool: sqlx::PgPool,
}

impl Bootstrapper<DbReady> {

    #[instrument(skip(self), err)]
    pub async fn seed_public_workspaces(self) -> AxonResult<Self> {
        let pool = &self.state.pool;

        let count_record = sqlx::query!(
            "SELECT COUNT(*) as count FROM workspaces WHERE owner_id = 'system'"
        )
        .fetch_one(pool)
        .await
        .map_err(|e| AxonError::Database(format!("Failed to check system workspaces: {}", e)))?;

        if count_record.count == Some(0) {
            info!("🌱 No public showcases found in DB. Scanning local sandbox_repos...");
            let now = Utc::now().to_rfc3339();

            // Define your local pre-cloned repos here
            let showcases = vec![
                ("Axon Showcase", "./sandbox_repos/axon"),
            ];

            for (name, local_path) in showcases {
                // 🛡️ The Ultimate Guardrail: Don't seed it if it's not physically on disk!
                if Path::new(local_path).exists() {
                    sqlx::query!(
                        r#"
                        INSERT INTO workspaces (id, owner_id, name, project_root, last_opened, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        "#,
                        Uuid::new_v4().to_string(),
                        "system",
                        name,
                        local_path,
                        now, now, now
                    )
                    .execute(pool)
                    .await
                    .map_err(|e| AxonError::Database(format!("Failed to seed {}: {}", name, e)))?;
                    
                    info!("✅ Seeded public workspace: {} -> {}", name, local_path);
                } else {
                    tracing::warn!("⚠️ Skipping seed for '{}': Directory {} does not exist.", name, local_path);
                }
            }
        } else {
            info!("✅ Public showcases already exist in DB. Skipping seed.");
        }

        Ok(self)
    }

    #[instrument(skip(self), err)]
    pub async fn serve(self) -> AxonResult<()> {
        let pool = self.state.pool; 

        let workspace_repo = Arc::new(PostgresWorkspaceRepo::new(pool.clone()));
        let bundle_repo = Arc::new(PostgresBundleRepo::new(pool));

        let state = AppState::new(workspace_repo, bundle_repo);

        let cors = CorsLayer::new()
            .allow_origin(self.config.frontend_url.0.clone())
            .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
            .allow_headers([CONTENT_TYPE, AUTHORIZATION]);

        let kc_config = KeycloakConfig::builder()
            .server(self.config.kc_url.clone())
            .realm(self.config.kc_realm.clone())
            .build();

        let keycloak_instance = KeycloakAuthInstance::new(kc_config);

        let auth_layer = KeycloakAuthLayer::<String>::builder()
            .instance(keycloak_instance)
            .passthrough_mode(PassthroughMode::Block)
            .expected_audiences(vec![self.config.kc_client.0.clone()])
            .build();

        let app = app_router(state, auth_layer).layer(cors);
        let addr = format!("0.0.0.0:{}", self.config.port.0);
        let listener = tokio::net::TcpListener::bind(&addr).await.map_err(|e| {
            AxonError::Startup(format!("Failed to bind TCP listener to {}: {}", addr, e))
        })?;

        info!("📡 Server listening on http://{}", addr);

        axum::serve(listener, app)
            .await
            .map_err(|e| AxonError::Startup(format!("Server crash: {}", e)))?;

        Ok(())
    }
}