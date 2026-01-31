use std::path::Path;
use serde::{Deserialize, Serialize};
use std::fs;


/// Cleans a path string for consistency across OSs.
/// 1. Removes UNC prefixes ("\\?\") on Windows.
/// 2. Converts backslashes to forward slashes.
pub fn clean_path_str(path: &Path) -> String {
    let raw = path.to_string_lossy().to_string();
    
    // Strip UNC prefix if present
    let no_unc = if raw.starts_with("\\\\?\\") {
        &raw[4..]
    } else {
        &raw
    };
    // Normalize slashes
    no_unc.replace("\\", "/")
}

/// Calculates the relative path from root to target.
/// Returns a clean, forward-slash string.
pub fn make_relative(root: &Path, target: &Path) -> String {
    let clean_root = clean_path_str(root);
    let clean_target = clean_path_str(target);

    if let Some(stripped) = clean_target.strip_prefix(&clean_root) {
        return stripped.trim_start_matches('/').to_string();
    }
    clean_target
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

pub fn get_directory_items(dir_path: &Path) -> std::io::Result<Vec<FileEntry>> {
    let mut items = Vec::new();
    if let Ok(entries) = fs::read_dir(dir_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            let name = path.file_name()
                .map(|s| s.to_string_lossy().into_owned())
                .unwrap_or_default();
            
            // Skip hidden folders like .git or node_modules for speed
            if name.starts_with('.') || name == "node_modules" { continue; }

            items.push(FileEntry {
                name,
                path: path.to_string_lossy().into_owned(),
                is_dir: path.is_dir(),
                children: None, // We load children lazily on click for performance
            });
        }
    }
    // Sort: Directories first, then files alphabetically
    items.sort_by(|a, b| b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name)));
    Ok(items)
}