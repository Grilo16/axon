use chrono::Utc;
use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use std::{path::PathBuf, sync::Arc};
use tauri::State;
use tracing::{info};
use uuid::Uuid;

use crate::state::AppState;
use axon_core::{
    domain::{bundle::{BundleOptions, BundleRecord}, workspace::{
        CreateWorkspaceReq, DirQuery, FileQuery, ListWorkspacesQuery, ReadFileReq, SearchQuery, UpdateWorkspacePayload, WorkspaceRecord
    }}, error::{AxonError, AxonResult}, explorer::{ExplorerEntry, TreeExplorer}, parser::javascript::JsTsParser, tree::{AxonTree, options::AxonScanOptions, source::OsSource, state::Analyzed}
};

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
    let workspace_id = Uuid::new_v4().to_string();

    let record = WorkspaceRecord {
        id: workspace_id.clone(),
        owner_id: LOCAL_OWNER.to_string(),
        name: payload.name,
        project_root: payload.project_root,
        last_opened: now.clone(),
        created_at: now.clone(),
        updated_at: now.clone(),
    };
    state.workspace_repo.create(record.clone()).await?;

    // 🌟 Auto-create the Default Bundle!
    let default_bundle = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id,
        name: "Default Bundle".into(),
        options: BundleOptions::default(), 
        created_at: now.clone(),
        updated_at: now,
    };
    state.bundle_repo.create(default_bundle).await?;

    Ok(record)
}

#[tauri::command]
pub async fn get_workspace(state: State<'_, AppState>, id: String) -> AxonResult<WorkspaceRecord> {
    state.workspace_repo.get_by_id_and_owner(&id, LOCAL_OWNER).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace".into(), id: id.clone() })
}

#[tauri::command]
pub async fn list_workspaces(
    state: State<'_, AppState>,
    query: ListWorkspacesQuery,
) -> AxonResult<Vec<WorkspaceRecord>> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);
    state.workspace_repo.list_for_user(LOCAL_OWNER, limit, offset).await
}

#[tauri::command]
pub async fn update_workspace(state: State<'_, AppState>, id: String, payload: UpdateWorkspacePayload) -> AxonResult<()> {
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
// 2. ACTIVE TREE ENGINE (Lazy Loading)
// ==========================================

pub async fn resolve_active_tree(
    state: &State<'_, AppState>,
    workspace_id: &str,
) -> AxonResult<Arc<AxonTree<Analyzed>>> {
    // 1. Verify existence in DB
    let workspace = state.workspace_repo.get_by_id_and_owner(workspace_id, LOCAL_OWNER).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace".into(), id: workspace_id.to_string() })?;

    // 2. Return from RAM if loaded
    if let Some(tree) = state.active_trees.get(workspace_id).await {
        return Ok(tree);
    }

    // 3. Lazily compute on cache miss
    let shared_tree = tokio::task::spawn_blocking(move || {
        // 🌟 Ephemeral Disk Architecture for Desktop!
        let mut _ephemeral_dir = None;
        let is_remote = workspace.project_root.starts_with("http");

        let target_path = if !is_remote {
            info!("📂 Loading local workspace '{}' directly from disk...", workspace.name);
            PathBuf::from(&workspace.project_root)
        } else {
            info!("🌐 Lazily cloning GitHub workspace '{}'...", workspace.name);
            let temp_dir = tempfile::Builder::new().prefix("axon_git_").tempdir()
                .map_err(|e| AxonError::Backend(format!("Temp dir error: {}", e)))?;
            let temp_path = temp_dir.path().to_path_buf();

            let status = std::process::Command::new("git")
                .args(["clone", "--depth", "1", &workspace.project_root])
                .arg(&temp_path).status()
                .map_err(|e| AxonError::Backend(format!("Git execute error: {}", e)))?;

            if !status.success() {
                return Err(AxonError::Backend("Git clone failed.".into()));
            }

            _ephemeral_dir = Some(temp_dir); 
            temp_path
        };

        let options = AxonScanOptions::auto_detect(&target_path);
        let parser = JsTsParser;
        let source_manager = OsSource::new(target_path.clone());

        let analyzed_tree = tokio::runtime::Handle::current().block_on(async {
            AxonTree::new(target_path, options)?
                .scan_os()?
                .load_all_sources(&source_manager).await?
                .analyze(&parser).await
        })?;

        Ok::<Arc<AxonTree<Analyzed>>, AxonError>(Arc::new(analyzed_tree))
    })
    .await
    .map_err(|_| AxonError::Backend("Parser task panicked".into()))??;

    // 4. Cache it and return
    state.active_trees.insert(workspace_id.to_string(), shared_tree.clone()).await;
    Ok(shared_tree)
}

#[tauri::command]
pub async fn get_all_file_paths(state: State<'_, AppState>, id: String, query: FileQuery) -> AxonResult<Vec<String>> {
    let tree = resolve_active_tree(&state, &id).await?; // 🌟 Lazy load!
    Ok(tree.get_all_file_paths(query.limit))
}

#[tauri::command]
pub async fn get_file_paths_by_dir(state: State<'_, AppState>, id: String, query: DirQuery) -> AxonResult<Vec<String>> {
    let tree = resolve_active_tree(&state, &id).await?; // 🌟 Lazy load!
    tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit)
        .ok_or_else(|| AxonError::NotFound { entity: "Directory".into(), id: query.path })
}

#[tauri::command]
pub async fn read_file(state: State<'_, AppState>, id: String, query: ReadFileReq) -> AxonResult<String> {
    let tree = resolve_active_tree(&state, &id).await?; // 🌟 Lazy load!
    tree.read_file_content(&query.path)
        .ok_or_else(|| AxonError::NotFound { entity: "File".into(), id: query.path })
}

#[tauri::command]
pub async fn list_directory(state: State<'_, AppState>, id: String, query: ReadFileReq) -> AxonResult<Vec<ExplorerEntry>> {
    let tree = resolve_active_tree(&state, &id).await?; // 🌟 Lazy load!
    TreeExplorer::list_directory(&tree, &query.path)
}

#[tauri::command]
pub async fn search_files(
    state: State<'_, AppState>,
    id: String,
    query: SearchQuery,
) -> AxonResult<Vec<String>> {
  let tree = resolve_active_tree(&state, &id).await?; 
    let all_paths = tree.get_all_file_paths(None);
    
    let matcher = SkimMatcherV2::default();
    
    let mut scored_paths: Vec<(i64, String)> = all_paths
        .into_iter()
        .filter_map(|path| matcher.fuzzy_match(&path, &query.value).map(|score| (score, path)))
        .collect();

    scored_paths.sort_by(|a, b| b.0.cmp(&a.0));

    let final_paths: Vec<String> = scored_paths
        .into_iter()
        .take(query.limit.unwrap_or(100))
        .map(|(_, path)| path)
        .collect();
        
    Ok(final_paths)
}