use std::collections::{HashMap, HashSet};
use crate::api::prelude::*;
use crate::api::engine::resolve_active_tree;
use axon_core::{
     domain::{bundle::BundleOptions, public::StatelessGraphReq, workspace::{DirQuery, FileQuery, ReadFileReq, SearchQuery, WorkspaceRecord}}, explorer::{ExplorerEntry, TreeExplorer}, graph::AxonGraph
};
use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;

pub fn validate_bundle_options(options: &BundleOptions) -> AxonResult<()> {
    let mut seen_targets = HashSet::new();

    for rule in &options.rules { 
        let target_key = serde_json::to_string(&rule.target)
            .map_err(|_| AxonError::Parse { 
                path: "BundleOptions".into(), 
                message: "Failed to serialize target scope for validation".into() 
            })?;

        if !seen_targets.insert(target_key) {
            return Err(AxonError::Parse {
                path: "BundleOptions".into(),
                message: format!("Duplicate redaction rule detected for target: {:?}", rule.target),
            });
        }
    }
    Ok(())
}

#[instrument(skip(state))]
pub async fn list_public_workspaces(
    State(state): State<AppState>,
) -> AxonResult<Json<Vec<WorkspaceRecord>>> {
    let records = state.workspace_repo.list_for_user("system", 50, 0).await?;
    Ok(Json(records))
}

#[instrument(skip(state))]
pub async fn get_all_file_paths(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<FileQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&state, &id, "system").await?;
    Ok(Json(tree.get_all_file_paths(query.limit)))
}

#[instrument(skip(state))]
pub async fn get_file_paths_by_dir(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<DirQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&state, &id, "system").await?;
    
    // 🛡️ Exact explicit unwrapping to satisfy inference
    let paths = match tree.get_file_paths_by_dir(&query.path, query.recursive, query.limit) {
        Some(p) => p,
        None => return Err(AxonError::NotFound { entity: "Directory", id: query.path.clone() }),
    };
    Ok(Json(paths))
}

#[instrument(skip(state))]
pub async fn read_file(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<String>> {
    let tree = resolve_active_tree(&state, &id, "system").await?;
    let spool = state.spool.clone(); // (or state.spool.clone() in public.rs)
    let commit_hash = id.clone();
    let content = tree.read_file_content(&spool, &commit_hash, &query.path)?;
    Ok(Json(content))
}

#[instrument(skip(state))]
pub async fn list_directory(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ReadFileReq>,
) -> AxonResult<Json<Vec<ExplorerEntry>>> {
    let tree = resolve_active_tree(&state, &id, "system").await?;
    let entries = TreeExplorer::list_directory(&tree, &query.path)?;
    Ok(Json(entries))
}

#[instrument(skip(payload))]
pub async fn validate_public_options(
    Json(payload): Json<BundleOptions>,
) -> AxonResult<StatusCode> {
    validate_bundle_options(&payload)?;
    Ok(StatusCode::OK)
}

#[instrument(skip(state, payload))]
pub async fn generate_public_graph(
    State(state): State<AppState>,
    Json(payload): Json<StatelessGraphReq>,
) -> AxonResult<Json<serde_json::Value>> {
    validate_bundle_options(&payload.options)?;

    let tree = resolve_active_tree(&state, &payload.workspace_id, "system").await?;

    let view = tokio::task::spawn_blocking(move || {
        let spool = state.spool.clone();
        let commit_hash = payload.workspace_id.clone();
        let graph = AxonGraph::build(&tree, &spool, &commit_hash);
        let focus_refs: Vec<&str> = payload.options.target_files.iter().map(|s| s.as_str()).collect(); 
        graph.to_view(&tree, &spool, &commit_hash, &focus_refs, payload.options.hide_barrel_exports)
    }).await.map_err(|_| AxonError::Backend("Graph builder panicked".into()))?;

    Ok(Json(serde_json::to_value(view)?))
}

#[instrument(skip(state, payload))]
pub async fn generate_public_code(
    State(state): State<AppState>,
    Json(payload): Json<StatelessGraphReq>,
) -> AxonResult<Json<HashMap<String, String>>> {
    validate_bundle_options(&payload.options)?;

      let spool = state.spool.clone();
        let commit_hash = payload.workspace_id.clone();
    let tree = resolve_active_tree(&state, &payload.workspace_id, "system").await?;

    let generated = tokio::task::spawn_blocking(move || {
        let bundler = axon_core::bundler::AxonBundler::new(&tree, &spool, &commit_hash, payload.options);
        bundler.generate_bundle()
    })
    .await
    .map_err(|_| AxonError::Backend("Bundler panicked".into()))??;

    Ok(Json(generated))
}

#[instrument(skip(state))]
pub async fn search_public_files(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<SearchQuery>,
) -> AxonResult<Json<Vec<String>>> {
    let tree = resolve_active_tree(&state, &id, "system").await?;
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
        
    Ok(Json(final_paths))
}