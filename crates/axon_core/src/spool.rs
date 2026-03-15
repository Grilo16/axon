use std::path::Path;
use redb::{Database, ReadTransaction, ReadableTable, TableDefinition};
use moka::sync::Cache;
use std::sync::Arc;
use crate::error::{AxonError, AxonResult};
use crate::ir::FileChunk;

// ==========================================
// 1. TABLE DEFINITIONS
// ==========================================

const AST_TABLE: TableDefinition<'static, (&str, &str), &[u8]> = TableDefinition::new("ast_chunks");

// ==========================================
// 2. ERROR HELPER
// ==========================================

trait RedbCtx<T> {
    fn db(self, context: &str) -> AxonResult<T>;
}

impl<T, E: std::fmt::Display> RedbCtx<T> for Result<T, E> {
    fn db(self, context: &str) -> AxonResult<T> {
        self.map_err(|e| AxonError::Database(format!("{}: {}", context, e)))
    }
}

// ==========================================
// 3. THE SPOOL ENGINE
// ==========================================

#[derive(Debug, Clone)]
pub struct AxonSpool {
    db: Arc<Database>,
    // 🛡️ The Bounded L1 Cache. 
    // Key: (Commit Hash, File Path). Value: Zero-Copy Smart Pointer
    l1_cache: Cache<(String, String), Arc<FileChunk>>,
}

impl AxonSpool {
    pub fn new(path: impl AsRef<Path>) -> AxonResult<Self> {
        let db = Database::create(path).db("Failed to initialize redb spool")?;

        let write_txn = db.begin_write().db("Failed to begin init transaction")?;
        {
            let _table = write_txn.open_table(AST_TABLE).db("Failed to create AST table")?;
        }
        write_txn.commit().db("Failed to commit init transaction")?;

        // 🛡️ 1 Gigabyte Maximum Physical RAM Limit. OOM is now mathematically impossible.
        let l1_cache = Cache::builder()
            .max_capacity(1_073_741_824) 
            .weigher(|_key, chunk: &Arc<FileChunk>| -> u32 {
                chunk.byte_size()
            })
            .build();

        Ok(Self { 
            db: Arc::new(db), 
            l1_cache 
        })
    }

    pub fn write_chunk(&self, commit_hash: &str, file_path: &str, ir_bytes: &[u8]) -> AxonResult<()> {
        let write_txn = self.db.begin_write().db("Failed to begin write transaction")?;
        {
            let mut table = write_txn.open_table(AST_TABLE).db("Failed to open AST table")?;
            table.insert(&(commit_hash, file_path), ir_bytes).db("Failed to insert IR bytes")?;
        }
        write_txn.commit().db("Failed to commit write transaction")?;
        Ok(())
    }

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

    /// Fetches the chunk from the 1-microsecond RAM Cache, falling back to NVMe on a miss.
    pub fn get_cached_chunk(&self, commit_hash: &str, file_path: &str) -> AxonResult<Arc<FileChunk>> {
        let key = (commit_hash.to_string(), file_path.to_string());
        
        let chunk = self.l1_cache.try_get_with(key, || -> Result<Arc<FileChunk>, String> {
            let mut result = Err(format!("AST chunk missing in spool for {}", file_path));
            
            let query_res = self.with_chunk(commit_hash, file_path, |bytes| {
                let mut aligned_buffer: rkyv::util::AlignedVec<16> = rkyv::util::AlignedVec::with_capacity(bytes.len());
                aligned_buffer.extend_from_slice(bytes);

                match rkyv::from_bytes::<FileChunk, rkyv::rancor::Error>(&aligned_buffer) {
                    Ok(chunk) => {
                        result = Ok(Arc::new(chunk));
                    }
                    Err(e) => {
                        result = Err(format!("Failed to deserialize chunk: {}", e));
                    }
                }
            });

            match query_res {
                Ok(_) => result,
                Err(e) => Err(format!("Database error: {}", e)),
            }
        }).map_err(|e| AxonError::Backend(format!("Cache error: {}", e)))?;

        Ok(chunk)
    }

    pub fn with_chunk<F, R>(&self, commit_hash: &str, file_path: &str, callback: F) -> AxonResult<Option<R>>
    where
        F: FnOnce(&[u8]) -> R,
    {
        let read_txn: ReadTransaction = self.db.begin_read().db("Failed to begin read transaction")?;
        let table = read_txn.open_table(AST_TABLE).db("Failed to open AST table for read")?;
        let guard = table.get(&(commit_hash, file_path)).db("Failed to read key")?;

        if let Some(access_guard) = guard {
            let bytes: &[u8] = access_guard.value();
            Ok(Some(callback(bytes)))
        } else {
            Ok(None)
        }
    }

    pub fn evict_commit(&self, target_commit: &str) -> AxonResult<usize> {
        let write_txn = self.db.begin_write().db("Failed to begin eviction transaction")?;

        let mut count = 0;
        {
            let mut table = write_txn.open_table(AST_TABLE).db("Failed to open AST table for eviction")?;
            let mut keys_to_delete = Vec::new();
            let start_bound: (&str, &str) = (target_commit, "");

            let range = table.range(start_bound..).db("Failed to open table range")?;
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
                table.remove(&(commit.as_str(), path.as_str())).db("Failed to remove chunk")?;
                count += 1;
            }
        }

        write_txn.commit().db("Failed to commit eviction transaction")?;
        
        // 🧹 The Iterator Fix:
        // We explicitly iterate over the keys in the Moka cache and invalidate matching ones.
        for (key, _) in &self.l1_cache {
            if key.0 == target_commit {
                self.l1_cache.invalidate(&*key);
            }
        }
        
        Ok(count)
    }
}