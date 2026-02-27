#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, path::PathBuf, sync::Arc};

use axon_core::{
    bundler::rules::BundleOptions, error::{AxonError, AxonResult}, explorer::{ExplorerEntry, TreeExplorer}, graph::{AxonGraph, AxonGraphView}, parser::javascript::JsTsParser, tree::{AxonTree, options::AxonScanOptions, source::OsSource}
};
use axon_desktop_lib::state::AxonAppState;

#[tauri::command]
async fn load_workspace(path: String, state: tauri::State<'_, AxonAppState>) -> AxonResult<()> {
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
    state: tauri::State<'_, AxonAppState>,
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
    state: tauri::State<'_, AxonAppState>,
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
    state: tauri::State<'_, AxonAppState>,
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
    state: tauri::State<'_, AxonAppState>,
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
async fn build_graph(path: String) -> AxonResult<AxonGraphView> {
    let root = PathBuf::from(&path);
    let tsconfig_path = root.join("tsconfig.app.json");
    let options = AxonScanOptions::default().with_tsconfig(tsconfig_path)?;
    let parser = JsTsParser;
    let tree = AxonTree::new(root.clone(), options)?.scan_os()?;
    let source_manager = OsSource::new(root);
    let loaded_tree = tree.load_all_sources(&source_manager).await?;
    let analyzed_tree = loaded_tree.analyze(&parser).await?;
    let graph = AxonGraph::build(&analyzed_tree);
    let graph_view = graph.to_view(&analyzed_tree, &[], true);

    println!(
        "✅ Graph built successfully! Nodes: {} | Edges: {}",
        graph_view.nodes.len(),
        graph_view.edges.len()
    );

    Ok(graph_view)
}

#[tauri::command]
async fn generate_bundle(
    options: BundleOptions,
    state: tauri::State<'_, AxonAppState>,
) -> AxonResult<HashMap<String, String>> {
    
    println!("📦 Generating bundle with {} entry points and {} rules...", 
        options.target_files.len(), 
        options.rules.len()
    );

    // 1. Grab the instant read lock from our RAM cache
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read.as_ref().ok_or_else(|| {
        axon_core::error::AxonError::Backend("No workspace loaded!".to_string())
    })?;

    // 2. Spin up the bundler engine
    let bundler = axon_core::bundler::AxonBundler::new(tree, options);
    
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
    state: tauri::State<'_, AxonAppState>,
) -> AxonResult<Vec<ExplorerEntry>> {
    let cache_read = state.tree_cache.read().await;
    let tree = cache_read
        .as_ref()
        .ok_or_else(|| AxonError::Backend("No workspace loaded!".to_string()))?;

    TreeExplorer::list_directory(tree, &path)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AxonAppState::new())
        .invoke_handler(tauri::generate_handler![
            list_directory,
            build_graph,
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
