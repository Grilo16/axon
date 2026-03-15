use chrono::Utc;
use std::collections::HashMap;
use uuid::Uuid;

use crate::api::engine::resolve_active_tree;
use crate::api::prelude::*;
use crate::api::public::validate_bundle_options;
use axon_core::{
    domain::bundle::{
        BundleOptions, BundleRecord, CloneBundleReq, CreateBundleReq, ListBundlesQuery,
        UpdateBundlePayload,
    },
    graph::AxonGraph,
};

async fn verify_bundle_access(
    state: &AppState,
    bundle_id: &str,
    user_id: &str,
) -> AxonResult<BundleRecord> {
    let bundle = state
        .bundle_repo
        .get_by_id(bundle_id)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Bundle",
            id: bundle_id.to_string(),
        })?;

    let _ = state
        .workspace_repo
        .get_by_id_and_owner(&bundle.workspace_id, user_id)
        .await?
        .ok_or_else(|| AxonError::Auth("User does not own this bundle's workspace".into()))?;

    Ok(bundle)
}

#[instrument(skip(ctx, payload))]
pub async fn create_bundle(
    ctx: AuthContext,
    Json(payload): Json<CreateBundleReq>, //
) -> AxonResult<Json<BundleRecord>> {
    // 🌟 Validate the rules before spending time hitting the DB
    validate_bundle_options(&payload.options)?;

    let _ = ctx
        .state
        .workspace_repo
        .get_by_id_and_owner(&payload.workspace_id, &ctx.user_id)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Workspace",
            id: payload.workspace_id.clone(),
        })?;

    let now = Utc::now().to_rfc3339();
    let record = BundleRecord {
        id: Uuid::new_v4().to_string(),
        workspace_id: payload.workspace_id, //
        name: payload.name,                 //
        options: payload.options,           //
        created_at: now.clone(),
        updated_at: now,
    };

    ctx.state.bundle_repo.create(record.clone()).await?; //
    Ok(Json(record))
}

#[instrument(skip(ctx))]
pub async fn get_bundle(
    ctx: AuthContext,
    Path(id): Path<String>,
) -> AxonResult<Json<BundleRecord>> {
    let bundle = verify_bundle_access(&ctx.state, &id, &ctx.user_id).await?;
    Ok(Json(bundle))
}

#[instrument(skip(ctx))]
pub async fn get_workspace_bundles(
    ctx: AuthContext,
    Path(workspace_id): Path<String>,
    Query(query): Query<ListBundlesQuery>, //
) -> AxonResult<Json<Vec<BundleRecord>>> {
    let _ = ctx
        .state
        .workspace_repo
        .get_by_id_and_owner(&workspace_id, &ctx.user_id)
        .await?
        .ok_or_else(|| AxonError::NotFound {
            entity: "Workspace",
            id: workspace_id.clone(),
        })?;

    let limit = query.limit.unwrap_or(50); //
    let offset = query.offset.unwrap_or(0); //

    let records = ctx
        .state
        .bundle_repo
        .get_by_workspace_id(&workspace_id, limit, offset)
        .await?; //
    Ok(Json(records))
}

#[instrument(skip(ctx, payload))]
pub async fn update_bundle(
    ctx: AuthContext,
    Path(id): Path<String>,
    Json(payload): Json<UpdateBundlePayload>, //
) -> AxonResult<StatusCode> {
    // 🌟 Validate the rules if options are being updated
    if let Some(ref options) = payload.options {
        //
        validate_bundle_options(options)?;
    }

    let _ = verify_bundle_access(&ctx.state, &id, &ctx.user_id).await?;

    ctx.state.bundle_repo.update(&id, payload).await?; //
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx))]
pub async fn delete_bundle(ctx: AuthContext, Path(id): Path<String>) -> AxonResult<StatusCode> {
    let bundle = verify_bundle_access(&ctx.state, &id, &ctx.user_id).await?;

    let existing_bundles = ctx
        .state
        .bundle_repo
        .get_by_workspace_id(&bundle.workspace_id, 2, 0)
        .await?; //
    if existing_bundles.len() <= 1 {
        let now = Utc::now().to_rfc3339();
        let fallback = BundleRecord {
            id: Uuid::new_v4().to_string(),
            workspace_id: bundle.workspace_id.clone(),
            name: "Default Bundle".into(),
            options: BundleOptions::default(),
            created_at: now.clone(),
            updated_at: now,
        };
        info!(
            "Creating fallback default bundle for workspace {}",
            bundle.workspace_id
        );
        ctx.state.bundle_repo.create(fallback).await?; //
    }

    ctx.state.bundle_repo.delete(&id).await?; //
    Ok(StatusCode::OK)
}

#[instrument(skip(ctx, payload))]
pub async fn clone_bundle(
    ctx: AuthContext,
    Path(id): Path<String>,
    Json(payload): Json<CloneBundleReq>, //
) -> AxonResult<Json<BundleRecord>> {
    let _source_bundle = verify_bundle_access(&ctx.state, &id, &ctx.user_id).await?;
    let new_id = Uuid::new_v4().to_string();
    let cloned_record = ctx
        .state
        .bundle_repo
        .duplicate(&id, &new_id, payload.new_name)
        .await?; //

    Ok(Json(cloned_record))
}

#[instrument(skip(ctx))]
pub async fn get_bundle_graph(
    ctx: AuthContext,
    Path(id): Path<String>,
) -> AxonResult<Json<serde_json::Value>> {
    let bundle = verify_bundle_access(&ctx.state, &id, &ctx.user_id).await?;

    let tree = resolve_active_tree(&ctx.state, &bundle.workspace_id, &ctx.user_id).await?;

    let view = tokio::task::spawn_blocking(move || {
        let spool = ctx.state.spool.clone();
        let commit_hash = bundle.workspace_id.clone();
        let graph = AxonGraph::build(&tree, &spool, &commit_hash);
        let focus_refs: Vec<&str> = bundle
            .options
            .target_files
            .iter()
            .map(|s| s.as_str())
            .collect(); 
        graph.to_view(
            &tree,
            &spool,
            &commit_hash,
            &focus_refs,
            bundle.options.hide_barrel_exports,
        )
    })
    .await
    .map_err(|_| AxonError::Backend("Graph builder panicked".into()))?;

    Ok(Json(serde_json::to_value(view)?))
}

#[instrument(skip(ctx))]
pub async fn generate_bundle_handler(
    ctx: AuthContext,
    Path(id): Path<String>,
) -> AxonResult<Json<HashMap<String, String>>> {
    let bundle = verify_bundle_access(&ctx.state, &id, &ctx.user_id).await?;
     let spool = ctx.state.spool.clone();
        let commit_hash = bundle.workspace_id.clone();
    let tree = resolve_active_tree(&ctx.state, &bundle.workspace_id, &ctx.user_id).await?;

    let generated = tokio::task::spawn_blocking(move || {
        let bundler = axon_core::bundler::AxonBundler::new(&tree, &spool, &commit_hash, bundle.options);
        bundler.generate_bundle()
    })
    .await
    .map_err(|_| AxonError::Backend("Bundler panicked".into()))??;

    info!("✅ Bundle generated successfully for {}!", id);
    Ok(Json(generated))
}
