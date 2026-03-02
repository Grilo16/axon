mod api;
mod infrastructure;
mod state;

use axum::http::header::{CONTENT_TYPE, AUTHORIZATION};
use axum::http::Method;
use axum_keycloak_auth::{
    PassthroughMode, Url, instance::{KeycloakAuthInstance, KeycloakConfig}, layer::KeycloakAuthLayer
};
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
    match dotenvy::dotenv() {
        Ok(_) => println!("✅ Loaded .env file successfully"),
        Err(_) => println!("⚠️ No .env file found. Relying on system environment variables."),
    }
    tracing_subscriber::fmt::init();
    info!("🚀 Starting Axon Server...");

    // 2. Initialize Database Connection
    let pool = init_db_pool().await;
    info!("✅ Connected to Postgres database.");
    sqlx::migrate!("./migrations") // Path to your migrations folder
    .run(&pool)
    .await.unwrap();
    // 3. Instantiate Repositories
    // We wrap them in Arc so they can be safely shared across thousands of async threads.
    let workspace_repo = Arc::new(PostgresWorkspaceRepo::new(pool.clone()));
    let bundle_repo = Arc::new(PostgresBundleRepo::new(pool.clone()));

    // 4. Build Application State
    let state = AppState::new(workspace_repo, bundle_repo);

    let cors = CorsLayer::new()
        // Allow your Vite dev server
        .allow_origin(
            "http://localhost:5173"
                .parse::<axum::http::HeaderValue>()
                .unwrap(),
        )
        // Allow the exact methods your frontend will use
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        // Allow the Content-Type header so JSON bodies pass through
        .allow_headers([CONTENT_TYPE, AUTHORIZATION]);


    let kc_config = KeycloakConfig::builder()
        .server(Url::parse("http://keycloak:8080/").expect("Invalid Keycloak URL"))
        .realm(String::from("axon"))
        .build();

    let keycloak_instance = KeycloakAuthInstance::new(kc_config);
    
    // Make sure this matches the client ID you created in Keycloak!
    let expected_audiences = vec!["axon-server".to_string()]; 

    // 2. Build the Auth Layer
    let auth_layer = KeycloakAuthLayer::<String>::builder()
        .instance(keycloak_instance)
        .passthrough_mode(PassthroughMode::Block) 
        .expected_audiences(expected_audiences)
        .build();

    // 3. Apply the layers
    // Important: CORS MUST wrap the outside of Auth, or preflight requests will be blocked!
    let app = app_router(state).layer(auth_layer).layer(cors);

    // 6. Start TCP Listener
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();

    info!("📡 Server listening on http://{}", addr);

    // 7. Serve!
    axum::serve(listener, app).await.unwrap();
}

// docker compose -f /root/axon-project/infra/docker-compose.prod.yaml logs -f
// docker compose -f /root/axon-project/infra/docker-compose.prod.yaml down
// docker compose -f /root/axon-project/infra/docker-compose.prod.yaml up -d 

// nano /root/axon-project/infra/docker-compose.prod.yaml
// nano /root/axon-project/infra/Caddyfile
// nano /root/axon-project/infra/.env


