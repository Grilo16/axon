use std::sync::Arc;
pub mod found;
pub mod outlined;
pub mod read;

use serde::{Deserialize, Serialize};

use crate::tree::node::file::symbol::{Export, Symbol, UnresolvedReference};

#[derive(Debug, Clone)]
pub struct Found;

#[derive(Debug, Clone)]
pub struct Read {
    pub content: Arc<str>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Outlined {
    #[serde(skip)]
    pub content: Arc<str>,
    #[serde(skip)]
    pub symbols: Vec<Symbol>,
    #[serde(skip)]
    pub imports: Vec<UnresolvedReference>,
    #[serde(skip)]
    pub exports: Vec<Export>,    
}

#[derive(Debug, Clone)]
pub struct Processed {
    pub final_output: String,
}
