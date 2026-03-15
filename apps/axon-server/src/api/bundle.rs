use chrono::Utc;
use std::collections::HashMap;
use uuid::Uuid;

use crate::api::engine::resolve_active_tree;
use crate::api::prelude::*;
use crate::api::extractor::{VerifiedBundle, VerifiedWorkspace};
use crate::api::public::validate_bundle_options;
use axon_core::{
    domain::bundle::{
        BundleOptions, BundleRecord, CloneBundleReq, CreateBundleReq, ListBundlesQuery,
        UpdateBundlePayload,
    },
    graph::AxonGraph,
};

#[instrument(skip(ctx, payload))]
pub async fn create_bundle(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Json(payload): Json<CreateBundleReq>,
) -> AxonResult<Json<BundleRecord>> {
    validate_bundle_options(&payload.options)?;

    let now = Utc::now().to_rfc3339();
    let record = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id: workspace.id,
        name: payload.name,                 
        options: payload.options,           
        created_at: now.clone(),
        updated_at: now,
    };

    ctx.state.bundle_repo.create(record.clone()).await?; 
    Ok(Json(record))
}

#[instrument(skip(bundle))]
pub async fn get_bundle(
    // 🛡️ If this executes, they own the bundle AND its parent workspace.
    VerifiedBundle(bundle): VerifiedBundle,
) -> AxonResult<Json<BundleRecord>> {
    Ok(Json(bundle))
}

#[instrument(skip(ctx))]
pub async fn get_workspace_bundles(
    ctx: AuthContext,
    VerifiedWorkspace(workspace): VerifiedWorkspace,
    Query(query): Query<ListBundlesQuery>,
) -> AxonResult<Json<Vec<BundleRecord>>> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    let records = ctx
        .state
        .bundle_repo
        .get_by_workspace_id(&workspace.id, limit, offset)
        .await?; 
    Ok(Json(records))
}

#[instrument(skip(ctx, payload))]
pub async fn update_bundle(
    ctx: AuthContext,
    VerifiedBundle(bundle): VerifiedBundle,
    Json(payload): Json<UpdateBundlePayload>, 
) -> AxonResult<StatusCode> {
    if let Some(ref options) = payload.options {
        validate_bundle_options(options)?;
    }

    ctx.state.bundle_repo.update(&bundle.id, payload).await?; 
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn delete_bundle(
    ctx: AuthContext,
    VerifiedBundle(bundle): VerifiedBundle
) -> AxonResult<StatusCode> {
    // Delete first, then ensure at least one bundle remains.
    // This avoids the TOCTOU race where two concurrent deletes could both see count > 1
    // and skip fallback creation, leaving zero bundles.
    ctx.state.bundle_repo.delete(&bundle.id).await?;

    let remaining = ctx.state.bundle_repo
        .get_by_workspace_id(&bundle.workspace_id, 1, 0)
        .await?;

    if remaining.is_empty() {
        let now = Utc::now().to_rfc3339();
        let fallback = BundleRecord {
            id: Uuid::new_v4().to_string(),
            workspace_id: bundle.workspace_id.clone(),
            name: "Default Bundle".into(),
            options: BundleOptions::default(),
            created_at: now.clone(),
            updated_at: now,
        };
        info!("Creating fallback default bundle for workspace {}", bundle.workspace_id);
        ctx.state.bundle_repo.create(fallback).await?;
    }

    Ok(StatusCode::OK)
}

#[instrument(skip(ctx, payload))]
pub async fn clone_bundle(
    ctx: AuthContext,
    VerifiedBundle(bundle): VerifiedBundle,
    Json(payload): Json<CloneBundleReq>, 
) -> AxonResult<Json<BundleRecord>> {
    let new_id = Uuid::new_v4().to_string();
    let cloned_record = ctx
        .state
        .bundle_repo
        .duplicate(&bundle.id, &new_id, payload.new_name)
        .await?;

    Ok(Json(cloned_record))
}

#[instrument(skip(ctx))]
pub async fn get_bundle_graph(
    ctx: AuthContext,
    VerifiedBundle(bundle): VerifiedBundle,
) -> AxonResult<Json<serde_json::Value>> {
    let tree = resolve_active_tree(&ctx.state, &bundle.workspace_id, &ctx.user_id).await?;

    let view = tokio::task::spawn_blocking(move || {
        let spool = ctx.state.spool.clone();
        let commit_hash = bundle.workspace_id.clone();
        let graph = AxonGraph::build(&tree, &spool, &commit_hash);
        let focus_refs: Vec<&str> = bundle.options.target_files.iter().map(|s| s.as_str()).collect(); 
        
        graph.to_view(
            &tree,
            &spool,
            &commit_hash,
            &focus_refs,
            bundle.options.hide_barrel_exports,
        )
    })
    .await
    .map_err(|e| AxonError::Backend(format!("Graph builder task failed: {e}")))?;

    Ok(Json(serde_json::to_value(view)?))
}

#[instrument(skip(ctx))]
pub async fn generate_bundle_handler(
    ctx: AuthContext,
    VerifiedBundle(bundle): VerifiedBundle,
) -> AxonResult<Json<HashMap<String, String>>> {
    let tree = resolve_active_tree(&ctx.state, &bundle.workspace_id, &ctx.user_id).await?;

    let generated = tokio::task::spawn_blocking(move || {
        let spool = ctx.state.spool.clone();
        let commit_hash = bundle.workspace_id.clone();
        let bundler = axon_core::bundler::AxonBundler::new(&tree, &spool, &commit_hash, bundle.options);
        bundler.generate_bundle()
    })
    .await
    .map_err(|e| AxonError::Backend(format!("Bundler task failed: {e}")))??;

    info!("✅ Bundle generated successfully for {}!", bundle.id);
    Ok(Json(generated))
}