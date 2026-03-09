use tauri::State;
use uuid::Uuid;
use chrono::Utc;
use std::collections::{HashMap, HashSet};
use tracing::{info, instrument};

use crate::state::AppState;
use crate::commands::workspace::resolve_active_tree; // 🌟 Import our new engine!
use axon_core::{
   bundler::rules::BundleOptions, domain::bundle::{BundleRecord, CloneBundleReq, CreateBundleReq, ListBundlesQuery, UpdateBundlePayload}, error::{AxonError, AxonResult}, graph::{AxonGraph, AxonGraphView}
};

// ==========================================
// VALIDATION LOGIC
// ==========================================

pub fn validate_bundle_options(options: &BundleOptions) -> AxonResult<()> {
    let mut seen_targets = HashSet::new();

    for rule in &options.rules {
        let target_key = serde_json::to_string(&rule.target)
            .map_err(|_| AxonError::Parse { path: "BundleOptions".into(), message: "Failed to serialize target".into() })?;

        if !seen_targets.insert(target_key) {
            return Err(AxonError::Parse {
                path: "BundleOptions".into(),
                message: format!("Duplicate redaction rule detected for target: {:?}", rule.target),
            });
        }
    }
    Ok(())
}

// ==========================================
// 1. CRUD HANDLERS
// ==========================================

#[tauri::command]
pub async fn create_bundle(
    state: State<'_, AppState>, 
    payload: CreateBundleReq 
) -> AxonResult<BundleRecord> {
    validate_bundle_options(&payload.options)?; // 🌟 Validate!

    let now = Utc::now().to_rfc3339();
    let record = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id: payload.workspace_id,
        name: payload.name,
        options: payload.options,
        created_at: now.clone(),
        updated_at: now,
    };
    state.bundle_repo.create(record.clone()).await?;
    Ok(record)
}

#[tauri::command]
pub async fn clone_bundle(state: State<'_, AppState>, id: String, payload: CloneBundleReq) -> AxonResult<BundleRecord> {
    let new_id = Uuid::new_v4().to_string();
    let cloned_record = state.bundle_repo.duplicate(&id, &new_id, payload.new_name).await?;
    Ok(cloned_record)
}

#[tauri::command]
pub async fn get_bundle(state: State<'_, AppState>, id: String) -> AxonResult<BundleRecord> {
    state.bundle_repo.get_by_id(&id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Bundle".into(), id: id.clone() })
}

#[tauri::command]
pub async fn get_workspace_bundles(state: State<'_, AppState>, id: String, query: ListBundlesQuery) -> AxonResult<Vec<BundleRecord>> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);
    state.bundle_repo.get_by_workspace_id(&id, limit, offset).await
}

#[tauri::command]
pub async fn update_bundle(state: State<'_, AppState>, id: String, payload: UpdateBundlePayload) -> AxonResult<()> {
    if let Some(ref options) = payload.options {
        validate_bundle_options(options)?; // 🌟 Validate!
    }
    state.bundle_repo.update(&id, payload).await
}

#[tauri::command]
pub async fn delete_bundle(state: State<'_, AppState>, id: String) -> AxonResult<bool> {
    let bundle = state.bundle_repo.get_by_id(&id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Bundle".into(), id: id.clone() })?;

    // 🌟 Fallback logic: Ensure there's always at least one bundle
    let existing = state.bundle_repo.get_by_workspace_id(&bundle.workspace_id, 2, 0).await?;
    if existing.len() <= 1 {
        let now = Utc::now().to_rfc3339();
        let fallback = BundleRecord {
            id: Uuid::new_v4().to_string(),
            workspace_id: bundle.workspace_id.clone(),
            name: "Default Bundle".into(),
            options: BundleOptions::default(),
            created_at: now.clone(),
            updated_at: now,
        };
        state.bundle_repo.create(fallback).await?;
    }

    state.bundle_repo.delete(&id).await
}

// ==========================================
// 2. GENERATION & GRAPH HANDLERS
// ==========================================

#[tauri::command]
#[instrument(skip(state))]
pub async fn get_bundle_graph(state: State<'_, AppState>, id: String) -> AxonResult<AxonGraphView> {
    info!("📊 Generating graph for desktop bundle: {}", id);

    let bundle = state.bundle_repo.get_by_id(&id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Bundle".into(), id: id.clone() })?;

    // 🌟 Lazy load the tree!
    let tree = resolve_active_tree(&state, &bundle.workspace_id).await?;

    let view = tokio::task::spawn_blocking(move || {
        let graph = AxonGraph::build(&tree);
        let focus_refs: Vec<&str> = bundle.options.target_files.iter().map(|s| s.as_str()).collect();
        graph.to_view(&tree, &focus_refs, bundle.options.hide_barrel_exports)
    }).await.map_err(|_| AxonError::Backend("Graph builder panicked".into()))?;

    Ok(view)
}

#[tauri::command]
#[instrument(skip(state))]
pub async fn generate_bundle(state: State<'_, AppState>, id: String) -> AxonResult<HashMap<String, String>> {
    info!("📦 Generating bundle for desktop: {}", id);

    let bundle = state.bundle_repo.get_by_id(&id).await?
        .ok_or_else(|| AxonError::NotFound { entity: "Bundle".into(), id: id.clone() })?;

    // 🌟 Lazy load the tree!
    let tree = resolve_active_tree(&state, &bundle.workspace_id).await?;

    let generated = tokio::task::spawn_blocking(move || {
        let bundler = axon_core::bundler::AxonBundler::new(&tree, bundle.options);
        bundler.generate_bundle()
    }).await.map_err(|_| AxonError::Backend("Bundler panicked".into()))??;

    Ok(generated)
}