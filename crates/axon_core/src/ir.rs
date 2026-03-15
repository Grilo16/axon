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

impl FileChunk {
    /// 🛡️ The Weigher Function
    /// Estimates the RAM footprint of this chunk for moka's eviction decisions.
    /// Uses `len()` (not `capacity()`) to avoid over-reporting and cache thrashing.
    pub fn byte_size(&self) -> u32 {
        let base = std::mem::size_of_val(self);
        let content_size = self.content.len();
        let symbols_size = self.symbols.len() * std::mem::size_of::<Symbol>();
        let imports_size = self.imports.len() * std::mem::size_of::<UnresolvedReference>();
        let exports_size = self.exports.len() * std::mem::size_of::<Export>();

        (base + content_size + symbols_size + imports_size + exports_size) as u32
    }
}