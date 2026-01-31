use std::collections::HashSet;
use std::path::PathBuf;
pub mod graph;

// ==========================================
// 1. ANALYSIS DATA (Internal use)
// Passed from Analysis -> Engine
// ==========================================

/// Represents what we found inside a single file
#[derive(Debug, Clone)]
pub struct FileSymbols {
    pub path: PathBuf,
    pub definitions: HashSet<String>, // What this file defines
    pub calls: Vec<String>,           // What this file uses
}

/// Represents a specific import statement we found
/// e.g. `import { useState } from 'react'`
#[derive(Debug, Clone)]
pub struct ImportRequest {
    pub source: String,       // "react"
    pub specifiers: Vec<String>, // ["useState"]
}

pub use graph::{AxonLink, AxonMap, AxonNode};