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
// 2. THE SPOOL ENGINE
// ==========================================

#[derive(Debug)]
pub struct AxonSpool {
    db: Database,
}

impl AxonSpool {
    /// Initializes the memory-mapped NVMe database.
    pub fn new(path: impl AsRef<Path>) -> AxonResult<Self> {
        let db = Database::create(path)
            .map_err(|e| AxonError::Database(format!("Failed to initialize redb spool: {}", e)))?;

        // Pre-create the table to ensure it exists for future read transactions
        let write_txn = db.begin_write()
            .map_err(|e| AxonError::Database(format!("Failed to begin init transaction: {}", e)))?;
        
        {
            let _table = write_txn.open_table(AST_TABLE)
                .map_err(|e| AxonError::Database(format!("Failed to create AST table: {}", e)))?;
        }
        
        write_txn.commit()
            .map_err(|e| AxonError::Database(format!("Failed to commit init transaction: {}", e)))?;

        Ok(Self { db })
    }

    /// Writes a single chunk to the spool.
    pub fn write_chunk(&self, commit_hash: &str, file_path: &str, ir_bytes: &[u8]) -> AxonResult<()> {
        let write_txn = self.db.begin_write()
            .map_err(|e| AxonError::Database(format!("Failed to begin write transaction: {}", e)))?;

        {
            let mut table = write_txn.open_table(AST_TABLE)
                .map_err(|e| AxonError::Database(format!("Failed to open AST table: {}", e)))?;
            
            table.insert(&(commit_hash, file_path), ir_bytes)
                .map_err(|e| AxonError::Database(format!("Failed to insert IR bytes: {}", e)))?;
        }

        write_txn.commit()
            .map_err(|e| AxonError::Database(format!("Failed to commit write transaction: {}", e)))?;

        Ok(())
    }

    /// High-performance batch writer. Essential for ingesting an entire repository quickly.
    pub fn write_batch(&self, chunks: &[(&str, &str, &[u8])]) -> AxonResult<()> {
        let write_txn = self.db.begin_write()
            .map_err(|e| AxonError::Database(format!("Failed to begin batch write transaction: {}", e)))?;

        {
            let mut table = write_txn.open_table(AST_TABLE)
                .map_err(|e| AxonError::Database(format!("Failed to open AST table: {}", e)))?;
            
            for (commit_hash, file_path, ir_bytes) in chunks {
                table.insert(&(*commit_hash, *file_path), *ir_bytes)
                    .map_err(|e| AxonError::Database(format!("Failed to insert chunk for {}: {}", file_path, e)))?;
            }
        }

        write_txn.commit()
            .map_err(|e| AxonError::Database(format!("Failed to commit batch transaction: {}", e)))?;

        Ok(())
    }

    /// The Zero-Copy Reader.
    /// Yields the raw bytes directly from the memory-mapped file cache into a closure.
    pub fn with_chunk<F, R>(&self, commit_hash: &str, file_path: &str, callback: F) -> AxonResult<Option<R>>
    where
        F: FnOnce(&[u8]) -> R,
    {
        let read_txn: ReadTransaction = self.db.begin_read()
            .map_err(|e| AxonError::Database(format!("Failed to begin read transaction: {}", e)))?;

        let table = read_txn.open_table(AST_TABLE)
            .map_err(|e| AxonError::Database(format!("Failed to open AST table for read: {}", e)))?;

        let guard = table.get(&(commit_hash, file_path))
            .map_err(|e| AxonError::Database(format!("Failed to read key: {}", e)))?;

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
        let write_txn = self.db.begin_write()
            .map_err(|e| AxonError::Database(format!("Failed to begin eviction transaction: {}", e)))?;

        let mut count = 0;
        
        {
            let mut table = write_txn.open_table(AST_TABLE)
                .map_err(|e| AxonError::Database(format!("Failed to open AST table for eviction: {}", e)))?;
            
            // We must collect keys to delete first, as redb doesn't allow mutation during iteration
            let mut keys_to_delete = Vec::new();
            
            // Explicitly type the tuple so the compiler knows how to satisfy the Borrow trait
            let start_bound: (&str, &str) = (target_commit, "");
            
            let range = table.range(start_bound..)
                .map_err(|e| AxonError::Database(format!("Failed to open table range: {}", e)))?;
                
            for result in range {
                let (k, _) = result.map_err(|e| AxonError::Database(format!("Range iteration error: {}", e)))?;
                let (commit, path) = k.value();
                
                if commit == target_commit {
                    // We must allocate strings here to store them safely outside the iterator borrow
                    keys_to_delete.push((commit.to_string(), path.to_string()));
                } else {
                    break; // Since it's a B-Tree, once the commit doesn't match, we are past the relevant records
                }
            }
            
            for (commit, path) in keys_to_delete {
                table.remove(&(commit.as_str(), path.as_str()))
                    .map_err(|e| AxonError::Database(format!("Failed to remove chunk: {}", e)))?;
                count += 1;
            }
        }

        write_txn.commit()
            .map_err(|e| AxonError::Database(format!("Failed to commit eviction transaction: {}", e)))?;

        Ok(count)
    }
}