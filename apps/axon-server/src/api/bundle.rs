use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use std::collections::HashMap;
use tracing::{info, instrument};
use uuid::Uuid;

use crate::state::AppState;
use axon_core::{
    domain::bundle::{BundleRecord, CloneBundleReq, CreateBundleReq, ListBundlesQuery, UpdateBundlePayload},
    error::{AxonError, AxonResult}, graph::{AxonGraph, AxonGraphView},
};

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphParams {
    #[serde(default)] 
    pub hide_barrel_exports: bool,
}

pub async fn create_bundle(
    State(state): State<AppState>,
    Json(payload): Json<CreateBundleReq>,
) -> Result<Json<BundleRecord>, StatusCode> {
    let now = Utc::now().to_rfc3339();
    let record = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id: payload.workspace_id,
        name: payload.name,
        options: payload.options,
        created_at: now.clone(),
        updated_at: now,
    };

    state
        .bundle_repo
        .create(record.clone())
        .await
        .map_err(|err| {
            println!("{}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(record))
}

pub async fn clone_bundle(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<CloneBundleReq>,
) -> Result<Json<BundleRecord>, StatusCode> {
    let new_id = Uuid::new_v4().to_string();
    let cloned_record = state
        .bundle_repo
        .duplicate(&id, &new_id, payload.new_name)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(cloned_record))
}

pub async fn get_bundle(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<BundleRecord>, StatusCode> {
    let record = state
        .bundle_repo
        .get_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(record))
}

pub async fn get_workspace_bundles(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ListBundlesQuery>,
) -> Result<Json<Vec<BundleRecord>>, StatusCode> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    let records = state
        .bundle_repo
        .get_by_workspace_id(&id, limit, offset)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(records))
}

pub async fn update_bundle(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateBundlePayload>,
) -> Result<StatusCode, StatusCode> {
    state
        .bundle_repo
        .update(&id, payload)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::OK)
}

pub async fn delete_bundle(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let deleted = state
        .bundle_repo
        .delete(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if deleted {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

// ==========================================
// 2. BUNDLER GENERATOR
// ==========================================

#[instrument(skip(state))]
pub async fn get_bundle_graph(
    State(state): State<AppState>,
    Path(id): Path<String>, 
    Query(params): Query<GraphParams>, // 🛠️ Use the struct here
) -> AxonResult<Json<AxonGraphView>> {
    info!("📊 Generating focused graph for bundle: {}", id);

    let bundle = state.bundle_repo.get_by_id(&id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Bundle".into(), id: id.clone() })?;

    let tree = state.active_trees.get(&bundle.workspace_id).await
        .ok_or_else(|| AxonError::Backend(format!("Workspace {} is not loaded in RAM!", bundle.workspace_id)))?;

    let view = tokio::task::spawn_blocking(move || {
        let graph = AxonGraph::build(&tree);
        let focus_refs: Vec<&str> = bundle.options.target_files.iter().map(|s| s.as_str()).collect();
        
        // Use the value from the struct!
        graph.to_view(&tree, &focus_refs, params.hide_barrel_exports)
    }).await.map_err(|_| AxonError::Backend("Graph builder panicked".into()))?;

    Ok(Json(view))
}

#[instrument(skip(state))]
pub async fn generate_bundle_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AxonResult<Json<HashMap<String, String>>> {
    info!("📦 Processing request to generate bundle: {}", id);

    // 1. Fetch Bundle Options from Postgres
    let bundle = state
        .bundle_repo
        .get_by_id(&id)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Bundle".into(),
            id: id.clone(),
        })?;

    // 2. Fetch the corresponding Workspace AST from Moka cache
    let tree = state
        .active_trees
        .get(&bundle.workspace_id)
        .await
        .ok_or_else(|| {
            AxonError::Backend(format!(
                "Workspace {} is not loaded in RAM!",
                bundle.workspace_id
            ))
        })?;

    // 3. Generate the bundle using DB options!
    let generated = tokio::task::spawn_blocking(move || {
        let bundler = axon_core::bundler::AxonBundler::new(&tree, bundle.options);
        bundler.generate_bundle()
    })
    .await
    .map_err(|_| AxonError::Backend("Bundler panicked".into()))??;

    info!("✅ Bundle generated successfully!");
    Ok(Json(generated))
}
