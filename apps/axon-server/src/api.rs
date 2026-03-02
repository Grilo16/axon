use axum::{routing::{get, post}, Router};

use crate::state::AppState;

pub mod workspace;
pub mod bundle;

pub fn app_router(state: AppState) -> Router {
    let ws_router = Router::new()

    .route("/", get(workspace::list_workspaces).post(workspace::create_workspace))
        .route("/:id", get(workspace::get_workspace).patch(workspace::update_workspace).delete(workspace::delete_workspace))
        .route("/:id/touch", post(workspace::touch_workspace))
        
        // Active Tree Operations
        .route("/:id/load", post(workspace::load_github_workspace_ast))
        .route("/:id/status", get(workspace::workspace_status))
        .route("/:id/files", get(workspace::get_all_file_paths))
        .route("/:id/files/dir", get(workspace::get_file_paths_by_dir))
        .route("/:id/files/read", get(workspace::read_file))
        .route("/:id/explorer", get(workspace::list_directory))
        
        // Relational
        .route("/:id/bundles", get(bundle::get_workspace_bundles));

    let bundle_router = Router::new()
        // Core CRUD
        .route("/", post(bundle::create_bundle))
        .route("/:id", get(bundle::get_bundle).patch(bundle::update_bundle).delete(bundle::delete_bundle))
        .route("/:id/clone", post(bundle::clone_bundle))
        
        // Generation
        .route("/:id/generate", post(bundle::generate_bundle_handler))
        .route("/:id/graph", get(bundle::get_bundle_graph));

    Router::new()
        .nest("/api/v1/workspaces", ws_router)
        .nest("/api/v1/bundles", bundle_router)
        .with_state(state) 
}