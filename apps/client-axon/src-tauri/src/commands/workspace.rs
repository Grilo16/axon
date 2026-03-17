use chrono::Utc;
use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use std::{path::PathBuf, sync::Arc};
use tauri::State;
use tracing::{info, instrument};
use uuid::Uuid;

use crate::state::AppState;
use axon_core::{
    domain::{bundle::{BundleOptions, BundleRecord}, workspace::{
        CreateWorkspaceReq, DirQuery, FileQuery, ListWorkspacesQuery, ReadFileReq, SearchQuery, UpdateWorkspacePayload, WorkspaceRecord
    }},
    error::{AxonError, AxonResult},
    explorer::{ExplorerEntry, TreeExplorer},
    parser::javascript::JsTsParser,
    tree::{AxonTree, node::file::state::Outlined, options::AxonScanOptions, source::OsSource, state::{Analyzed, TreeRegistry}},
};

const LOCAL_OWNER: &str = "local";

// ==========================================
// VALIDATION
// ==========================================

/// Rejects paths containing traversal segments (`..`) to prevent directory escape.
fn validate_user_path(path: &str) -> AxonResult<()> {
    if path.split('/').any(|seg| seg == "..") {
        return Err(AxonError::Parse {
            path: path.into(),
            message: "Path traversal ('..') is not allowed".into(),
        });
    }
    Ok(())
}

// ==========================================
// 1. CRUD HANDLERS
// ==========================================

#[tauri::command]
#[instrument(skip(state, payload), err)]
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

    let default_bundle = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id,
        name: "Default Bundle".into(),
        options: BundleOptions::default(),
        created_at: now.clone(),
        updated_at: now,
    };
    state.bundle_repo.create(default_bundle).await?;

    info!(workspace_id = %record.id, "workspace created");
    Ok(record)
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn get_workspace(state: State<'_, AppState>, id: String) -> AxonResult<WorkspaceRecord> {
    state.workspace_repo.get_by_id_and_owner(&id, LOCAL_OWNER).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id: id.clone() })
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn list_workspaces(
    state: State<'_, AppState>,
    query: ListWorkspacesQuery,
) -> AxonResult<Vec<WorkspaceRecord>> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);
    state.workspace_repo.list_for_user(LOCAL_OWNER, limit, offset).await
}

#[tauri::command]
#[instrument(skip(state, payload), err)]
pub async fn update_workspace(state: State<'_, AppState>, id: String, payload: UpdateWorkspacePayload) -> AxonResult<()> {
    state.workspace_repo.update(&id, LOCAL_OWNER, payload).await
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn touch_workspace(state: State<'_, AppState>, id: String) -> AxonResult<()> {
    state.workspace_repo.touch(&id, LOCAL_OWNER).await
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn delete_workspace(state: State<'_, AppState>, id: String) -> AxonResult<bool> {
    state.active_trees.remove(&id).await;
    let _ = state.spool.evict_commit(&id);
    state.workspace_repo.delete(&id, LOCAL_OWNER).await
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn rescan_workspace(state: State<'_, AppState>, id: String) -> AxonResult<()> {
    let workspace = state.workspace_repo.get_by_id_and_owner(&id, LOCAL_OWNER).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id: id.clone() })?;

    info!(workspace = %workspace.name, "rescan triggered");

    let evicted = state.spool.evict_commit(&id)?;
    info!(evicted_chunks = evicted, workspace = %workspace.name, "spool evicted");

    state.active_trees.remove(&id).await;

    let _tree = resolve_active_tree(&state, &id).await?;
    info!(workspace = %workspace.name, "rescan complete");

    Ok(())
}

// ==========================================
// 2. ACTIVE TREE ENGINE (Lazy Loading)
// ==========================================

#[instrument(skip(state), err)]
pub async fn resolve_active_tree(
    state: &AppState,
    workspace_id: &str,
) -> AxonResult<Arc<AxonTree<Analyzed>>> {
    let workspace = state.workspace_repo.get_by_id_and_owner(workspace_id, LOCAL_OWNER).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id: workspace_id.to_string() })?;

    if let Some(tree) = state.active_trees.get(workspace_id).await {
        return Ok(tree);
    }

    let spool = state.spool.clone();
    let commit_hash = workspace.id.clone();
    let project_root = workspace.project_root.clone();
    let workspace_name = workspace.name.clone();

    // ==========================================
    // FAST PATH: SKELETON BYPASS
    // ==========================================
    let skeleton_result = {
        let spool = spool.clone();
        let commit_hash = commit_hash.clone();
        let project_root = project_root.clone();
        let workspace_name = workspace_name.clone();
        tokio::task::spawn_blocking(move || -> AxonResult<Option<AxonTree<Analyzed>>> {
            if let Ok(Some(skeleton_bytes)) = spool.get_skeleton(&commit_hash) {
                if let Ok(registry) = postcard::from_bytes::<TreeRegistry<Outlined>>(&skeleton_bytes) {
                    tracing::info!(
                        workspace = %workspace_name,
                        "skeleton hit: loaded from spool"
                    );

                    let target_path = PathBuf::from(&project_root);
                    let options = AxonScanOptions::auto_detect(&target_path);

                    return Ok(Some(AxonTree {
                        core: axon_core::tree::AxonTreeCore {
                            root: target_path,
                            scan: options,
                        },
                        state: Analyzed(registry),
                    }));
                }
            }
            Ok(None)
        })
        .await
        .map_err(|e| AxonError::Backend(format!("Skeleton task failed: {e}")))?
    };

    if let Some(tree) = skeleton_result? {
        let shared = Arc::new(tree);
        state.active_trees.insert(workspace_id.to_string(), shared.clone()).await;
        return Ok(shared);
    }

    // ==========================================
    // SLOW PATH: SCAN, PARSE, AND SPOOL
    // ==========================================
    let _ephemeral_dir;
    let target_path;

    if project_root.starts_with("http") {
        info!(workspace = %workspace_name, "cloning remote workspace");

        let root = project_root.clone();
        let (temp_dir, temp_path) = tokio::task::spawn_blocking(move || -> AxonResult<_> {
            let temp_dir = tempfile::Builder::new().prefix("axon_git_").tempdir()
                .map_err(|e| AxonError::Backend(format!("Temp dir failed: {e}")))?;
            let path = temp_dir.path().to_path_buf();

            let status = std::process::Command::new("git")
                .args(["clone", "--depth", "1", &root])
                .arg(&path).status()
                .map_err(|e| AxonError::Backend(format!("Git execution failed: {e}")))?;

            if !status.success() {
                return Err(AxonError::Backend("Git clone failed.".into()));
            }
            Ok((temp_dir, path))
        })
        .await
        .map_err(|e| AxonError::Backend(format!("Git clone task failed: {e}")))?
        ?;

        target_path = temp_path;
        _ephemeral_dir = Some(temp_dir);
    } else {
        info!(workspace = %workspace_name, "loading local workspace");
        target_path = PathBuf::from(&project_root);
        _ephemeral_dir = None;
    }

    let options = AxonScanOptions::auto_detect(&target_path);
    let parser = Arc::new(JsTsParser);
    let source_manager = OsSource::new(target_path.clone());

    let loaded_tree = AxonTree::new(target_path, options)?
        .scan_os()?
        .load_all_sources(&source_manager).await?;

    let analyzed_tree = loaded_tree.spool_to_disk(parser, spool.clone(), commit_hash.clone()).await?;

    let skeleton_bytes = postcard::to_stdvec(&analyzed_tree.state.0)
        .map_err(|e| AxonError::Backend(format!("Failed to serialize skeleton: {e}")))?;

    spool.write_skeleton(&commit_hash, &skeleton_bytes)?;
    info!(workspace = %workspace_name, "skeleton saved to spool");

    let shared = Arc::new(analyzed_tree);
    state.active_trees.insert(workspace_id.to_string(), shared.clone()).await;
    Ok(shared)
}

// ==========================================
// 3. QUERY HANDLERS
// ==========================================

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn get_all_file_paths(state: State<'_, AppState>, id: String, query: FileQuery) -> AxonResult<Vec<String>> {
    let tree = resolve_active_tree(&state, &id).await?;
    Ok(tree.get_all_file_paths(query.limit))
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn get_file_paths_by_dir(state: State<'_, AppState>, id: String, query: DirQuery) -> AxonResult<Vec<String>> {
    validate_user_path(&query.path)?;
    let tree = resolve_active_tree(&state, &id).await?;
    tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit)
        .ok_or(AxonError::NotFound { entity: "Directory", id: query.path })
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn read_file(state: State<'_, AppState>, id: String, query: ReadFileReq) -> AxonResult<String> {
    validate_user_path(&query.path)?;
    let tree = resolve_active_tree(&state, &id).await?;
    let spool = state.spool.clone();
    let commit_hash = id.clone();
    tree.read_file_content(&spool, &commit_hash, &query.path)
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn list_directory(state: State<'_, AppState>, id: String, query: ReadFileReq) -> AxonResult<Vec<ExplorerEntry>> {
    validate_user_path(&query.path)?;
    let tree = resolve_active_tree(&state, &id).await?;
    TreeExplorer::list_directory(&tree, &query.path)
}

#[tauri::command]
#[instrument(skip(state), err)]
pub async fn search_files(
    state: State<'_, AppState>,
    id: String,
    query: SearchQuery,
) -> AxonResult<Vec<String>> {
    let tree = resolve_active_tree(&state, &id).await?;
    let all_paths = tree.get_all_file_paths(None);

    let matcher = SkimMatcherV2::default();
    let limit = query.limit.unwrap_or(100);

    let mut scored_paths: Vec<(i64, String)> = all_paths
        .into_iter()
        .filter_map(|path| matcher.fuzzy_match(&path, &query.value).map(|score| (score, path)))
        .collect();

    if scored_paths.len() > limit {
        scored_paths.select_nth_unstable_by(limit, |a, b| b.0.cmp(&a.0));
        scored_paths.truncate(limit);
    }
    scored_paths.sort_unstable_by(|a, b| b.0.cmp(&a.0));

    let final_paths: Vec<String> = scored_paths
        .into_iter()
        .map(|(_, path)| path)
        .collect();

    Ok(final_paths)
}
