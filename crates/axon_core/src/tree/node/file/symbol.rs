use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::{
    error::{AxonError, AxonResult}, 
    ids::SymbolId
};

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum SymbolKind {
    File,
    Module,
    Namespace,
    Class,
    Interface,
    Enum,
    Function,
    Method,
    Variable,
    Const,
    TypeAlias, 
    Property, 
    Parameter, 
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Symbol {
    pub id: SymbolId,
    pub kind: SymbolKind,
    pub name: String,

    /// Full extent (docstring to end of block)
    pub range: TextRange,

    /// Specifically where the name is defined (for clicking in UI)
    pub selection_range: TextRange,

    /// Implementation body { ... }
    pub body_range: Option<TextRange>,

    /// Extracted documentation
    pub docstring: Option<String>,

    /// Nested symbols (e.g. methods in a class)
    pub children: Vec<SymbolId>,
    pub parent: Option<SymbolId>,

    /// Pre-rendered signature for quick UI display
    pub signature: Option<String>,
}

impl Symbol {
    pub fn new(
        id: SymbolId,
        kind: SymbolKind,
        name: String,
        range: TextRange,
        selection_range: TextRange,
    ) -> AxonResult<Self> {
        // Integrity check: selection must be within the full range
        if selection_range.start.0 < range.start.0 || selection_range.end.0 > range.end.0 {
            return Err(AxonError::InvalidRange {
                start: selection_range.start.0,
                end: selection_range.end.0,
            });
        }

        Ok(Self {
            id,
            kind,
            name,
            range,
            selection_range,
            body_range: None,
            docstring: None,
            children: Vec::new(),
            parent: None,
            signature: None,
        })
    }

    /// Builder pattern for body_range
    pub fn with_body(mut self, body: TextRange) -> AxonResult<Self> {
        if body.start.0 < self.range.start.0 || body.end.0 > self.range.end.0 {
             return Err(AxonError::InvalidRange {
                start: body.start.0,
                end: body.end.0,
            });
        }
        self.body_range = Some(body);
        Ok(self)
    }
    
    /// Builder pattern for docstring
    pub fn with_doc(mut self, doc: Option<String>) -> Self {
        self.docstring = doc;
        self
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export_to = "symbols.ts")]
pub struct ByteOffset(pub u32);

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct TextRange {
    pub start: ByteOffset,
    pub end: ByteOffset,
}

impl TextRange {
    pub fn new(start: u32, end: u32) -> AxonResult<Self> {
        if end < start {
            return Err(AxonError::InvalidRange { start, end });
        }
        Ok(Self {
            start: ByteOffset(start),
            end: ByteOffset(end),
        })
    }

    pub fn as_range(&self) -> std::ops::Range<usize> {
        (self.start.0 as usize)..(self.end.0 as usize)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct UnresolvedReference {
    pub raw_path: String,
    pub symbols: Vec<String>,
    pub is_type_only: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Export {
    pub name: String,
    pub is_reexport: bool,
    pub source: Option<String>, 
}