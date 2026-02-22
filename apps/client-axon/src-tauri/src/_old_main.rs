#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

use axon_core::{core::graph, engine::crawler::Crawler, paths};
use axon_core::analysis::javascript::skeleton::SkeletonTarget;
use axon_core::features::prompt;

// ------------------------------
// Types from frontend
// ------------------------------

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptOptions {
    pub show_line_numbers: bool,
    pub remove_comments: bool,
    pub redactions: Vec<String>,
    pub skeleton_mode: String,
    pub skeleton_targets: Vec<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupRequest {
    pub entry_point: String,
    pub depth: u32,
    pub flatten: bool,
}

// ------------------------------
// UI wire types (ScanResponse)
// ------------------------------

#[derive(Serialize)]
pub struct AxonNode {
    pub id: String,
    pub r#type: String,
    #[serde(rename = "parentId", skip_serializing_if = "Option::is_none")]
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

    // ReactFlow edge renderer id
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub edge_type: Option<String>,

    #[serde(rename = "sourceHandle", skip_serializing_if = "Option::is_none")]
    pub source_handle: Option<String>,

    #[serde(rename = "targetHandle", skip_serializing_if = "Option::is_none")]
    pub target_handle: Option<String>,
}

#[derive(Serialize)]
pub struct ScanResponse {
    pub nodes: Vec<AxonNode>,
    pub edges: Vec<AxonEdge>,
}

// ------------------------------
// Layout: folder-tree + grid packing + wrapping blocks
// ------------------------------
//
// Why you were getting a long rectangle:
// - your previous layout placed folder spans in a single long horizontal strip.
// Fix:
// - treat each top-level folder as a "block" and pack blocks into rows (shelf packing).
// - each block internally uses folder-tree grid packing.
//
// RESULT: more square/tall footprint.

const X_SPACING: f32 = 330.0;   // column spacing
const ROW_Y: f32 = 230.0;       // row spacing within a folder level
const LEVEL_GAP: f32 = 120.0;   // gap between folder depths

const MAX_FILE_COLS_HINT: usize = 10; // direct-file grid columns cap
const GAP_COLS_BETWEEN_BLOCKS: usize = 2; // padding between packed blocks (in columns)
const ROW_GAP_PX: f32 = 260.0;  // vertical gap between packed block rows

// < 1.0 => wrap more => taller/more square
const WRAP_FACTOR: f64 = 0.95;

fn norm_slashes(s: &str) -> String {
    s.replace('\\', "/")
}

fn ceil_div(a: usize, b: usize) -> usize {
    if b == 0 { 0 } else { (a + b - 1) / b }
}

fn ceil_sqrt(n: usize) -> usize {
    if n <= 1 { return n.max(1); }
    (n as f64).sqrt().ceil() as usize
}

#[derive(Default)]
struct FolderTree {
    files: Vec<String>, // direct files in this folder (relative)
    children: BTreeMap<String, FolderTree>,

    // computed
    span_cols: usize,
    x_start: usize,
    depth: usize,
}

impl FolderTree {
    fn insert_file(&mut self, file_id: &str) {
        let id = norm_slashes(file_id);
        let mut parts: Vec<&str> = id.split('/').filter(|p| !p.is_empty()).collect();
        if parts.is_empty() { return; }

        // filename
        parts.pop();

        let mut cur = self;
        for seg in parts {
            cur = cur.children.entry(seg.to_string()).or_default();
        }
        cur.files.push(id);
    }

    fn compute_spans(&mut self) -> usize {
        self.files.sort();

        let mut child_sum = 0usize;
        for (_name, child) in self.children.iter_mut() {
            child_sum += child.compute_spans();
        }

        let n = self.files.len();
        let direct_cols = if n == 0 {
            0
        } else {
            ceil_sqrt(n).min(MAX_FILE_COLS_HINT).max(1)
        };

        let mut span = child_sum.max(direct_cols);
        if span == 0 && (!self.children.is_empty() || !self.files.is_empty()) {
            span = 1;
        }

        self.span_cols = span;
        span
    }

    fn assign_x_and_depth(&mut self, depth: usize, start_col: usize) {
        self.depth = depth;
        self.x_start = start_col;

        let mut cursor = start_col;
        for (_name, child) in self.children.iter_mut() {
            child.assign_x_and_depth(depth + 1, cursor);
            cursor += child.span_cols;
        }
    }

    fn collect_max_rows_by_depth(&self, max_rows: &mut Vec<usize>) {
        if max_rows.len() <= self.depth {
            max_rows.resize(self.depth + 1, 0);
        }

        let n = self.files.len();
        if n > 0 {
            let desired_cols = ceil_sqrt(n).min(MAX_FILE_COLS_HINT).max(1);
            let use_cols = desired_cols.min(self.span_cols.max(1));
            let rows = ceil_div(n, use_cols);
            max_rows[self.depth] = max_rows[self.depth].max(rows);
        }

        for (_name, child) in self.children.iter() {
            child.collect_max_rows_by_depth(max_rows);
        }
    }

    fn assign_file_positions(
        &self,
        y_offsets: &[f32],
        out: &mut HashMap<String, (f32, f32)>,
    ) {
        let n = self.files.len();
        if n > 0 {
            let desired_cols = ceil_sqrt(n).min(MAX_FILE_COLS_HINT).max(1);
            let use_cols = desired_cols.min(self.span_cols.max(1));

            // center the direct-file grid within the folder span
            let slack = self.span_cols.saturating_sub(use_cols);
            let x0 = self.x_start + slack / 2;

            for (i, file_id) in self.files.iter().enumerate() {
                let col = i % use_cols;
                let row = i / use_cols;

                let x = (x0 + col) as f32 * X_SPACING;
                let y = y_offsets
                    .get(self.depth)
                    .copied()
                    .unwrap_or(0.0)
                    + (row as f32 * ROW_Y);

                out.insert(file_id.clone(), (x, y));
            }
        }

        for (_name, child) in self.children.iter() {
            child.assign_file_positions(y_offsets, out);
        }
    }
}

fn build_y_offsets(max_rows: &[usize]) -> Vec<f32> {
    let mut y_offsets = vec![0.0; max_rows.len()];
    let mut y = 0.0;

    for (d, rows) in max_rows.iter().enumerate() {
        y_offsets[d] = y;

        let level_height = if *rows == 0 { 0.0 } else { (*rows as f32) * ROW_Y };
        y += level_height + LEVEL_GAP;
    }

    y_offsets
}

fn subtree_layout(sub: &mut FolderTree) -> (HashMap<String, (f32, f32)>, usize, f32) {
    // subtree-local: depth starts at 0 and x starts at 0
    sub.assign_x_and_depth(0, 0);

    let mut max_rows: Vec<usize> = Vec::new();
    sub.collect_max_rows_by_depth(&mut max_rows);
    let y_offsets = build_y_offsets(&max_rows);

    let mut pos: HashMap<String, (f32, f32)> = HashMap::new();
    sub.assign_file_positions(&y_offsets, &mut pos);

    // estimate subtree pixel height
    let mut h = 0.0;
    for (d, rows) in max_rows.iter().enumerate() {
        let y = y_offsets[d] + (*rows as f32) * ROW_Y;
        if y > h { h = y; }
    }
    h += LEVEL_GAP; // bottom padding

    (pos, sub.span_cols.max(1), h)
}

#[derive(Clone)]
struct Block {
    name: String,
    width_cols: usize,
    height_px: f32,
    positions: HashMap<String, (f32, f32)>,
}

fn compute_folder_grid_layout_wrapped(nodes: &mut [AxonNode]) {
    let mut root = FolderTree::default();
    for n in nodes.iter() {
        root.insert_file(&n.id);
    }

    root.compute_spans();

    // Build blocks: root-files block + each top-level folder subtree block
    let mut blocks: Vec<Block> = Vec::new();

    // Root files (no folder) as its own packed block, if any
    if !root.files.is_empty() {
        let mut root_files_block = FolderTree::default();
        root_files_block.files = root.files.clone();
        root_files_block.compute_spans();

        let (pos, cols, h) = subtree_layout(&mut root_files_block);
        blocks.push(Block {
            name: "(root)".to_string(),
            width_cols: cols,
            height_px: h,
            positions: pos,
        });
    }

    for (name, child) in root.children.iter_mut() {
        // layout child subtree
        let (pos, cols, h) = subtree_layout(child);
        blocks.push(Block {
            name: name.clone(),
            width_cols: cols,
            height_px: h,
            positions: pos,
        });
    }

    if blocks.is_empty() {
        return;
    }

    // Pick a target wrap width in columns (square-ish)
    let total_cols: usize = blocks
        .iter()
        .map(|b| b.width_cols + GAP_COLS_BETWEEN_BLOCKS)
        .sum();

    let max_block = blocks.iter().map(|b| b.width_cols).max().unwrap_or(1);

    let mut target_cols = ((total_cols as f64).sqrt() * WRAP_FACTOR).ceil() as usize;
    target_cols = target_cols.max(max_block).max(8);

    // Shelf pack blocks into rows
    // We'll record per-row blocks then center each row.
    #[derive(Clone)]
    struct Placed {
        idx: usize,
        x_cols: usize,
        y_px: f32,
    }

    let mut rows: Vec<Vec<Placed>> = Vec::new();
    let mut cur_row: Vec<Placed> = Vec::new();

    let mut cursor_cols = 0usize;
    let mut row_height_px = 0.0f32;
    let mut y_cursor_px = 0.0f32;

    for (i, b) in blocks.iter().enumerate() {
        let need = b.width_cols + if cursor_cols == 0 { 0 } else { GAP_COLS_BETWEEN_BLOCKS };

        if cursor_cols > 0 && cursor_cols + need > target_cols {
            // finish row
            rows.push(cur_row.clone());
            cur_row.clear();

            y_cursor_px += row_height_px + ROW_GAP_PX;
            cursor_cols = 0;
            row_height_px = 0.0;
        }

        let x_cols = if cursor_cols == 0 { 0 } else { cursor_cols + GAP_COLS_BETWEEN_BLOCKS };
        cur_row.push(Placed { idx: i, x_cols, y_px: y_cursor_px });

        cursor_cols = x_cols + b.width_cols;
        row_height_px = row_height_px.max(b.height_px);
    }

    if !cur_row.is_empty() {
        rows.push(cur_row);
    }

    // Center each row within target_cols for nicer aesthetics
    for row in rows.iter_mut() {
        let mut used_cols = 0usize;
        for p in row.iter() {
            let b = &blocks[p.idx];
            used_cols = used_cols.max(p.x_cols + b.width_cols);
        }
        let slack = target_cols.saturating_sub(used_cols);
        let shift = slack / 2;
        for p in row.iter_mut() {
            p.x_cols += shift;
        }
    }

    // Merge into global position map
    let mut global_pos: HashMap<String, (f32, f32)> = HashMap::new();
    for row in rows {
        for p in row {
            let b = &blocks[p.idx];
            let x_off = p.x_cols as f32 * X_SPACING;
            let y_off = p.y_px;

            for (id, (x, y)) in b.positions.iter() {
                global_pos.insert(id.clone(), (x + x_off, y + y_off));
            }
        }
    }

    // Apply to nodes
    for n in nodes.iter_mut() {
        let id = norm_slashes(&n.id);
        if let Some((x, y)) = global_pos.get(&id) {
            n.position.x = *x;
            n.position.y = *y;
        }
    }
}

// ------------------------------
// Commands
// ------------------------------

#[tauri::command]
fn generate_combined_prompt(
    project_root: String,
    groups: Vec<GroupRequest>,
    options: PromptOptions,
) -> Result<String, String> {
    let root_path = PathBuf::from(&project_root);
    let mut master_visited: HashSet<PathBuf> = HashSet::new();

    for group in groups {
        let mut crawler = Crawler::new(root_path.clone());
        crawler.set_flattening(group.flatten);
        crawler.set_depth(group.depth);

        let entry_path = PathBuf::from(&group.entry_point);
        if crawler.crawl(vec![entry_path]).is_ok() {
            master_visited.extend(crawler.visited);
        }
    }

    let mode_norm = options.skeleton_mode.trim().to_ascii_lowercase();
    let skeleton_config = match mode_norm.as_str() {
        "all" => Some(SkeletonTarget::All),
        "keeponly" => Some(SkeletonTarget::KeepOnly(options.skeleton_targets)),
        "striponly" => Some(SkeletonTarget::StripOnly(options.skeleton_targets)),
        _ => None,
    };

    let config = prompt::PromptConfig {
        files: master_visited,
        project_root: root_path,
        redactions: options.redactions,
        show_line_numbers: options.show_line_numbers,
        remove_comments: options.remove_comments,
        skeleton_config,
    };

    prompt::build_context(config)
        .map_err(|e| format!("Prompt build failed: {}", e))
}

#[tauri::command]
fn scan_workspace_group(
    _group_id: String, // legacy; frontend groups by folder now
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

    let core_map = graph::generate_map(
        &root_path,
        &crawler.visited,
        &crawler.links,
        &crawler.symbol_map,
    );

    // nodes: no parentId; frontend handles grouping
    let mut ui_nodes: Vec<AxonNode> = core_map
        .nodes
        .iter()
        .map(|node| {
            let id = norm_slashes(&node.id);
            AxonNode {
                id: id.clone(),
                r#type: "fileNode".to_string(),
                parent_id: None,
                position: Position { x: 0.0, y: 0.0 },
                data: NodeData {
                    label: Path::new(&id)
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .into(),
                    definitions: node.definitions.clone(),
                    calls: node.calls.clone(),
                    path: id,
                },
            }
        })
        .collect();

    // edges: ONE per import
    // BiColor edge renderer will show bottom->top colors
    let mut ui_edges: Vec<AxonEdge> = Vec::new();
    for link in core_map.links.iter() {
        let src = norm_slashes(&link.source);
        let tgt = norm_slashes(&link.target);

        ui_edges.push(AxonEdge {
            id: format!("{}->{}", src, tgt),
            source: src,
            target: tgt,
            edge_type: Some("axonBiColor".to_string()),
            source_handle: Some("out".to_string()),
            target_handle: Some("in".to_string()),
        });
    }

    compute_folder_grid_layout_wrapped(&mut ui_nodes);

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
