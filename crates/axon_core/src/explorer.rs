use tracing::instrument;
use crate::error::{AxonError, AxonResult};
use crate::tree::state::RegistryAccess;
use crate::tree::{state::Analyzed, AxonTree};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export_to = "explorer.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ExplorerFile {
    pub name: String,
    pub path: String, 
    pub size: u64,
    pub extension: String,
}

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export_to = "explorer.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ExplorerFolder {
    pub name: String,
    pub path: String, 
    pub has_children: bool,
}

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[serde(tag = "type", content = "data")]
#[ts(export_to = "explorer.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum ExplorerEntry {
    File(ExplorerFile),
    Folder(ExplorerFolder),
}

impl ExplorerEntry {
    pub fn get_name(&self) -> &str {
        match self {
            ExplorerEntry::File(f) => &f.name,
            ExplorerEntry::Folder(f) => &f.name,
        }
    }
}

pub struct TreeExplorer;

impl TreeExplorer {
    /// Reads directory structure from RAM, but fetches file size natively from the OS metadata cache.
    #[instrument(skip(tree), err)]
    pub fn list_directory(tree: &AxonTree<Analyzed>, target_path: &str) -> AxonResult<Vec<ExplorerEntry>> {
        
        let dir_id = tree
            .dir_id_by_path(target_path)
            .ok_or_else(|| AxonError::NotFound {
                entity: "Directory",
                id: target_path.to_string(),
            })?;

        let dir = tree.directory(dir_id)
            .ok_or_else(|| AxonError::NotFound {
                entity: "Directory",
                id: target_path.to_string(),
            })?;

        let mut entries = Vec::new();

        for &child_dir_id in dir.child_dirs() {
            if let Some(child_dir) = tree.directory(child_dir_id) {
                entries.push(ExplorerEntry::Folder(ExplorerFolder {
                    name: child_dir.name().to_string(),
                    path: child_dir.path().to_string(),
                    has_children: !child_dir.is_empty(),
                }));
            }
        }

        for &child_file_id in dir.child_files() {
            if let Some(child_file) = tree.file(child_file_id) {
                let file_path = child_file.path();
                let extension = file_path
                    .segments()
                    .last()
                    .and_then(|s| s.split('.').last())
                    .unwrap_or("")
                    .to_string();

                let abs_path = if child_file.path().is_base() {
                    tree.core.root.clone()
                } else {
                    tree.core.root.join(child_file.path().as_str())
                };

                // Fetch size cleanly from the OS without loading the file into RAM
                let size = std::fs::metadata(&abs_path)
                    .map(|m| m.len())
                    .unwrap_or(0);

                entries.push(ExplorerEntry::File(ExplorerFile {
                    name: child_file.name().to_string(),
                    path: file_path.to_string(),
                    size, 
                    extension,
                }));
            }
        }

        entries.sort_by(|a, b| match (a, b) {
            (ExplorerEntry::Folder(_), ExplorerEntry::File(_)) => std::cmp::Ordering::Less,
            (ExplorerEntry::File(_), ExplorerEntry::Folder(_)) => std::cmp::Ordering::Greater,
            _ => a.get_name().to_lowercase().cmp(&b.get_name().to_lowercase()),
        });

        Ok(entries)
    }
}