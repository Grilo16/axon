use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use uuid::Uuid;
use chrono::Utc;
use crate::api::prelude::*;
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

#[instrument(skip(ctx))]
pub async fn get_workspace(
    ctx: AuthContext,
    Path(id): Path<String>,
) -> AxonResult<Json<WorkspaceRecord>> {
    let record = ctx.state.workspace_repo.get_by_id_and_owner(&id, &ctx.user_id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id })?;
    Ok(Json(record))
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
    Path(id): Path<String>,
    Json(payload): Json<UpdateWorkspacePayload>,
) -> AxonResult<StatusCode> {
    ctx.state.workspace_repo.update(&id, &ctx.user_id, payload).await?;
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn delete_workspace(
    ctx: AuthContext,
    Path(id): Path<String>,
) -> AxonResult<StatusCode> {
    ctx.state.workspace_repo.delete(&id, &ctx.user_id).await?;
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn get_all_file_paths(
    ctx: AuthContext,
    Path(id): Path<String>,
    Query(query): Query<FileQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&ctx.state, &id, &ctx.user_id).await?;
    Ok(Json(tree.get_all_file_paths(query.limit)))
}

#[instrument(skip(ctx))]
pub async fn get_file_paths_by_dir(
    ctx: AuthContext,
    Path(id): Path<String>,
    Query(query): Query<DirQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&ctx.state, &id, &ctx.user_id).await?;
    
    // 🛡️ Bypassing the compiler inference trap using explicit pattern matching
    let paths = match tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit) {
        Some(p) => p,
        None => return Err(AxonError::NotFound { entity: "Directory", id: query.path.clone() }),
    };
    
    Ok(Json(paths))
}

#[instrument(skip(ctx))]
pub async fn read_file(
    ctx: AuthContext,
    Path(id): Path<String>,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<String>> {
    let tree = resolve_active_tree(&ctx.state, &id, &ctx.user_id).await?;
    let spool = ctx.state.spool.clone(); 
    let commit_hash = id.clone();
    let content = tree.read_file_content(&spool, &commit_hash, &query.path)?;
    Ok(Json(content))
}

#[instrument(skip(ctx))]
pub async fn list_directory(
    ctx: AuthContext,
    Path(id): Path<String>,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<Vec<ExplorerEntry>>> {
    let tree = resolve_active_tree(&ctx.state, &id, &ctx.user_id).await?;
    let entries = TreeExplorer::list_directory(&tree, &query.path)?;
    Ok(Json(entries))
}

#[instrument(skip(ctx))]
pub async fn search_files(
    ctx: AuthContext,
    Path(id): Path<String>,
    Query(query): Query<SearchQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&ctx.state, &id, &ctx.user_id).await?;
    let all_paths = tree.get_all_file_paths(None);
    
    let matcher = SkimMatcherV2::default();
    
    let mut scored_paths: Vec<(i64, String)> = all_paths
        .into_iter()
        .filter_map(|path| {
            matcher.fuzzy_match(&path, &query.value).map(|score| (score, path))
        })
        .collect();

    scored_paths.sort_by(|a, b| b.0.cmp(&a.0));

    let final_paths: Vec<String> = scored_paths
        .into_iter()
        .take(query.limit.unwrap_or(100))
        .map(|(_, path)| path)
        .collect();
        
    Ok(Json(final_paths))
}