#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use axon_core::{
    error::AxonResult,
    explorer::{ExplorerEntry, ExplorerFile, ExplorerFolder},
    graph::{AxonGraph, AxonGraphView},
    parser::javascript::JsTsParser,
    tree::{options::AxonScanOptions, source::OsSource, AxonTree},
};

#[tauri::command]
async fn build_graph(path: String) -> AxonResult<AxonGraphView> {
    let root = PathBuf::from(&path);
    let options = AxonScanOptions::default();
    let parser = JsTsParser;
    let tree = AxonTree::new(root.clone(), options)?.scan_os()?;
    let source_manager = OsSource::new(root);
    let loaded_tree = tree.load_all_sources(&source_manager).await?;
    let analyzed_tree = loaded_tree.analyze(&parser).await?;
    let graph = AxonGraph::new(&analyzed_tree);
    let graph_view = graph.to_view(&analyzed_tree);

    println!(
        "✅ Graph built successfully! Nodes: {} | Edges: {}",
        graph_view.nodes.len(),
        graph_view.edges.len()
    );

    Ok(graph_view)
}

#[tauri::command]
async fn list_directory(path: String) -> AxonResult<Vec<ExplorerEntry>> {
    // We convert the String to a PathBuf and let our core logic handle it
    let folder = ExplorerFolder::from_path(PathBuf::from(path));
    folder.list_contents()
}

#[tauri::command]
async fn read_file_content(path: String) -> AxonResult<String> {
    // We create a "dummy" ExplorerFile to use its read_content method
    // In a real app, you might want a specialized backend read function,
    // but this reuses your core logic perfectly.
    let file = ExplorerFile {
        name: "".to_string(), // Name doesn't matter for reading
        path: PathBuf::from(path),
        size: 0,
        extension: "".to_string(),
    };
    file.read_content()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_directory,
            read_file_content,
            build_graph
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
