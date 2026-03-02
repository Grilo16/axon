#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, sync::Arc};

use axon_core::{
    bundler::rules::{BundleOptions, RedactionRule}, error::{AxonError, AxonResult}, explorer::{ExplorerEntry, TreeExplorer}, graph::{AxonGraph, AxonGraphView}, parser::javascript::JsTsParser, tree::{AxonTree, options::{AxonScanOptions}, source::OsSource}
};
use axon_desktop_lib::state::AppState;
use tauri::Manager;

#[tauri::command]
async fn load_workspace(path: String, state: tauri::State<'_, AppState>) -> AxonResult<()> {
    let root = std::path::PathBuf::from(&path);

    println!("🔄 Loading workspace from disk...");

    // 1. Setup Configuration & Tools
    let options = AxonScanOptions::auto_detect(&root);
    let parser = JsTsParser;
    let source_manager = OsSource::new(root.clone());

    // 2. Execute the Pipeline
    let analyzed_tree = AxonTree::new(root, options)?
        .scan_os()?
        .load_all_sources(&source_manager)
        .await?
        .analyze(&parser)
        .await?;

    // 3. Wrap in Arc for cheap, lock-free cloning
    let shared_tree = Arc::new(analyzed_tree);

    // 4. Lock the state for WRITING and update the cache
    let mut cache_write = state.tree_cache.write().await;
    *cache_write = Some(shared_tree);

    println!("✅ Workspace loaded and cached in RAM!");

    Ok(())
}

#[tauri::command]
async fn get_all_file_paths(
    limit: Option<usize>,
    state: tauri::State<'_, AppState>,
) -> AxonResult<Vec<String>> {
    
    // 1. Grab the read lock (Zero-latency)
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read.as_ref().ok_or_else(|| {
        axon_core::error::AxonError::Backend("No workspace loaded!".to_string())
    })?;

    // 2. Call our new hyper-fast method
    Ok(tree.get_all_file_paths(limit))
}

#[tauri::command]
async fn get_file_paths_by_dir(
    path: String,
    recursive: bool,
    limit: Option<usize>,
    state: tauri::State<'_, AppState>,
) -> AxonResult<Vec<String>> {
    
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read.as_ref().ok_or_else(|| {
        axon_core::error::AxonError::Backend("No workspace loaded!".to_string())
    })?;

    let paths = tree.get_file_paths_by_dir(&path, recursive, limit)
        .ok_or_else(|| axon_core::error::AxonError::NotFound {
            entity: "Directory",
            id: path.clone(),
        })?;

    Ok(paths)
}

#[tauri::command]
async fn get_focused_graph(
    requested_paths: Vec<String>,
    state: tauri::State<'_, AppState>,
) -> AxonResult<AxonGraphView> {
    // 1. Lock the state for READING.
    // This is virtually instant and doesn't block other readers.
    let cache_read = state.tree_cache.read().await;

    // 2. Safely extract the tree, or throw a clean error if they forgot to load the workspace
    let tree = cache_read.as_ref().ok_or_else(|| {
        axon_core::error::AxonError::Backend(
            "Tried to request a graph, but no workspace is loaded!".to_string(),
        )
    })?;

    // 3. Do the math
    let graph = AxonGraph::build(tree); // Uses the new builder we made!
    let focus_refs: Vec<&str> = requested_paths.iter().map(|s| s.as_str()).collect();
    let focused_view = graph.to_view(tree, &focus_refs, true);

    Ok(focused_view)
}

#[tauri::command]
async fn read_file(
    path: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, axon_core::error::AxonError> {
    
    // 1. Instantly grab the read lock
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read.as_ref().ok_or_else(|| {
        axon_core::error::AxonError::Backend("No workspace loaded!".to_string())
    })?;

    // 2. Fetch the text directly from memory
    let content = tree.read_file_content(&path)
        .ok_or_else(|| axon_core::error::AxonError::NotFound {
            entity: "File",
            id: path.clone(),
        })?;

    Ok(content)
}

#[tauri::command]
async fn generate_bundle(
    rules: Vec<RedactionRule>,
    target_files: Vec<String>,
    state: tauri::State<'_, AppState>,
) -> AxonResult<HashMap<String, String>> {
    
    println!("📦 Generating bundle with {} entry points and {} rules...", 
       target_files.len(), 
       rules.len()
    );

    // 1. Grab the instant read lock from our RAM cache
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read.as_ref().ok_or_else(|| {
        axon_core::error::AxonError::Backend("No workspace loaded!".to_string())
    })?;

    // 2. Spin up the bundler engine
    let bundle_options = BundleOptions{rules, target_files};
    let bundler = axon_core::bundler::AxonBundler::new(tree, bundle_options);
    
    // 3. Execute and map any string errors to our AxonError
    let bundle = bundler.generate_bundle().map_err(|e| {
        axon_core::error::AxonError::Backend(format!("Bundler failed: {}", e))
    })?;

    println!("✅ Bundle generated successfully! Included {} files.", bundle.len());

    Ok(bundle)
}

#[tauri::command]
async fn list_directory(
    path: String,
    state: tauri::State<'_, AppState>,
) -> AxonResult<Vec<ExplorerEntry>> {
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read
        .as_ref()
        .ok_or_else(|| AxonError::Backend("No workspace loaded!".to_string()))?;

    TreeExplorer::list_directory(tree, &path)
}

fn main() {
    tauri::Builder::default()
    .setup(|app| {
            // 1. Get the official OS AppData directory for your app
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            
            // 2. Ensure the folder exists
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
            
            // 3. Create the absolute path to the SQLite file
            let db_path = app_data_dir.join("axon_dev.db");
            let _db_url = format!("sqlite://{}", db_path.to_str().unwrap());
            
            // 4. Initialize the repo using the runtime path!
            // Note: You would block_on this or spawn an async task in Tauri setup
            // let repo = SqliteWorkspaceRepo::new(&db_url).await.unwrap();
            
            // Store it in Tauri state...
            // app.manage(repo);

            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            list_directory,
            load_workspace,
            get_focused_graph,
            get_all_file_paths,
            get_file_paths_by_dir,
            read_file,
            generate_bundle,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
