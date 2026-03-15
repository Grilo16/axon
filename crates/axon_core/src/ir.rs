use rkyv::{Archive, Deserialize as RkyvDeserialize, Serialize as RkyvSerialize};
use serde::{Deserialize, Serialize};
use crate::ids::FileId;
use crate::tree::node::file::symbol::{Export, Symbol, UnresolvedReference};

// ==========================================
// THE DISK-BOUND CHUNK
// ==========================================

/// This is the exact struct that gets byte-aligned and dumped into `redb`.
#[derive(Debug, Clone, Archive, RkyvSerialize, RkyvDeserialize, Serialize, Deserialize)]
pub struct FileChunk {
    pub file_id: FileId,
    pub content: String,
    pub symbols: Vec<Symbol>,
    pub imports: Vec<UnresolvedReference>,
    pub exports: Vec<Export>,
}