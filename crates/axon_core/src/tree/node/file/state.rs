use std::sync::Arc;
pub mod found;
pub mod outlined;
pub mod read;

use crate::tree::node::file::symbol::{Export, Symbol, UnresolvedReference};

#[derive(Debug, Clone)]
pub struct Found;

#[derive(Debug, Clone)]
pub struct Read {
    pub content: Arc<str>,
}

#[derive(Debug, Clone)]
pub struct Outlined {
    pub content: Arc<str>,
    pub symbols: Vec<Symbol>,
    pub imports: Vec<UnresolvedReference>, 
    pub exports: Vec<Export>,             
}

#[derive(Debug, Clone)]
pub struct Processed {
    pub final_output: String,
}
