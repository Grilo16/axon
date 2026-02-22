use crate::{error::AxonResult, tree::node::file::symbol::{Export, Symbol, UnresolvedReference}};
use oxc_span::SourceType;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
pub mod javascript; 

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "parser.ts")]
pub struct ParseOutput {
    pub symbols: Vec<Symbol>,
    pub imports: Vec<UnresolvedReference>,
    pub exports: Vec<Export>,
}

pub trait AxonParser {
    fn parse(&self, source: &str, source_type: SourceType) -> AxonResult<ParseOutput>;
}