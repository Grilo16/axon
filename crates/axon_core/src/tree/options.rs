// --- FILE: tree/options.rs ---
use serde::Deserialize;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use crate::error::AxonResult;
use crate::path::RelativeAxonPath;

// --- 1. The Core Data Structures ---

#[derive(Debug, Clone, Default)]
pub struct TsConfigData {
    pub base_url: Option<RelativeAxonPath>,
    /// Maps aliases like "@app/*" to their relative paths like ["src/app/*"]
    pub paths: HashMap<String, Vec<RelativeAxonPath>>,
}

#[derive(Debug, Clone)]
pub struct AxonScanOptions {
    pub allowed_extensions: HashSet<String>,
    pub tsconfig_files: Vec<PathBuf>,
    pub compiler_options: TsConfigData,
}

impl Default for AxonScanOptions {
    fn default() -> Self {
        Self {
            allowed_extensions: ["js", "jsx", "ts", "tsx", "mjs", "cjs"]
                .into_iter()
                .map(str::to_string)
                .collect(),
            tsconfig_files: Vec::new(),
            compiler_options: TsConfigData::default(),
        }
    }
}

// --- 2. Private Serde Structs for Raw JSON Parsing ---

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RawTsConfig {
    compiler_options: Option<RawCompilerOptions>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RawCompilerOptions {
    base_url: Option<String>,
    paths: Option<HashMap<String, Vec<String>>>,
}

// --- 3. Parsing Logic ---

impl TsConfigData {
    /// Reads and parses a tsconfig.json file, safely handling JSONC comments.
    pub fn parse_from_file(path: &Path) -> AxonResult<Self> {
        // Read file (returns AxonError::Io if it fails)
        let raw_content = std::fs::read_to_string(path).map_err(|e| crate::error::AxonError::io(e, path))?;
        
        // Strip comments before handing to Serde
        let clean_content = strip_jsonc(&raw_content);
        
        // Parse JSON (returns AxonError::Json if it fails)
        let parsed: RawTsConfig = serde_json::from_str(&clean_content)?;

        let mut data = Self::default();

        if let Some(options) = parsed.compiler_options {
            if let Some(base) = options.base_url {
                data.base_url = Some(RelativeAxonPath::from(base.as_str()));
            }

            if let Some(paths) = options.paths {
                for (alias, mappings) in paths {
                    let rel_mappings = mappings
                        .into_iter()
                        .map(|m| RelativeAxonPath::from(m.as_str()))
                        .collect();
                    data.paths.insert(alias, rel_mappings);
                }
            }
        }

        Ok(data)
    }
    pub fn merge(&mut self, other: Self) {
        // Only overwrite base_url if we don't already have one
        if self.base_url.is_none() {
            self.base_url = other.base_url;
        }

        // Merge all paths (overwriting existing keys if there are duplicates)
        for (alias, mappings) in other.paths {
            self.paths.insert(alias, mappings);
        }
    }
}

impl AxonScanOptions {
    /// Ergonomic builder method to attach and parse a tsconfig file immediately
    pub fn with_tsconfig(mut self, path: impl Into<PathBuf>) -> AxonResult<Self> {
        let path_buf = path.into();
        self.compiler_options = TsConfigData::parse_from_file(&path_buf)?;
        self.tsconfig_files.push(path_buf);
        Ok(self)
    }

    pub fn auto_detect(root: &Path) -> Self {
        let mut options = Self::default();
        
        // If the directory doesn't exist, just return the defaults safely
        let read_dir = match std::fs::read_dir(root) {
            Ok(dir) => dir,
            Err(_) => return options,
        };

        for entry in read_dir.flatten() {
            let path = entry.path();
            
            // Only look at files
            if !path.is_file() {
                continue;
            }

            let file_name = path.file_name().unwrap_or_default().to_string_lossy();

            // Detect any tsconfig (*.json) or standard jsconfig
            let is_config = (file_name.starts_with("tsconfig") && file_name.ends_with(".json")) 
                         || file_name == "jsconfig.json";

            if is_config {
                // If it parses successfully, merge it in! If it fails (bad JSON), 
                // we gracefully ignore it rather than crashing the whole scan.
                if let Ok(parsed_data) = TsConfigData::parse_from_file(&path) {
                    options.compiler_options.merge(parsed_data);
                    options.tsconfig_files.push(path);
                }
            }
        }

        options
    }
}

// --- 4. The JSONC Comment Stripper ---

/// Safely removes `//` and `/* */` comments from a string without breaking URLs in strings.
fn strip_jsonc(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut in_string = false;
    let mut in_line_comment = false;
    let mut in_block_comment = false;
    
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        // 1. Handle String Literals (we don't want to strip "http://example.com")
        if in_string {
            out.push(c);
            if c == '"' {
                in_string = false;
            } else if c == '\\' {
                if let Some(escaped) = chars.next() {
                    out.push(escaped);
                }
            }
            continue;
        }

        // 2. Handle Line Comments
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
                out.push(c);
            }
            continue;
        }

        // 3. Handle Block Comments
        if in_block_comment {
            if c == '*' && chars.peek() == Some(&'/') {
                chars.next(); // Consume the '/'
                in_block_comment = false;
            }
            continue;
        }

        // 4. Detect State Changes or Push Character
        match c {
            '"' => {
                in_string = true;
                out.push(c);
            }
            '/' => {
                if chars.peek() == Some(&'/') {
                    chars.next(); // Consume the second '/'
                    in_line_comment = true;
                } else if chars.peek() == Some(&'*') {
                    chars.next(); // Consume the '*'
                    in_block_comment = true;
                } else {
                    out.push(c);
                }
            }
            _ => out.push(c),
        }
    }
    out
}