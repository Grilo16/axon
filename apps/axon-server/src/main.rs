mod api;
mod infrastructure;
mod state;

use axum::http::header::{AUTHORIZATION, CONTENT_TYPE};
use axum::http::{HeaderValue, Method};
use axum_keycloak_auth::{
    instance::{KeycloakAuthInstance, KeycloakConfig},
    layer::KeycloakAuthLayer,
    PassthroughMode, Url,
};
use std::path;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing::info;

use crate::api::app_router;
use crate::infrastructure::db::init_db_pool;
use crate::infrastructure::repositories::{
    bundle_repo::PostgresBundleRepo, workspace_repo::PostgresWorkspaceRepo,
};
use crate::state::AppState;

#[tokio::main]
async fn main() {
    let run_mode = std::env::var("RUN_MODE").unwrap_or_else(|_| "dev".to_string());

    if run_mode == "dev" {
        let env_path = path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../infra/dev/.env");

        match dotenvy::from_path(&env_path) {
            Ok(_) => println!("✅ Loaded dev .env file from {:?}", env_path),
            Err(e) => println!("⚠️ Could not load dev .env file: {}", e),
        }
    } else {
        println!(
            "🚀 Running in {} mode. Relying entirely on Docker-injected variables.",
            run_mode
        );
    }
    tracing_subscriber::fmt::init();
    info!("🚀 Starting Axon Server...");

    // 2. Initialize Database Connection
    let pool = init_db_pool().await;
    info!("✅ Connected to Postgres database.");
    sqlx::migrate!("./migrations") // Path to your migrations folder
        .run(&pool)
        .await
        .unwrap();

    let frontend_url =
        std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".into());
    let workspace_repo = Arc::new(PostgresWorkspaceRepo::new(pool.clone()));
    let bundle_repo = Arc::new(PostgresBundleRepo::new(pool.clone()));

    // 4. Build Application State
    let state = AppState::new(workspace_repo, bundle_repo);

    let cors = CorsLayer::new()
        .allow_origin(frontend_url.parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION]);

    let kc_url = std::env::var("KEYCLOAK_URL").unwrap_or_else(|_| "http://localhost:8080".into());
    let kc_realm = std::env::var("KC_REALM").unwrap_or_else(|_| "axon".into());

    let kc_config = KeycloakConfig::builder()
        .server(Url::parse(&kc_url).expect("Invalid Keycloak URL"))
        .realm(kc_realm)
        .build();

    let keycloak_instance = KeycloakAuthInstance::new(kc_config);

    // Make sure this matches the client ID you created in Keycloak!
    let expected_audiences =
        vec![std::env::var("KC_CLIENT_ID").unwrap_or_else(|_| "axon-server".into())];

    let auth_layer = KeycloakAuthLayer::<String>::builder()
        .instance(keycloak_instance)
        .passthrough_mode(PassthroughMode::Block)
        .expected_audiences(expected_audiences)
        .build();

    // 3. Apply the layers
    // Important: CORS MUST wrap the outside of Auth, or preflight requests will be blocked!
    let app = app_router(state).layer(auth_layer).layer(cors);

    let port = std::env::var("PORT_RUST_API").unwrap_or_else(|_| "3000".into());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();

    info!("📡 Server listening on http://{}", addr);

    // 7. Serve!
    axum::serve(listener, app).await.unwrap();
}
