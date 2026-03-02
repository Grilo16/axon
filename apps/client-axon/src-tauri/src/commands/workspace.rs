use chrono::Utc;
use std::{path::PathBuf, sync::Arc};
use tauri::State;
use tracing::{info, instrument};
use uuid::Uuid;

use crate::state::AppState;
use axon_core::{
    domain::workspace::{
        CreateWorkspaceReq, DirQuery, FileQuery, ListWorkspacesQuery, ReadFileReq, UpdateWorkspacePayload, WorkspaceRecord
    },
    error::{AxonError, AxonResult},
    explorer::{ExplorerEntry, TreeExplorer},
    parser::javascript::JsTsParser,
    tree::{AxonTree, options::AxonScanOptions, source::OsSource, state::Analyzed},
};

// The default owner for all local desktop workspaces!
const LOCAL_OWNER: &str = "local";

// ==========================================
// 1. CRUD HANDLERS
// ==========================================

#[tauri::command]
pub async fn create_workspace(
    state: State<'_, AppState>,
    payload: CreateWorkspaceReq,
) -> AxonResult<WorkspaceRecord> {
    let now = Utc::now().to_rfc3339();
    let record = WorkspaceRecord {
        id: Uuid::new_v4().to_string(),
        owner_id: LOCAL_OWNER.to_string(),
        name: payload.name,
        project_root: payload.project_root,
        last_opened: now.clone(),
        created_at: now.clone(),
        updated_at: now,
    };
    state.workspace_repo.create(record.clone()).await?;
    Ok(record)
}

#[tauri::command]
pub async fn get_workspace(state: State<'_, AppState>, id: String) -> AxonResult<WorkspaceRecord> {
    state
        .workspace_repo
        .get_by_id_and_owner(&id, LOCAL_OWNER)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Workspace".into(),
            id: id.clone(),
        })
}

#[tauri::command]
pub async fn list_workspaces(
    state: State<'_, AppState>,
    query: ListWorkspacesQuery,
) -> AxonResult<Vec<WorkspaceRecord>> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);
    state
        .workspace_repo
        .list_for_user(LOCAL_OWNER, limit, offset)
        .await
}

#[tauri::command]
pub async fn update_workspace(
    state: State<'_, AppState>,
    id: String,
    payload: UpdateWorkspacePayload,
) -> AxonResult<()> {
    state.workspace_repo.update(&id, LOCAL_OWNER, payload).await
}

#[tauri::command]
pub async fn touch_workspace(state: State<'_, AppState>, id: String) -> AxonResult<()> {
    state.workspace_repo.touch(&id, LOCAL_OWNER).await
}

#[tauri::command]
pub async fn delete_workspace(state: State<'_, AppState>, id: String) -> AxonResult<bool> {
    state.workspace_repo.delete(&id, LOCAL_OWNER).await
}

// ==========================================
// 2. ACTIVE TREE HANDLERS (The Engine)
// ==========================================

async fn get_active_tree(
    state: &AppState,
    workspace_id: &str,
) -> AxonResult<Arc<AxonTree<Analyzed>>> {
    // 1. Verify it exists in the local DB first for consistency with the web server
    let _workspace = state
        .workspace_repo
        .get_by_id_and_owner(workspace_id, LOCAL_OWNER)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Workspace".into(),
            id: workspace_id.to_string(),
        })?;

    // 2. Fetch from RAM
    state.active_trees.get(workspace_id).await.ok_or_else(|| {
        AxonError::Backend(format!("Workspace {} is not loaded in RAM!", workspace_id))
    })
}

#[tauri::command]
pub async fn workspace_status(state: State<'_, AppState>, id: String) -> AxonResult<bool> {
    Ok(state.active_trees.contains_key(&id))
}

#[tauri::command]
#[instrument(skip(state))]
pub async fn load_github_workspace_ast(state: State<'_, AppState>, id: String) -> AxonResult<()> {
    let workspace = state
        .workspace_repo
        .get_by_id_and_owner(&id, LOCAL_OWNER)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Workspace".into(),
            id: id.clone(),
        })?;

    info!(
        "🔄 Loading GitHub workspace '{}': {}",
        workspace.name, workspace.project_root
    );

    let shared_tree = tokio::task::spawn_blocking(move || {
        let temp_dir = tempfile::Builder::new()
            .prefix("axon_git_")
            .tempdir()
            .map_err(|e| AxonError::Backend(format!("Temp dir error: {}", e)))?;
        let temp_path = temp_dir.path().to_path_buf();

        let status = std::process::Command::new("git")
            .args(["clone", "--depth", "1", &workspace.project_root])
            .arg(&temp_path)
            .status()
            .map_err(|e| AxonError::Backend(format!("Git execute error: {}", e)))?;

        if !status.success() {
            return Err(AxonError::Backend("Git clone failed.".into()));
        }

        let options = AxonScanOptions::auto_detect(&temp_path);
        let parser = JsTsParser;
        let source_manager = OsSource::new(temp_path.clone());

        let analyzed_tree = tokio::runtime::Handle::current().block_on(async {
            AxonTree::new(temp_path, options)?
                .scan_os()?
                .load_all_sources(&source_manager)
                .await?
                .analyze(&parser)
                .await
        })?;

        Ok::<Arc<AxonTree<Analyzed>>, AxonError>(Arc::new(analyzed_tree))
    })
    .await
    .map_err(|_| AxonError::Backend("Parser task panicked".into()))??;

    state.active_trees.insert(id, shared_tree).await;
    Ok(())
}

#[tauri::command]
#[instrument(skip(state))]
pub async fn load_local_workspace_ast(state: State<'_, AppState>, id: String) -> AxonResult<()> {
    let workspace = state
        .workspace_repo
        .get_by_id_and_owner(&id, LOCAL_OWNER)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Workspace".into(),
            id: id.clone(),
        })?;

    info!(
        "📂 Loading Local workspace '{}': {}",
        workspace.name, workspace.project_root
    );

    let shared_tree = tokio::task::spawn_blocking(move || {
        let local_path = PathBuf::from(&workspace.project_root);

        if !local_path.exists() {
            return Err(AxonError::Backend(format!(
                "Local path does not exist: {:?}",
                local_path
            )));
        }

        let options = AxonScanOptions::auto_detect(&local_path);
        let parser = JsTsParser;
        let source_manager = OsSource::new(local_path.clone());

        let analyzed_tree = tokio::runtime::Handle::current().block_on(async {
            AxonTree::new(local_path, options)?
                .scan_os()?
                .load_all_sources(&source_manager)
                .await?
                .analyze(&parser)
                .await
        })?;

        Ok::<Arc<AxonTree<Analyzed>>, AxonError>(Arc::new(analyzed_tree))
    })
    .await
    .map_err(|_| AxonError::Backend("Parser task panicked".into()))??;

    state.active_trees.insert(id, shared_tree).await;
    Ok(())
}

#[tauri::command]
pub async fn get_all_file_paths(
    state: State<'_, AppState>,
    id: String,
    query: FileQuery,
) -> AxonResult<Vec<String>> {
    let tree = get_active_tree(&state, &id).await?;
    Ok(tree.get_all_file_paths(query.limit))
}
#[tauri::command]
pub async fn get_file_paths_by_dir(
    state: State<'_, AppState>,
    id: String,
    query: DirQuery,
) -> AxonResult<Vec<String>> {
    let tree = get_active_tree(&state, &id).await?;
    tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit)
        .ok_or_else(|| AxonError::NotFound {
            entity: "Directory".into(),
            id: query.path,
        })
}
#[tauri::command]
pub async fn read_file(
    state: State<'_, AppState>,
    id: String,
    query: ReadFileReq,
) -> AxonResult<String> {
    let tree = get_active_tree(&state, &id).await?;
    tree.read_file_content(&query.path)
        .ok_or_else(|| AxonError::NotFound {
            entity: "File".into(),
            id: query.path,
        })
}

#[tauri::command]
pub async fn list_directory(
    state: State<'_, AppState>,
    id: String,
    query: ReadFileReq,
) -> AxonResult<Vec<ExplorerEntry>> {
    let tree = get_active_tree(&state, &id).await?;
    TreeExplorer::list_directory(&tree, &query.path)
}

