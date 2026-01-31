use std::collections::{HashMap, HashSet, VecDeque};
use std::fs;
use std::path::{Path, PathBuf};

use oxc_resolver::Resolver;
use log::{debug, warn, info};

use crate::core::{FileSymbols, graph};
use crate::analysis::javascript;
use crate::error::{AxonError, Result};
use crate::engine::loader; 

pub struct Crawler {
    pub project_root: PathBuf,
    pub visited: HashSet<PathBuf>,
    pub symbol_map: HashMap<PathBuf, FileSymbols>,
    pub links: Vec<(PathBuf, PathBuf)>, 
    pub resolver: Resolver,
    queue: VecDeque<(PathBuf, u32)>, 
    should_flatten: bool,
    max_depth: u32,
}

impl Crawler {
    pub fn new(mut project_root: PathBuf) -> Self {
        if let Ok(canon) = project_root.canonicalize() {
            project_root = canon;
        }

        let resolver = loader::build_resolver(&project_root);

        Self {
            project_root,
            visited: HashSet::new(),
            symbol_map: HashMap::new(),
            links: Vec::new(),
            resolver,
            queue: VecDeque::new(),
            should_flatten: false,
            max_depth: u32::MAX, 
        }
    }

    pub fn set_flattening(&mut self, value: bool) {
        self.should_flatten = value;
    }

    pub fn set_depth(&mut self, depth: u32) {
        self.max_depth = depth;
    }

    pub fn crawl(&mut self, entry_points: Vec<PathBuf>) -> Result<()> {
        for point in entry_points {
            if let Ok(abs) = self.normalize_path(point) {
                if !self.visited.contains(&abs) {
                    self.queue.push_back((abs, 0));
                }
            }
        }

        info!("🕷️ Starting crawl with {} seed files...", self.queue.len());

        // 🆕 Loop extracts (path, depth)
        while let Some((current_path, current_depth)) = self.queue.pop_front() {
            if self.visited.contains(&current_path) { continue; }
            if current_path.to_string_lossy().contains("node_modules") { continue; }

            self.visited.insert(current_path.clone());
            debug!("🔍 Visiting [D{}]: {:?}", current_depth, current_path.file_name().unwrap_or_default());

            // Check if we reached the limit
            if current_depth >= self.max_depth {
                continue; 
            }

            match self.process_file(&current_path) {
                Ok(new_targets) => {
                    for target in new_targets {
                        if !self.visited.contains(&target) {
                            self.queue.push_back((target, current_depth + 1));
                        }
                    }
                }
                Err(e) => {
                    warn!("Failed to process {:?}: {}", current_path, e);
                }
            }
        }
        Ok(())
    }

    
    fn process_file(&mut self, path: &PathBuf) -> Result<Vec<PathBuf>> {
        let source_text = fs::read_to_string(path)
            .map_err(|e| AxonError::ReadFile { path: path.clone(), source: e })?;

        let (import_requests, _, _, symbols) = javascript::analyze_source(&source_text, path);
        self.symbol_map.insert(path.clone(), symbols);

        let parent_dir = path.parent().ok_or_else(|| AxonError::NoParentDir(path.clone()))?;
        let mut new_targets = Vec::new();

        for req in import_requests {
            if req.specifiers.is_empty() || !self.should_flatten {
                if let Some(target) = self.resolve_import(parent_dir, &req.source) {
                    if !self.links.contains(&(path.clone(), target.clone())) {
                        self.links.push((path.clone(), target.clone()));
                        new_targets.push(target);
                    }
                }
                continue;
            }

            for specifier in &req.specifiers {
                 if let Some(target) = self.resolve_specific_import(parent_dir, &req.source, specifier) {
                    if !self.links.contains(&(path.clone(), target.clone())) {
                        self.links.push((path.clone(), target.clone()));
                        new_targets.push(target);
                    }
                 }
            }
        }
        Ok(new_targets)
    }

    fn resolve_specific_import(&self, base_dir: &Path, source: &str, specifier: &str) -> Option<PathBuf> {
        let initial_target = self.resolve_import(base_dir, source)?;
        if !self.should_flatten { return Some(initial_target); }
        Some(self.resolve_real_target(&initial_target, specifier).unwrap_or(initial_target))
    }

    fn resolve_import(&self, base_dir: &Path, specifier: &str) -> Option<PathBuf> {
        match self.resolver.resolve(base_dir, specifier) {
            Ok(res) => {
                let path = res.full_path();
                if path.to_string_lossy().contains("node_modules") { return None; }
                Some(path)
            }
            Err(_) => None,
        }
    }

    fn resolve_real_target(&self, target_path: &Path, specifier: &str) -> Option<PathBuf> {
        let is_index: bool = target_path.file_name()
            .map_or(false, |n| n.to_string_lossy().contains("index"));
        if !is_index { return None; }
        self.recursive_star_search(target_path, specifier, 0)
    }

    fn recursive_star_search(&self, current_path: &Path, specifier: &str, depth: i32) -> Option<PathBuf> {
        if depth > 15 { return None; }
        let barrel_text = fs::read_to_string(current_path).ok()?;
        let (_, named_exports, star_exports, symbols) = javascript::analyze_source(&barrel_text, &current_path.to_path_buf());

        if let Some(source_import) = named_exports.get(specifier) {
            let parent = current_path.parent()?;
            return self.resolve_import(parent, source_import);
        }

        if symbols.definitions.contains(specifier) {
             return Some(current_path.to_path_buf());
        }

        for star_source in star_exports {
            let parent = current_path.parent()?;
            if let Some(next_path) = self.resolve_import(parent, &star_source) {
                if let Some(found) = self.recursive_star_search(&next_path, specifier, depth + 1) {
                    debug!("   ✨ Found '{}' in wildcard via {:?}", specifier, next_path.file_name().unwrap());
                    return Some(found);
                }
            }
        }
        None
    }

    fn normalize_path(&self, path: PathBuf) -> Result<PathBuf> {
        let abs = if path.is_absolute() { path } else { self.project_root.join(path) };
        abs.canonicalize().map_err(|e| AxonError::InvalidPath { path: abs, source: e })
    }

    pub fn export_json(&self, output_file: &str) -> Result<()> {
        graph::save_map(output_file, &self.project_root, &self.visited, &self.links, &self.symbol_map)?;
        info!("💾 Graph saved to {} ({} files)", output_file, self.visited.len());
        Ok(())
    }
}