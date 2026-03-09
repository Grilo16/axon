use axum::{routing::{get, post}, Router};
use axum_keycloak_auth::layer::KeycloakAuthLayer; // 🌟 Import the layer type
use crate::state::AppState;

pub mod prelude;
pub mod engine;
pub mod extractor;
pub mod workspace;
pub mod bundle;
pub mod public;

// 🌟 Accept the auth_layer as a parameter
pub fn app_router(state: AppState, auth_layer: KeycloakAuthLayer<String>) -> Router {
    
    // 1. SECURE WORKSPACE ROUTER
    let ws_router = Router::new()
        .route("/", get(workspace::list_workspaces).post(workspace::create_workspace))
        .route("/:id", get(workspace::get_workspace).patch(workspace::update_workspace).delete(workspace::delete_workspace))
        .route("/:id/files", get(workspace::get_all_file_paths))
        .route("/:id/files/dir", get(workspace::get_file_paths_by_dir))
        .route("/:id/files/read", get(workspace::read_file))
        .route("/:id/explorer", get(workspace::list_directory))
        .route("/:workspace_id/bundles", get(bundle::get_workspace_bundles))
        .route("/:id/search", get(workspace::search_files));

    // 2. SECURE BUNDLE ROUTER
    let bundle_router = Router::new()
        .route("/", post(bundle::create_bundle))
        .route("/:id", get(bundle::get_bundle).patch(bundle::update_bundle).delete(bundle::delete_bundle))
        .route("/:id/clone", post(bundle::clone_bundle))
        .route("/:id/graph", get(bundle::get_bundle_graph))
        .route("/:id/generate", get(bundle::generate_bundle_handler));

    // 3. STATELESS PUBLIC ROUTER
    let public_router = Router::new()
        .route("/workspaces", get(public::list_public_workspaces))
        .route("/workspaces/:id/files", get(public::get_all_file_paths))
        .route("/workspaces/:id/files/dir", get(public::get_file_paths_by_dir))
        .route("/workspaces/:id/files/read", get(public::read_file))
        .route("/workspaces/:id/explorer", get(public::list_directory))
        .route("/bundles/validate", post(public::validate_public_options))
        .route("/bundles/graph", post(public::generate_public_graph))
        .route("/bundles/generate", post(public::generate_public_code));

    // ==========================================
    // 4. MASTER ASSEMBLY & BOUNDARIES
    // ==========================================
    
    // Group the private routes together and apply the Keycloak bouncer ONLY to them
    let protected_routes = Router::new()
        .nest("/workspaces", ws_router)
        .nest("/bundles", bundle_router)
        .layer(auth_layer);

    Router::new()
        .nest("/api/v1", protected_routes)
        .nest("/api/v1/public", public_router)
        .with_state(state) 
}