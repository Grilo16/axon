use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json, Extension,
};
use axum_keycloak_auth::decode::KeycloakToken;
use chrono::Utc;
use serde_json::json;
use std::{sync::Arc};
use tracing::{info, instrument};
use uuid::Uuid;

use crate::state::AppState;
use axon_core::{
    domain::workspace::{CreateWorkspaceReq, DirQuery, FileQuery, ListWorkspacesQuery, ReadFileReq, UpdateWorkspacePayload, WorkspaceRecord},
    error::{AxonError, AxonResult},
    explorer::{ExplorerEntry, TreeExplorer},
    parser::javascript::JsTsParser,
    tree::{AxonTree, options::AxonScanOptions, source::OsSource, state::Analyzed},
};

pub async fn create_workspace(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, 
    Json(payload): Json<CreateWorkspaceReq>,
) -> AxonResult<Json<WorkspaceRecord>> {
    let now = Utc::now().to_rfc3339();
    let record = WorkspaceRecord {
        id: Uuid::new_v4().to_string(),
        owner_id: token.subject.clone(),
        name: payload.name,
        project_root: payload.project_root,
        last_opened: now.clone(),
        created_at: now.clone(),
        updated_at: now,
    };

    state.workspace_repo.create(record.clone()).await?;

    info!("👤 User {} created workspace: {}", token.subject, record.id);
    Ok(Json(record))
}

pub async fn get_workspace(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
) -> AxonResult<Json<WorkspaceRecord>> {
    let record = state.workspace_repo.get_by_id_and_owner(&id, &token.subject).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace".into(), id: id.clone() })?;

    Ok(Json(record))
}

pub async fn list_workspaces(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Query(query): Query<ListWorkspacesQuery>,
) -> AxonResult<Json<Vec<WorkspaceRecord>>> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    let records = state.workspace_repo.list_for_user(&token.subject, limit, offset).await?;

    Ok(Json(records))
}

pub async fn update_workspace(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
    Json(payload): Json<UpdateWorkspacePayload>,
) -> AxonResult<StatusCode> {
    state.workspace_repo.update(&id, &token.subject, payload).await?;
    Ok(StatusCode::OK)
}

pub async fn touch_workspace(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
) -> AxonResult<StatusCode> {
    state.workspace_repo.touch(&id, &token.subject).await?;
    Ok(StatusCode::OK)
}

pub async fn delete_workspace(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
) -> AxonResult<StatusCode> {
    state.workspace_repo.delete(&id, &token.subject).await?;
    Ok(StatusCode::OK)
}

// ==========================================
// 2. ACTIVE TREE ENGINE SECURE HELPER
// ==========================================

/// 🔐 Helper to verify DB Ownership BEFORE grabbing the active tree from RAM cache
async fn get_active_tree(state: &AppState, workspace_id: &str, user_id: &str) -> AxonResult<Arc<AxonTree<Analyzed>>> {
    // 1. Verify Ownership in Postgres
    let _workspace = state.workspace_repo.get_by_id_and_owner(workspace_id, user_id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace".into(), id: workspace_id.to_string() })?;

    // 2. Fetch from RAM
    state.active_trees.get(workspace_id).await
        .ok_or_else(|| AxonError::Backend(format!("Workspace {} is not loaded in RAM!", workspace_id)))
}

// ==========================================
// 3. ENGINE HANDLERS
// ==========================================

#[instrument(skip(state))]
pub async fn workspace_status(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
) -> AxonResult<axum::Json<serde_json::Value>> {
    // Optional: Could verify DB ownership here too, but checking cache presence is fairly safe
    let is_loaded = state.active_trees.contains_key(&id);
    Ok(axum::Json(json!({ "workspace_id": id, "is_loaded": is_loaded })))
}

#[instrument(skip(state))]
pub async fn load_github_workspace_ast(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
) -> AxonResult<StatusCode> {
    if state.active_trees.contains_key(&id) {
        tracing::info!("Workspace {} is already loaded in memory. Skipping clone.", id);
        return Ok(StatusCode::OK); // Early return, success!
    }
    // 🔐 Verify Ownership before loading!
    let workspace = state.workspace_repo.get_by_id_and_owner(&id, &token.subject).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace".into(), id: id.clone() })?;
        
    info!("🔄 Loading GitHub workspace '{}': {}", workspace.name, workspace.project_root);

    let shared_tree = tokio::task::spawn_blocking(move || {
        let temp_dir = tempfile::Builder::new().prefix("axon_git_").tempdir().map_err(|e| AxonError::Backend(e.to_string()))?;
        let temp_path = temp_dir.path().to_path_buf();
        
        let status = std::process::Command::new("git")
            .args(["clone", "--depth", "1", &workspace.project_root])
            .arg(&temp_path).status().map_err(|e| AxonError::Backend(e.to_string()))?;

        if !status.success() { return Err(AxonError::Backend("Git clone failed.".into())); }

        let options = AxonScanOptions::auto_detect(&temp_path);
        let parser = JsTsParser;
        let source_manager = OsSource::new(temp_path.clone());

        let analyzed_tree = tokio::runtime::Handle::current().block_on(async {
            AxonTree::new(temp_path, options)?.scan_os()?.load_all_sources(&source_manager).await?.analyze(&parser).await
        })?;

        Ok::<Arc<AxonTree<Analyzed>>, AxonError>(Arc::new(analyzed_tree))
    }).await.map_err(|_| AxonError::Backend("Parser panicked".into()))??;

    state.active_trees.insert(id, shared_tree).await;
    Ok(StatusCode::OK)
}


#[instrument(skip(state))]
pub async fn get_all_file_paths(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
    Query(query): Query<FileQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = get_active_tree(&state, &id, &token.subject).await?;
    Ok(Json(tree.get_all_file_paths(query.limit)))
}

#[instrument(skip(state))]
pub async fn get_file_paths_by_dir(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
    Query(query): Query<DirQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = get_active_tree(&state, &id, &token.subject).await?;
    let paths = tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit)
        .ok_or_else(|| AxonError::NotFound { entity: "Dir".into(), id: query.path.clone() })?;
    Ok(Json(paths))
}

#[instrument(skip(state))]
pub async fn read_file(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<String>> {
    let tree = get_active_tree(&state, &id, &token.subject).await?;
    let content = tree.read_file_content(&query.path)
        .ok_or_else(|| AxonError::NotFound { entity: "File".into(), id: query.path.clone() })?;
    Ok(Json(content))
}

#[instrument(skip(state))]
pub async fn list_directory(
    State(state): State<AppState>,
    Extension(token): Extension<KeycloakToken<String>>, // 🔐
    Path(id): Path<String>,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<Vec<ExplorerEntry>>> {
    let tree = get_active_tree(&state, &id, &token.subject).await?;
    let entries = TreeExplorer::list_directory(&tree, &query.path)?;
    Ok(Json(entries))
}