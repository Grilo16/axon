use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

use crate::paths;
use crate::error::{AxonError, Result};
use crate::core::FileSymbols; 
// 1. Ensure AxonLink and AxonNode derive Serialize and Deserialize
#[derive(Serialize, Deserialize, Clone)]
pub struct AxonLink {
    pub source: String,
    pub target: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AxonNode {
    pub id: String,
    pub definitions: Vec<String>,
    pub calls: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AxonMap {
    pub nodes: Vec<AxonNode>,
    pub links: Vec<AxonLink>,
}

// 2. New function that just returns the data
pub fn generate_map(
    project_root: &Path,
    visited: &HashSet<PathBuf>,
    raw_links: &[(PathBuf, PathBuf)],
    symbol_map: &HashMap<PathBuf, FileSymbols>
) -> AxonMap {
    let mut nodes = Vec::new();
    for path in visited {
        let relative_id = paths::make_relative(project_root, path);
        
        let mut defs = vec![];
        let mut calls = vec![];

        if let Some(symbols) = symbol_map.get(path) {
            defs = symbols.definitions.iter().cloned().collect();
            defs.sort();
            calls = symbols.calls.clone();
        }

        nodes.push(AxonNode {
            id: relative_id,
            definitions: defs,
            calls,
        });
    }

    nodes.sort_by(|a, b| a.id.cmp(&b.id));

    let links: Vec<AxonLink> = raw_links.iter().map(|(source, target)| {
        AxonLink {
            source: paths::make_relative(project_root, source),
            target: paths::make_relative(project_root, target),
        }
    }).collect();

    AxonMap { nodes, links }
}

// 3. save_map now just uses generate_map
pub fn save_map(
    output_file: &str,
    project_root: &Path,
    visited: &HashSet<PathBuf>,
    raw_links: &[(PathBuf, PathBuf)],
    symbol_map: &HashMap<PathBuf, FileSymbols>
) -> Result<()> {
    let map = generate_map(project_root, visited, raw_links, symbol_map);
    let json = serde_json::to_string_pretty(&map)
        .map_err(|e| AxonError::Analysis(format!("Serialization failed: {}", e)))?;
    
    fs::write(output_file, json)
        .map_err(|e| AxonError::ReadFile { path: PathBuf::from(output_file), source: e })?;

    Ok(())
}