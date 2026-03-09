use std::sync::Arc;
use std::path::PathBuf;
use axon_core::{
    tree::{AxonTree, options::AxonScanOptions, source::OsSource, state::Analyzed},
    parser::javascript::JsTsParser,
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

    // 2. Fetch from Cache or Lazily Compute
    state.get_or_compute_tree(workspace_id, || async move {
        tokio::task::spawn_blocking(move || {
            // 🌟 THE FIX: We declare the TempDir here at the top of the closure.
            // This ensures it lives until the very end of the closure block.
            let mut _ephemeral_dir = None;

            let target_path = if is_local_sandbox(&workspace.project_root) {
                info!("📂 Loading local sandbox workspace '{}' directly from disk...", workspace.name);
                PathBuf::from(&workspace.project_root)
            } else {
                info!("🔄 RAM Cache miss. Lazily cloning GitHub workspace '{}'...", workspace.name);
                
                let temp_dir = tempfile::Builder::new().prefix("axon_git_").tempdir()
                    .map_err(|e| AxonError::Backend(format!("Temp dir failed: {}", e)))?;
                let temp_path = temp_dir.path().to_path_buf();
                
                let status = std::process::Command::new("git")
                    .args(["clone", "--depth", "1", &workspace.project_root])
                    .arg(&temp_path).status()
                    .map_err(|e| AxonError::Backend(format!("Git execution failed: {}", e)))?;

                if !status.success() { 
                    return Err(AxonError::Backend("Git clone failed. Is the repo public?".into())); 
                }
                _ephemeral_dir = Some(temp_dir); 
                temp_path
            };

            // 1. The files are securely on disk here.
            let options = AxonScanOptions::auto_detect(&target_path);
            let parser = JsTsParser;
            let source_manager = OsSource::new(target_path.clone());

            // 2. We read all the files and build the AST in memory.
            let analyzed_tree = tokio::runtime::Handle::current().block_on(async {
                AxonTree::new(target_path, options)?
                    .scan_os()?
                    .load_all_sources(&source_manager).await?
                    .analyze(&parser).await
            })?;

            // 3. 🌟 As we hit this line, the closure finishes.
            // `_ephemeral_dir` goes out of scope, and Rust's Drop trait automatically 
            // wipes the folder from the hard drive. Pure memory safety!
            Ok(analyzed_tree)
        })
        .await
        .map_err(|_| AxonError::Backend("AST Parser thread panicked".into()))?
    }).await
}