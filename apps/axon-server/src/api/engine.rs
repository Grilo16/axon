use std::sync::Arc;
use std::path::PathBuf;
use axon_core::{
    parser::javascript::JsTsParser, tree::{AxonTree, node::file::state::Outlined, options::AxonScanOptions, source::OsSource, state::{Analyzed, TreeRegistry}}
};
use crate::api::prelude::*;

fn is_local_sandbox(path: &str) -> bool {
    path.starts_with("./sandbox_repos/") || path.starts_with("file://")
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

    let spool = state.spool.clone();
    let commit_hash = workspace.id.clone();
    let project_root = workspace.project_root.clone();
    let workspace_name = workspace.name.clone();

    // 2. Fetch from Cache or Lazily Compute
    state.get_or_compute_tree(workspace_id, || async move {
        tokio::task::spawn_blocking(move || {
            
            // ==========================================
            // ⚡ FAST PATH: THE NVME SKELETON BYPASS
            // ==========================================
            if let Ok(Some(skeleton_bytes)) = spool.get_skeleton(&commit_hash) {
                if let Ok(registry) = postcard::from_bytes::<TreeRegistry<Outlined>>(&skeleton_bytes) {
                    tracing::info!("⚡ SPARK STRIKE: Bypassed Git & Parser! Loaded workspace '{}' from NVMe Skeleton in ~2ms.", workspace_name);
                    
                    let target_path = PathBuf::from(&project_root);
                    let options = AxonScanOptions::auto_detect(&target_path);
                    
                    // 🛡️ Return the RAW tree. get_or_compute_tree will wrap it in an Arc.
                    return Ok(AxonTree {
                        core: axon_core::tree::AxonTreeCore { 
                            root: target_path.into(), 
                            scan: options, 
                        },
                        state: Analyzed(registry),
                    });
                }
            }

            // ==========================================
            // 🐌 SLOW PATH: CLONE, PARSE, AND SPOOL
            // ==========================================
            let mut _ephemeral_dir = None;

            let target_path = if is_local_sandbox(&project_root) {
                tracing::info!("📂 Loading local sandbox workspace '{}' directly from disk...", workspace_name);
                PathBuf::from(&project_root)
            } else {
                tracing::info!("🔄 NVMe Cache miss. Lazily cloning GitHub workspace '{}'...", workspace_name);
                
                let temp_dir = tempfile::Builder::new().prefix("axon_git_").tempdir()
                    .map_err(|e| AxonError::Backend(format!("Temp dir failed: {}", e)))?;
                let temp_path = temp_dir.path().to_path_buf();
                
                let status = std::process::Command::new("git")
                    .args(["clone", "--depth", "1", &project_root])
                    .arg(&temp_path).status()
                    .map_err(|e| AxonError::Backend(format!("Git execution failed: {}", e)))?;

                if !status.success() { 
                    return Err(AxonError::Backend("Git clone failed. Is the repo public?".into())); 
                }
                _ephemeral_dir = Some(temp_dir); 
                temp_path
            };

            let options = AxonScanOptions::auto_detect(&target_path);
            let parser = Arc::new(JsTsParser);
            let source_manager = OsSource::new(target_path.clone());

            let analyzed_tree = tokio::runtime::Handle::current().block_on(async {
                let loaded_tree = AxonTree::new(target_path, options)?
                    .scan_os()?
                    .load_all_sources(&source_manager).await?;

                loaded_tree.spool_to_disk(parser, spool.clone(), commit_hash.clone()).await
            })?;

            // ==========================================
            // 💾 SKELETON PERSISTENCE
            // ==========================================
            let skeleton_bytes = postcard::to_stdvec(&analyzed_tree.state.0)
                .map_err(|e| AxonError::Backend(format!("Failed to serialize skeleton: {}", e)))?;
            
            spool.write_skeleton(&commit_hash, &skeleton_bytes)?;
            tracing::info!("💾 Saved '{}' Skeleton to NVMe Spool. Future loads will be instantaneous.", workspace_name);

            // 🛡️ Return the RAW tree. get_or_compute_tree will wrap it in an Arc.
            Ok(analyzed_tree)
        })
        .await
        .map_err(|_| AxonError::Backend("AST Parser thread panicked".into()))?
    }).await
}