use std::collections::HashMap;
use std::fs;
use std::path::Path;

use log::{info, warn};
use serde::Deserialize;
use serde_json_lenient;
use oxc_resolver::{AliasValue, ResolveOptions, Resolver};

use crate::error::{AxonError, Result};
use crate::paths;

#[derive(Deserialize)]
struct TsConfig {
    #[serde(rename = "compilerOptions")]
    compiler_options: Option<CompilerOptions>,
}

#[derive(Deserialize)]
struct CompilerOptions {
    #[serde(default)]
    paths: HashMap<String, Vec<String>>,
    #[serde(default)]
    base_url: Option<String>,
}

pub fn build_resolver(project_root: &Path) -> Resolver {
    let extensions = vec![
        ".js".into(), ".jsx".into(), ".ts".into(), ".tsx".into(), ".d.ts".into(), ".css".into()
    ];

    let (alias_fields, main_files) = match load_tsconfig_aliases(project_root) {
        Ok(aliases) => (aliases, vec!["index".into()]),
        Err(_) => (Vec::new(), vec!["index".into()]), // Fallback if no config found
    };

    let options = ResolveOptions {
        extensions,
        alias: alias_fields,
        main_files,
        prefer_relative: true, 
        ..ResolveOptions::default()
    };

    Resolver::new(options)
}

fn load_tsconfig_aliases(root: &Path) -> Result<Vec<(String, Vec<AliasValue>)>> {
    let config_names = vec!["tsconfig.app.json", "tsconfig.json"];
    
    for name in config_names {
        let path = root.join(name);
        if path.exists() {
            info!("📜 Parsing config: {:?}", name);
            
            match parse_config_file(&path, root) {
                Ok(aliases) => {
                    info!("✅ Loaded {} aliases from {:?}", aliases.len(), name);
                    return Ok(aliases);
                }
                Err(e) => {
                    warn!("⚠️ Config warning for {:?}: {}", name, e);
                }
            }
        }
    }
    
    Ok(Vec::new())
}

fn parse_config_file(path: &Path, project_root: &Path) -> Result<Vec<(String, Vec<AliasValue>)>> {
    let content = fs::read_to_string(path)
        .map_err(|e| AxonError::ReadFile { path: path.to_path_buf(), source: e })?;

    let config = serde_json_lenient::from_str::<TsConfig>(&content)
        .map_err(|e| AxonError::Analysis(format!("Config JSON error: {}", e)))?;

    if let Some(opts) = config.compiler_options {
        return Ok(process_compiler_options(opts, project_root));
    }

    Ok(Vec::new())
}

fn process_compiler_options(opts: CompilerOptions, root: &Path) -> Vec<(String, Vec<AliasValue>)> {
    let base_dir = if let Some(base) = opts.base_url {
        let clean_base = base.trim_start_matches("./").trim_start_matches("/");
        let dir = root.join(clean_base);
        info!("📍 Base URL: {:?}", dir);
        dir
    } else {
        root.to_path_buf()
    };

    let mut alias_fields = Vec::new();

    for (key, paths) in opts.paths {
        let clean_key = key.trim_end_matches("/*").to_string();
        
        let clean_values: Vec<AliasValue> = paths.iter().map(|p| {
            let clean_path = p.trim_end_matches("/*");
            let abs_path = base_dir.join(clean_path);
            
            let clean_str = paths::clean_path_str(&abs_path);
            
            AliasValue::Path(clean_str)
        }).collect();

        alias_fields.push((clean_key, clean_values));
    }

    alias_fields
}