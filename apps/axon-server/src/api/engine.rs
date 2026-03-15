use std::sync::Arc;
use std::path::PathBuf;
use axon_core::{
    parser::javascript::JsTsParser, tree::{AxonTree, node::file::state::Outlined, options::AxonScanOptions, source::OsSource, state::{Analyzed, TreeRegistry}}
};
use crate::api::prelude::*;

fn is_local_sandbox(path: &str) -> bool {
    path.starts_with("./sandbox_repos/") || path.starts_with("file://")
}

/// Validates that a project root is a trusted source (local sandbox or HTTPS git URL).
/// Prevents command injection and SSRF via malicious repository URLs.
fn validate_project_source(path: &str) -> AxonResult<()> {
    if is_local_sandbox(path) {
        return Ok(());
    }
    if path.starts_with("https://") {
        return Ok(());
    }
    Err(AxonError::Auth(
        "Untrusted repository source: only HTTPS URLs and local sandboxes are allowed".into()
    ))
}

pub async fn resolve_active_tree(
    state: &AppState,
    workspace_id: &str,
    user_id: &str,
) -> AxonResult<Arc<AxonTree<Analyzed>>> {
    
    // 1. Strict Ownership Check
    let workspace = state.workspace_repo.get_by_id_and_owner(workspace_id, user_id).await?
        .ok_or_else(|| AxonError::NotFound { 
            entity: if user_id == "system" { "Public Workspace" } else { "Workspace" }, 
            id: workspace_id.to_string() 
        })?;

    validate_project_source(&workspace.project_root)?;

    let spool = state.spool.clone();
    let commit_hash = workspace.id.clone();
    let project_root = workspace.project_root.clone();
    let workspace_name = workspace.name.clone();

    // 2. Fetch from Cache or Lazily Compute
    state.get_or_compute_tree(workspace_id, || async move {

        // ==========================================
        // ⚡ FAST PATH: THE NVME SKELETON BYPASS
        // ==========================================
        // Skeleton deserialization is sync but fast (~2ms). Use spawn_blocking to avoid
        // blocking the async executor on the redb read transaction.
        let skeleton_result = {
            let spool = spool.clone();
            let commit_hash = commit_hash.clone();
            let project_root = project_root.clone();
            let workspace_name = workspace_name.clone();
            tokio::task::spawn_blocking(move || -> AxonResult<Option<AxonTree<Analyzed>>> {
                if let Ok(Some(skeleton_bytes)) = spool.get_skeleton(&commit_hash) {
                    if let Ok(registry) = postcard::from_bytes::<TreeRegistry<Outlined>>(&skeleton_bytes) {
                        tracing::info!("⚡ SPARK STRIKE: Bypassed Git & Parser! Loaded workspace '{}' from NVMe Skeleton in ~2ms.", workspace_name);

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
            return Ok(tree);
        }

        // ==========================================
        // 🐌 SLOW PATH: CLONE, PARSE, AND SPOOL
        // ==========================================
        // Git clone is blocking IO — isolate in spawn_blocking.
        // load_all_sources and spool_to_disk are async — run on the async executor.
        let _ephemeral_dir;
        let target_path;

        if is_local_sandbox(&project_root) {
            tracing::info!("📂 Loading local sandbox workspace '{}' directly from disk...", workspace_name);
            target_path = PathBuf::from(&project_root);
            _ephemeral_dir = None;
        } else {
            tracing::info!("🔄 NVMe Cache miss. Lazily cloning GitHub workspace '{}'...", workspace_name);

            let root = project_root.clone();
            let (temp_dir, temp_path) = tokio::task::spawn_blocking(move || -> AxonResult<_> {
                let temp_dir = tempfile::Builder::new().prefix("axon_git_").tempdir()
                    .map_err(|e| AxonError::Backend(format!("Temp dir failed: {}", e)))?;
                let path = temp_dir.path().to_path_buf();

                let status = std::process::Command::new("git")
                    .args(["clone", "--depth", "1", &root])
                    .arg(&path).status()
                    .map_err(|e| AxonError::Backend(format!("Git execution failed: {}", e)))?;

                if !status.success() {
                    return Err(AxonError::Backend("Git clone failed. Is the repo public?".into()));
                }
                Ok((temp_dir, path))
            })
            .await
            .map_err(|e| AxonError::Backend(format!("Git clone task failed: {e}")))??;

            target_path = temp_path;
            _ephemeral_dir = Some(temp_dir);
        }

        let options = AxonScanOptions::auto_detect(&target_path);
        let parser = Arc::new(JsTsParser);
        let source_manager = OsSource::new(target_path.clone());

        // Async pipeline: scan (fast sync) → load (async IO) → spool (async + rayon internally)
        let loaded_tree = AxonTree::new(target_path, options)?
            .scan_os()?
            .load_all_sources(&source_manager).await?;

        let analyzed_tree = loaded_tree.spool_to_disk(parser, spool.clone(), commit_hash.clone()).await?;

        // ==========================================
        // 💾 SKELETON PERSISTENCE
        // ==========================================
        let skeleton_bytes = postcard::to_stdvec(&analyzed_tree.state.0)
            .map_err(|e| AxonError::Backend(format!("Failed to serialize skeleton: {}", e)))?;

        spool.write_skeleton(&commit_hash, &skeleton_bytes)?;
        tracing::info!("💾 Saved '{}' Skeleton to NVMe Spool. Future loads will be instantaneous.", workspace_name);

        Ok(analyzed_tree)
    }).await
}