use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use uuid::Uuid;
use chrono::Utc;
use crate::api::prelude::*;
use crate::api::extractor::VerifiedWorkspace;
use crate::api::engine::resolve_active_tree;
use axon_core::{
    domain::{bundle::{BundleOptions, BundleRecord}, workspace::{
        CreateWorkspaceReq, DirQuery, FileQuery, ListWorkspacesQuery, ReadFileReq, SearchQuery, UpdateWorkspacePayload, WorkspaceRecord
    }}, explorer::{ExplorerEntry, TreeExplorer}
};

#[instrument(skip(ctx, payload))]
pub async fn create_workspace(
    ctx: AuthContext, 
    Json(payload): Json<CreateWorkspaceReq>,
) -> AxonResult<Json<WorkspaceRecord>> {
    let now = Utc::now().to_rfc3339();
    let workspace_id = Uuid::new_v4().to_string();

    let record = WorkspaceRecord {
        id: workspace_id.clone(),
        owner_id: ctx.user_id.clone(),
        name: payload.name,
        project_root: payload.project_root,
        last_opened: now.clone(),
        created_at: now.clone(),
        updated_at: now.clone(),
    };

    ctx.state.workspace_repo.create(record.clone()).await?;

    let default_bundle = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id,
        name: "Default Bundle".into(),
        options: BundleOptions::default(), 
        created_at: now.clone(),
        updated_at: now,
    };
    ctx.state.bundle_repo.create(default_bundle).await?;

    info!("👤 User {} created workspace: {}", ctx.user_id, record.id);
    Ok(Json(record))
}

#[instrument(skip(workspace))]
pub async fn get_workspace(
    // 🛡️ If this code runs, we mathematically guarantee the user owns this workspace!
    VerifiedWorkspace(workspace): VerifiedWorkspace,
) -> AxonResult<Json<WorkspaceRecord>> {
    Ok(Json(workspace))
}

#[instrument(skip(ctx))]
pub async fn list_workspaces(
    ctx: AuthContext,
    Query(query): Query<ListWorkspacesQuery>,
) -> AxonResult<Json<Vec<WorkspaceRecord>>> {
    let records = ctx.state.workspace_repo.list_for_user(
        &ctx.user_id, 
        query.limit.unwrap_or(50), 
        query.offset.unwrap_or(0)
    ).await?;
    Ok(Json(records))
}

#[instrument(skip(ctx, payload))]
pub async fn update_workspace(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Json(payload): Json<UpdateWorkspacePayload>,
) -> AxonResult<StatusCode> {
    ctx.state.workspace_repo.update(&workspace.id, &ctx.user_id, payload).await?;
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn delete_workspace(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
) -> AxonResult<StatusCode> {
    ctx.state.workspace_repo.delete(&workspace.id, &ctx.user_id).await?;
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn rescan_workspace(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
) -> AxonResult<StatusCode> {
    info!("🔄 User {} triggered rescan for workspace: {}", ctx.user_id, workspace.id);

    // 1. Evict spool data (AST chunks + skeleton + metadata)
    let evicted = ctx.state.spool.evict_commit(&workspace.id)?;
    info!("🗑️ Evicted {} chunks from spool for workspace '{}'", evicted, workspace.name);

    // 2. Evict in-memory tree cache
    ctx.state.invalidate_tree(&workspace.id).await;

    // 3. Eagerly re-scan so the user gets fresh data immediately
    let _tree = resolve_active_tree(&ctx.state, &workspace.id, &ctx.user_id).await?;
    info!("✅ Rescan complete for workspace '{}'", workspace.name);

    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn get_all_file_paths(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Query(query): Query<FileQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&ctx.state, &workspace.id, &ctx.user_id).await?;
    Ok(Json(tree.get_all_file_paths(query.limit)))
}

#[instrument(skip(ctx))]
pub async fn get_file_paths_by_dir(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Query(query): Query<DirQuery>,
) -> AxonResult<Json<Vec<String>>> {
    validate_user_path(&query.path)?;
    let tree = resolve_active_tree(&ctx.state, &workspace.id, &ctx.user_id).await?;

    let paths = match tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit) {
        Some(p) => p,
        None => return Err(AxonError::NotFound { entity: "Directory", id: query.path.clone() }),
    };
    
    Ok(Json(paths))
}

#[instrument(skip(ctx))]
pub async fn read_file(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<String>> {
    validate_user_path(&query.path)?;
    let tree = resolve_active_tree(&ctx.state, &workspace.id, &ctx.user_id).await?;
    let spool = ctx.state.spool.clone(); 
    let content = tree.read_file_content(&spool, &workspace.id, &query.path)?;
    Ok(Json(content))
}

#[instrument(skip(ctx))]
pub async fn list_directory(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<Vec<ExplorerEntry>>> {
    validate_user_path(&query.path)?;
    let tree = resolve_active_tree(&ctx.state, &workspace.id, &ctx.user_id).await?;
    let entries = TreeExplorer::list_directory(&tree, &query.path)?;
    Ok(Json(entries))
}

#[instrument(skip(ctx))]
pub async fn search_files(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Query(query): Query<SearchQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&ctx.state, &workspace.id, &ctx.user_id).await?;
    let all_paths = tree.get_all_file_paths(None);
    
    let matcher = SkimMatcherV2::default();
    let limit = query.limit.unwrap_or(100);

    let mut scored_paths: Vec<(i64, String)> = all_paths
        .into_iter()
        .filter_map(|path| matcher.fuzzy_match(&path, &query.value).map(|score| (score, path)))
        .collect();

    // Partial sort: only order the top `limit` elements instead of sorting everything.
    if scored_paths.len() > limit {
        scored_paths.select_nth_unstable_by(limit, |a, b| b.0.cmp(&a.0));
        scored_paths.truncate(limit);
    }
    scored_paths.sort_unstable_by(|a, b| b.0.cmp(&a.0));

    let final_paths: Vec<String> = scored_paths
        .into_iter()
        .map(|(_, path)| path)
        .collect();

    Ok(Json(final_paths))
}