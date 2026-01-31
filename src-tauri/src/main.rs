#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use serde::Serialize;
use std::collections::{HashMap, HashSet}; // Removed HashSet from here to avoid confusion
use std::fs;
use std::path::{Path, PathBuf};

// Unified import
use axon_core::{core::graph, engine::crawler::Crawler, paths};

use petgraph::Graph;

use axon_core::analysis::javascript::skeleton::SkeletonTarget;
use axon_core::features::prompt;

// 1. Define a struct to receive options from React
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptOptions {
    pub show_line_numbers: bool,
    pub remove_comments: bool,
    pub redactions: Vec<String>,
    // Skeleton mode: "all", "none", "keep_only", "strip_only"
    pub skeleton_mode: String,
    pub skeleton_targets: Vec<String>,
}

#[derive(Serialize)]
pub struct AxonNode {
    pub id: String,
    pub r#type: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    pub position: Position,
    pub data: NodeData,
}

#[derive(Serialize)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Serialize)]
pub struct NodeData {
    pub label: String,
    pub definitions: Vec<String>,
    pub calls: Vec<String>,
    pub path: String,
}

#[derive(Serialize)]
pub struct AxonEdge {
    pub id: String,
    pub source: String,
    pub target: String,
}

#[derive(Serialize)]
pub struct ScanResponse {
    pub nodes: Vec<AxonNode>,
    pub edges: Vec<AxonEdge>,
}

pub fn compute_layout(nodes: &mut Vec<AxonNode>, edges: &[AxonEdge]) {
    if nodes.is_empty() {
        return;
    }

    let mut g = Graph::<String, ()>::new();
    let mut node_map = HashMap::new();

    // 1. Build the Graph
    for node in nodes.iter() {
        let idx = g.add_node(node.id.clone());
        node_map.insert(node.id.clone(), idx);
    }

    for edge in edges {
        if let (Some(s), Some(t)) = (node_map.get(&edge.source), node_map.get(&edge.target)) {
            g.add_edge(*s, *t, ());
        }
    }

    let mut ranks: HashMap<String, u32> = HashMap::new();

    // 3. The "Shortest Path" Algorithm (BFS)
    // This ensures nodes appear at the FIRST level they are needed.
    let mut queue: std::collections::VecDeque<(String, u32)> = std::collections::VecDeque::new();

    // Find roots (nodes with no incoming edges) to start BFS
    let mut roots = Vec::new();
    for node in nodes.iter() {
        let node_idx = node_map[&node.id];
        if g.neighbors_directed(node_idx, petgraph::Direction::Incoming)
            .count()
            == 0
        {
            roots.push(node.id.clone());
        }
    }

    // If no roots found (circular graph?), pick the first node in the list
    if roots.is_empty() && !nodes.is_empty() {
        roots.push(nodes[0].id.clone());
    }

    // Initialize Queue
    for root in roots {
        ranks.insert(root.clone(), 0);
        queue.push_back((root, 0));
    }

    // Run BFS
    while let Some((current_id, current_rank)) = queue.pop_front() {
        let current_idx = node_map[&current_id];

        for neighbor_idx in g.neighbors(current_idx) {
            let neighbor_id = &g[neighbor_idx];

            // Only assign rank if we haven't seen this node yet!
            // This is the key: We respect the "Shortest Path" to the node.
            if !ranks.contains_key(neighbor_id) {
                let new_rank = current_rank + 1;
                ranks.insert(neighbor_id.clone(), new_rank);
                queue.push_back((neighbor_id.clone(), new_rank));
            }
        }
    }

    // Fallback: If any nodes were unreachable (islands), assign them to Rank 0 or below main graph
    for node in nodes.iter() {
        ranks.entry(node.id.clone()).or_insert(0);
    }

    // 4. Assign Coordinates & Center Logic
    let mut rank_counts: HashMap<u32, f32> = HashMap::new();
    let mut rank_widths: HashMap<u32, f32> = HashMap::new();

    // First pass: Count width of each rank
    for node in nodes.iter() {
        let rank = *ranks.get(&node.id).unwrap_or(&0);
        let count = rank_widths.entry(rank).or_insert(0.0);
        *count += 1.0;
    }

    // Second pass: Set positions with centering
    let x_spacing = 350.0;
    let y_spacing = 450.0;

    // We sort nodes by rank just to be deterministic, though not strictly required
    nodes.sort_by_key(|n| ranks.get(&n.id).cloned().unwrap_or(0));

    for node in nodes.iter_mut() {
        let rank = *ranks.get(&node.id).unwrap_or(&0);

        // Get how many nodes are already placed on this rank
        let current_index = rank_counts.entry(rank).or_insert(0.0);
        let total_in_rank = *rank_widths.get(&rank).unwrap_or(&1.0);

        // Calculate Centering Offset
        // Logic: (TotalWidth * Spacing) / 2
        let row_width = total_in_rank * x_spacing;
        let x_start = -(row_width / 2.0);

        node.position.x = x_start + (*current_index * x_spacing);
        node.position.y = (rank as f32) * y_spacing;

        *current_index += 1.0;
    }
}
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupRequest {
    pub entry_point: String,
    pub depth: u32,
    pub flatten: bool,
}

#[tauri::command]
fn generate_combined_prompt(
    project_root: String,
    groups: Vec<GroupRequest>, // 👈 Receive all active groups
    options: PromptOptions,    // Global formatting options
) -> Result<String, String> {
    let root_path = PathBuf::from(&project_root);
    // The Master List of all files to include
    let mut master_visited: HashSet<PathBuf> = HashSet::new();
  
println!("options: mode={}, targets={}, redactions={}", options.skeleton_mode, options.skeleton_targets.len(), options.redactions.len());
    // 1. Run a crawl for EACH group
    // We do this separately so Group A can have Depth 2 and Group B can have Depth 5
    for group in groups {
        let mut crawler = Crawler::new(root_path.clone());
        crawler.set_flattening(group.flatten);
        crawler.set_depth(group.depth);

        let entry_path = PathBuf::from(&group.entry_point);

        // If crawl succeeds, merge the found files into the master list
        if let Ok(_) = crawler.crawl(vec![entry_path]) {
            master_visited.extend(crawler.visited);
        }
    }
    let mode_norm = options.skeleton_mode.trim().to_ascii_lowercase();
    // 2. Prepare the Skeleton Config

    let skeleton_config = match mode_norm.as_str() {
        "all" => Some(SkeletonTarget::All),
        "keeponly" => Some(SkeletonTarget::KeepOnly(options.skeleton_targets)),
        "striponly" => Some(SkeletonTarget::StripOnly(options.skeleton_targets)),
        _ => None,
    };
    // 3. Build ONE unified context
    // This function automatically deduplicates because master_visited is a HashSet
    let config = prompt::PromptConfig {
        files: master_visited,
        project_root: root_path,
        redactions: options.redactions,
        show_line_numbers: options.show_line_numbers,
        remove_comments: options.remove_comments,
        skeleton_config,
    };

    let content =
        prompt::build_context(config).map_err(|e| format!("Prompt build failed: {}", e))?;

    Ok(content)
}

#[tauri::command]
fn scan_workspace_group(
    group_id: String,
    project_root: String,
    entry_point: String,
    depth: u32,
    flatten: bool,
) -> Result<ScanResponse, String> {
    let root_path = PathBuf::from(&project_root);
    let entry_path = PathBuf::from(&entry_point);

    let mut crawler = Crawler::new(root_path.clone());
    crawler.set_flattening(flatten);
    crawler.set_depth(depth);

    crawler.crawl(vec![entry_path]).map_err(|e| e.to_string())?;

    // 🎯 USE THE CORE LOGIC
    let core_map = graph::generate_map(
        &root_path,
        &crawler.visited,
        &crawler.links,
        &crawler.symbol_map,
    );

    // 🎨 CONVERT CORE MAP TO UI-SPECIFIC ScanResponse
    let mut depth_counts: HashMap<u32, f32> = HashMap::new();

    let mut ui_nodes: Vec<AxonNode> = core_map
        .nodes
        .iter()
        .map(|node| {
            // Simple heuristic: Y is based on directory nesting depth
            let node_depth = node.id.split('/').count() as u32;
            let x_idx = depth_counts.entry(node_depth).or_insert(0.0);
            let pos = Position {
                x: *x_idx * 300.0,
                y: (node_depth as f32) * 250.0,
            };
            *x_idx += 1.0;

            AxonNode {
                id: node.id.clone(),
                r#type: "fileNode".to_string(),
                parent_id: Some(group_id.clone()),
                position: pos,
                data: NodeData {
                    label: Path::new(&node.id)
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .into(),
                    definitions: node.definitions.clone(),
                    calls: node.calls.clone(),
                    path: node.id.clone(),
                },
            }
        })
        .collect();

    let ui_edges: Vec<AxonEdge> = core_map
        .links
        .iter()
        .map(|link| AxonEdge {
            id: format!("{}-{}", link.source, link.target),
            source: link.source.clone(),
            target: link.target.clone(),
        })
        .collect();

    // Pass as a reference slice (&[AxonEdge])
    compute_layout(&mut ui_nodes, &ui_edges);

    Ok(ScanResponse {
        nodes: ui_nodes,
        edges: ui_edges,
    })
}

#[tauri::command]
fn list_files(path: String) -> Result<Vec<paths::FileEntry>, String> {
    paths::get_directory_items(std::path::Path::new(&path)).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_files,
            read_file_content,
            scan_workspace_group,
            generate_combined_prompt
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
