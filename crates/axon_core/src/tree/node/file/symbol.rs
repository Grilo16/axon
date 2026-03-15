use serde::{Deserialize, Serialize};
use ts_rs::TS;
use compact_str::CompactString;
use rkyv::{Archive, Deserialize as RkyvDeserialize, Serialize as RkyvSerialize};
use crate::{
    error::{AxonError, AxonResult}, 
    ids::SymbolId
};

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS, Archive, RkyvSerialize, RkyvDeserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize, TS, Archive, RkyvSerialize, RkyvDeserialize)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Symbol {
    pub id: SymbolId,
    pub kind: SymbolKind,
    #[ts(type = "string")]
    pub name: CompactString,
    pub range: TextRange,
    pub selection_range: TextRange,
    pub body_range: Option<TextRange>,
    #[ts(type = "string")]
    pub docstring: Option<CompactString>,
    pub children: Vec<SymbolId>,
    pub parent: Option<SymbolId>,
    #[ts(type = "string")]
    pub signature: Option<CompactString>,
}

impl Symbol {
    pub fn new(
        id: SymbolId,
        kind: SymbolKind,
        name: CompactString,
        range: TextRange,
        selection_range: TextRange,
    ) -> AxonResult<Self> {
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
    
    pub fn with_doc(mut self, doc: Option<CompactString>) -> Self {
        self.docstring = doc;
        self
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS, Archive, RkyvSerialize, RkyvDeserialize)]
#[ts(export_to = "symbols.ts")]
pub struct ByteOffset(pub u32);

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS, Archive, RkyvSerialize, RkyvDeserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize, TS, Archive, RkyvSerialize, RkyvDeserialize)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct UnresolvedReference {
    #[ts(type = "string")]
    pub raw_path: CompactString,
    #[ts(type = "string[]")]
    pub symbols: Vec<CompactString>,
    pub is_type_only: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, Archive, RkyvSerialize, RkyvDeserialize)]
#[ts(export_to = "symbols.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Export {
    #[ts(type = "string")]
    pub name: CompactString,
    pub is_reexport: bool,
    #[ts(type = "string")]
    pub source: Option<CompactString>, 
}