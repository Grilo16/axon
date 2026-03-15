use rkyv::{Archive, Deserialize as RkyvDeserialize, Serialize as RkyvSerialize};
use serde::{Deserialize, Serialize};
use std::marker::PhantomData;
use ts_rs::TS;

// ==========================================
// 1. DOMAIN MARKERS (ZERO-SIZED TYPES)
// ==========================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Archive, RkyvSerialize, RkyvDeserialize, TS)]
#[ts(export_to = "ids.ts")]
pub struct FileMarker;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Archive, RkyvSerialize, RkyvDeserialize, TS)]
#[ts(export_to = "ids.ts")]
pub struct DirectoryMarker;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Archive, RkyvSerialize, RkyvDeserialize, TS)]
#[ts(export_to = "ids.ts")]
pub struct SymbolMarker;

// ==========================================
// 2. THE UNIVERSAL TYPE-SAFE ID
// ==========================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Archive, RkyvSerialize, RkyvDeserialize, TS)]
#[ts(type = "number", export_to = "ids.ts")] 
#[serde(transparent)] // 🛡️ Mathematically aligns JSON serialization with the raw inner type
pub struct Id<M: TS, T: TS = u32> {
    raw: T,
    #[serde(skip)]
    #[ts(skip)]
    _marker: PhantomData<M>,
}

impl<M: TS, T: TS> Id<M, T> {
    pub const fn new(raw: T) -> Self {
        Self {
            raw,
            _marker: PhantomData,
        }
    }

    pub fn inner(&self) -> &T {
        &self.raw
    }
}

impl<M: TS, T: Copy + TS> Id<M, T> {
    pub fn as_raw(&self) -> T {
        self.raw
    }
    
    pub fn as_usize(&self) -> usize 
    where 
        T: Into<u64>
    {
        let val: u64 = self.raw.into();
        val as usize
    }
}

// Ergonomic From conversions
impl<M: TS> From<u32> for Id<M, u32> {
    fn from(raw: u32) -> Self {
        Self::new(raw)
    }
}

impl<M: TS, T: std::fmt::Display + TS> std::fmt::Display for Id<M, T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.raw)
    }
}

// ==========================================
// 3. CORE DOMAIN ALIASES
// ==========================================

pub type FileId = Id<FileMarker, u32>;
pub type DirectoryId = Id<DirectoryMarker, u32>;
pub type SymbolId = Id<SymbolMarker, u32>;

// ==========================================
// 4. BACKWARD COMPATIBILITY CONSTRUCTORS
// ==========================================

#[allow(non_snake_case)]
#[inline(always)]
pub const fn FileId(raw: u32) -> FileId { Id::new(raw) }

#[allow(non_snake_case)]
#[inline(always)]
pub const fn DirectoryId(raw: u32) -> DirectoryId { Id::new(raw) }

#[allow(non_snake_case)]
#[inline(always)]
pub const fn SymbolId(raw: u32) -> SymbolId { Id::new(raw) }