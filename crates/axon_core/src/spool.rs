use std::path::Path;
use redb::{Database, ReadTransaction, ReadableTable, TableDefinition};
use crate::error::{AxonError, AxonResult};

// ==========================================
// 1. TABLE DEFINITIONS
// ==========================================

/// Composite Key: (Commit Hash, File Path)
/// Value: The `rkyv` serialized bytes of `FileIr`
const AST_TABLE: TableDefinition<'static, (&str, &str), &[u8]> = TableDefinition::new("ast_chunks");

// ==========================================
// 2. ERROR HELPER
// ==========================================

/// Extension trait to convert any Display error into AxonError::Database with context.
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

#[derive(Debug)]
pub struct AxonSpool {
    db: Database,
}

impl AxonSpool {
    /// Initializes the memory-mapped NVMe database.
    pub fn new(path: impl AsRef<Path>) -> AxonResult<Self> {
        let db = Database::create(path).db("Failed to initialize redb spool")?;

        // Pre-create the table to ensure it exists for future read transactions
        let write_txn = db.begin_write().db("Failed to begin init transaction")?;
        {
            let _table = write_txn.open_table(AST_TABLE).db("Failed to create AST table")?;
        }
        write_txn.commit().db("Failed to commit init transaction")?;

        Ok(Self { db })
    }

    /// Writes a single chunk to the spool.
    pub fn write_chunk(&self, commit_hash: &str, file_path: &str, ir_bytes: &[u8]) -> AxonResult<()> {
        let write_txn = self.db.begin_write().db("Failed to begin write transaction")?;
        {
            let mut table = write_txn.open_table(AST_TABLE).db("Failed to open AST table")?;
            table.insert(&(commit_hash, file_path), ir_bytes).db("Failed to insert IR bytes")?;
        }
        write_txn.commit().db("Failed to commit write transaction")?;

        Ok(())
    }

    /// High-performance batch writer. Essential for ingesting an entire repository quickly.
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

    /// The Zero-Copy Reader.
    /// Yields the raw bytes directly from the memory-mapped file cache into a closure.
    pub fn with_chunk<F, R>(&self, commit_hash: &str, file_path: &str, callback: F) -> AxonResult<Option<R>>
    where
        F: FnOnce(&[u8]) -> R,
    {
        let read_txn: ReadTransaction = self.db.begin_read().db("Failed to begin read transaction")?;
        let table = read_txn.open_table(AST_TABLE).db("Failed to open AST table for read")?;
        let guard = table.get(&(commit_hash, file_path)).db("Failed to read key")?;

        if let Some(access_guard) = guard {
            // zero-copy slice pointing directly to OS page cache
            let bytes: &[u8] = access_guard.value();
            Ok(Some(callback(bytes)))
        } else {
            Ok(None)
        }
    }

    /// Drops all records for a specific commit hash to free NVMe disk space.
    pub fn evict_commit(&self, target_commit: &str) -> AxonResult<usize> {
        let write_txn = self.db.begin_write().db("Failed to begin eviction transaction")?;

        let mut count = 0;
        {
            let mut table = write_txn.open_table(AST_TABLE).db("Failed to open AST table for eviction")?;

            // We must collect keys to delete first, as redb doesn't allow mutation during iteration
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
        Ok(count)
    }
}
