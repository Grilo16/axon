use crate::{ids::{SymbolId}, tree::node::file::symbol::SymbolKind, };
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundler.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum RedactionType {
    RemoveEntirely,
    HideImplementation,
    ReplaceWith(String),
}

/// Defines *what* should be modified
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundler.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum TargetScope {
    /// Target a specific symbol using both its File address and Symbol index
    SpecificSymbol { 
        file_path: String, 
        symbol_id: SymbolId 
    },
    EntireFile(String),
    Global(SymbolKind),
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundler.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct RedactionRule {
    pub target: TargetScope,
    pub action: RedactionType,
}
#[derive(Debug, Clone, Serialize, Deserialize, Default, TS)]
#[ts(export_to = "bundler.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct BundleOptions {
    pub rules: Vec<RedactionRule>,
    pub target_files: Vec<String>,
}