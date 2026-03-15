use std::path::{Path, PathBuf};
use redb::{Database, ReadableTable, TableDefinition};
use moka::sync::Cache;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use crate::error::{AxonError, AxonResult};
use crate::ir::FileChunk;

// ==========================================
// 1. TABLE DEFINITIONS
// ==========================================

const AST_TABLE: TableDefinition<'static, (&str, &str), &[u8]> = TableDefinition::new("ast_chunks");
// 🛡️ The Skeleton Table: Stores the serialized TreeRegistry (Directory/FileID mappings)
const SKELETON_TABLE: TableDefinition<'static, &str, &[u8]> = TableDefinition::new("tree_skeletons");
// 🛡️ The Metadata Table: Stores the last accessed UNIX timestamp for LRU sweeping
const METADATA_TABLE: TableDefinition<'static, &str, u64> = TableDefinition::new("spool_metadata");

// ==========================================
// 2. ERROR HELPER & DTOs
// ==========================================

trait RedbCtx<T> {
    fn db(self, context: &str) -> AxonResult<T>;
}

impl<T, E: std::fmt::Display> RedbCtx<T> for Result<T, E> {
    fn db(self, context: &str) -> AxonResult<T> {
        self.map_err(|e| AxonError::Database(format!("{}: {}", context, e)))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SpoolStats {
    pub physical_size_bytes: u64,
    pub active_commits: usize,
    pub workspaces: Vec<WorkspaceStat>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkspaceStat {
    pub commit_hash: String,
    pub last_accessed: u64,
}

// ==========================================
// 3. THE SPOOL ENGINE
// ==========================================

#[derive(Debug, Clone)]
pub struct AxonSpool {
    db: Arc<Database>,
    db_path: PathBuf,
    l1_cache: Cache<(String, String), Arc<FileChunk>>,
}

impl AxonSpool {
    pub fn new(path: impl AsRef<Path>) -> AxonResult<Self> {
        let db_path = path.as_ref().to_path_buf();
        let db = Database::create(&db_path).db("Failed to initialize redb spool")?;

        let write_txn = db.begin_write().db("Failed to begin init transaction")?;
        {
            let _ = write_txn.open_table(AST_TABLE).db("Failed to create AST table")?;
            let _ = write_txn.open_table(SKELETON_TABLE).db("Failed to create Skeleton table")?;
            let _ = write_txn.open_table(METADATA_TABLE).db("Failed to create Metadata table")?;
        }
        write_txn.commit().db("Failed to commit init transaction")?;

        let l1_cache = Cache::builder()
            .max_capacity(1_073_741_824) 
            .weigher(|_key, chunk: &Arc<FileChunk>| -> u32 {
                chunk.byte_size()
            })
            .build();

        Ok(Self { 
            db: Arc::new(db), 
            db_path,
            l1_cache 
        })
    }

    fn now() -> u64 {
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs()
    }

    /// Updates the last-accessed timestamp for a commit.
    pub fn touch_commit(&self, commit_hash: &str) -> AxonResult<()> {
        let write_txn = self.db.begin_write().db("Failed to begin touch transaction")?;
        {
            let mut table = write_txn.open_table(METADATA_TABLE).db("Failed to open Metadata table")?;
            table.insert(commit_hash, Self::now()).db("Failed to update timestamp")?;
        }
        write_txn.commit().db("Failed to commit touch transaction")?;
        Ok(())
    }

    // ==========================================
    // SKELETON I/O (Bypasses Git Clone)
    // ==========================================

    pub fn write_skeleton(&self, commit_hash: &str, skeleton_bytes: &[u8]) -> AxonResult<()> {
        // 1. Write the new skeleton and update metadata
        let write_txn = self.db.begin_write().db("Failed to begin skeleton write txn")?;
        {
            let mut skel_table = write_txn.open_table(SKELETON_TABLE).db("Failed to open Skeleton table")?;
            skel_table.insert(commit_hash, skeleton_bytes).db("Failed to write skeleton")?;

            let mut meta_table = write_txn.open_table(METADATA_TABLE).db("Failed to open Metadata table")?;
            meta_table.insert(commit_hash, Self::now()).db("Failed to update timestamp")?;
        }
        write_txn.commit().db("Failed to commit skeleton transaction")?;

        // 2. Trigger passive LRU GC (50GB Max Size, 24 Hour TTL)
        let _ = self.enforce_lru(50 * 1024 * 1024 * 1024, 24 * 60 * 60);

        Ok(())
    }

    pub fn get_skeleton(&self, commit_hash: &str) -> AxonResult<Option<Vec<u8>>> {
        let read_txn = self.db.begin_read().db("Failed to begin skeleton read txn")?;
        let table = read_txn.open_table(SKELETON_TABLE).db("Failed to open Skeleton table")?;
        
        let guard = table.get(commit_hash).db("Failed to read skeleton key")?;
        
        if let Some(access_guard) = guard {
            let bytes = access_guard.value().to_vec();
            // We successfully hit the cache! Update its access time in the background.
            let _ = self.touch_commit(commit_hash);
            Ok(Some(bytes))
        } else {
            Ok(None)
        }
    }

    // ==========================================
    // MEAT I/O (AST Chunks)
    // ==========================================

    pub fn write_batch(&self, chunks: &[(&str, &str, &[u8])]) -> AxonResult<()> {
        let write_txn = self.db.begin_write().db("Failed to begin batch write transaction")?;
        {
            let mut table = write_txn.open_table(AST_TABLE).db("Failed to open AST table")?;
            for (commit_hash, file_path, ir_bytes) in chunks {
                table.insert(&(*commit_hash, *file_path), *ir_bytes)
                    .db("Failed to insert chunk")?;
            }
        }
        write_txn.commit().db("Failed to commit batch transaction")?;
        Ok(())
    }

    pub fn get_cached_chunk(&self, commit_hash: &str, file_path: &str) -> AxonResult<Arc<FileChunk>> {
        let key = (commit_hash.to_string(), file_path.to_string());

        let chunk = self.l1_cache.try_get_with(key, || -> Result<Arc<FileChunk>, String> {
            self.with_chunk(commit_hash, file_path, |bytes| {
                let mut aligned = rkyv::util::AlignedVec::<16>::with_capacity(bytes.len());
                aligned.extend_from_slice(bytes);
                rkyv::from_bytes::<FileChunk, rkyv::rancor::Error>(&aligned)
                    .map(Arc::new)
                    .map_err(|e| format!("Failed to deserialize chunk: {e}"))
            })
            .map_err(|e| format!("Database error: {e}"))?
            .ok_or_else(|| format!("AST chunk missing in spool for {file_path}"))?
        }).map_err(|e| AxonError::Backend(format!("Cache error: {e}")))?;

        Ok(chunk)
    }

    pub fn with_chunk<F, R>(&self, commit_hash: &str, file_path: &str, callback: F) -> AxonResult<Option<R>>
    where
        F: FnOnce(&[u8]) -> R,
    {
        let read_txn = self.db.begin_read().db("Failed to begin read transaction")?;
        let table = read_txn.open_table(AST_TABLE).db("Failed to open AST table for read")?;
        let guard = table.get(&(commit_hash, file_path)).db("Failed to read key")?;

        if let Some(access_guard) = guard {
            let bytes: &[u8] = access_guard.value();
            Ok(Some(callback(bytes)))
        } else {
            Ok(None)
        }
    }

    // ==========================================
    // GARBAGE COLLECTION & TELEMETRY
    // ==========================================

    pub fn evict_commit(&self, target_commit: &str) -> AxonResult<usize> {
        let write_txn = self.db.begin_write().db("Failed to begin eviction transaction")?;

        let mut count = 0;
        {
            let mut ast_table = write_txn.open_table(AST_TABLE).db("Failed to open AST table")?;
            let mut keys_to_delete = Vec::new();
            let start_bound: (&str, &str) = (target_commit, "");

            let range = ast_table.range(start_bound..).db("Failed to open table range")?;
            for result in range {
                let (k, _) = result.db("Range iteration error")?;
                let (commit, path) = k.value();

                if commit == target_commit {
                    keys_to_delete.push((commit.to_string(), path.to_string()));
                } else {
                    break;
                }
            }

            for (commit, path) in keys_to_delete {
                ast_table.remove(&(commit.as_str(), path.as_str())).db("Failed to remove chunk")?;
                count += 1;
            }

            let mut skel_table = write_txn.open_table(SKELETON_TABLE).db("Failed to open Skel table")?;
            let _ = skel_table.remove(target_commit);

            let mut meta_table = write_txn.open_table(METADATA_TABLE).db("Failed to open Meta table")?;
            let _ = meta_table.remove(target_commit);
        }

        write_txn.commit().db("Failed to commit eviction transaction")?;
        
        for (key, _) in &self.l1_cache {
            if key.0 == target_commit {
                self.l1_cache.invalidate(&*key);
            }
        }
        
        Ok(count)
    }

    /// Enforces the 50GB physical size limit and 24-hour TTL constraint.
    pub fn enforce_lru(&self, max_bytes: u64, max_age_secs: u64) -> AxonResult<()> {
        let physical_size = std::fs::metadata(&self.db_path)
            .map(|m| m.len())
            .unwrap_or(0);

        let read_txn = self.db.begin_read().db("Failed to open read txn for LRU")?;
        let table = read_txn.open_table(METADATA_TABLE).db("Failed to open Metadata table")?;
        
        let mut records = Vec::with_capacity(32);
        let current_time = Self::now();

        let iter = table.iter().db("Failed to iterate metadata")?;
        for result in iter {
            let (k, v) = result.db("Failed to read metadata row")?;
            records.push((k.value().to_string(), v.value()));
        }
        // Sort by oldest first
        records.sort_by_key(|r| r.1);

        let mut needs_eviction = Vec::new();

        // 1. Enforce TTL (Time To Live)
        for (commit, last_accessed) in &records {
            if current_time.saturating_sub(*last_accessed) > max_age_secs {
                needs_eviction.push(commit.clone());
            }
        }

        // 2. Enforce Size Limit
        if physical_size > max_bytes && needs_eviction.is_empty() {
            // If we are over size, and TTL didn't catch anything, forcefully evict the oldest
            if let Some((oldest_commit, _)) = records.first() {
                needs_eviction.push(oldest_commit.clone());
            }
        }

        // Drop read lock before acquiring write lock in evict_commit
        drop(read_txn);

        for commit in needs_eviction {
            let _ = self.evict_commit(&commit);
            tracing::info!("🧹 Spool LRU Sweeper evicted stale workspace: {}", commit);
        }

        Ok(())
    }

    /// X-Ray Vision: Exposes exact Spool memory states.
    pub fn get_stats(&self) -> AxonResult<SpoolStats> {
        let physical_size_bytes = std::fs::metadata(&self.db_path)
            .map(|m| m.len())
            .unwrap_or(0);

        let read_txn = self.db.begin_read().db("Failed to open read txn for stats")?;
        let meta_table = read_txn.open_table(METADATA_TABLE).db("Failed to open Metadata table")?;
        
        let mut workspaces = Vec::new();
        let iter = meta_table.iter().db("Failed to iterate metadata")?;
        for result in iter {
            let (k, v) = result.db("Failed to read metadata row")?;
            workspaces.push(WorkspaceStat {
                commit_hash: k.value().to_string(),
                last_accessed: v.value(),
            });
        }

        Ok(SpoolStats {
            physical_size_bytes,
            active_commits: workspaces.len(),
            workspaces,
        })
    }
}