use std::sync::Arc;
use rayon::prelude::*;
use rkyv::rancor::Error as RkyvError;

use crate::{
    error::{AxonError, AxonResult},
    ids::FileId,
    parser::AxonParser,
    ir::FileChunk,
    spool::AxonSpool,
    tree::{
        AxonTree,
        node::{AxonFile, file::state::Outlined},
        state::{Analyzed, Loaded, TreeRegistry},
    },
};

impl Loaded {
    pub fn source(&self, file_id: FileId) -> Option<&str> {
        self.0.files.get(file_id.as_usize()).map(|f| f.content())
    }
}

impl AxonTree<Loaded> {
    pub async fn spool_to_disk<P: AxonParser + Sync + Send + 'static>(
        self,
        parser: Arc<P>,
        spool: Arc<AxonSpool>,
        commit_hash: String,
    ) -> AxonResult<AxonTree<Analyzed>> {
        let registry = self.state.0;
        let files = registry.files;

       let processed_files = crate::time_it!("Total AST Analysis & Spool Phase", {
            tokio::task::spawn_blocking(move || {
                let chunks: Vec<_> = files.chunks(100).collect();
                let mut analyzed_files = Vec::with_capacity(files.len());

                for chunk in chunks {
                    let serialized_batch: Result<Vec<_>, AxonError> = chunk
                        .par_iter()
                        .map(|file| {
                            // ⏱️ Wrap the individual file parsing
                            let output = crate::time_it!(
                                "Parsing {}", file.path().as_str();
                                parser.parse(file.content(), file.source_type())?
                            );

                            let file_chunk = FileChunk {
                                file_id: file.id(),
                                content: file.content().to_string(), 
                                symbols: output.symbols,
                                imports: output.imports,
                                exports: output.exports,
                            };

                            let bytes = rkyv::to_bytes::<RkyvError>(&file_chunk)
                                .map_err(|e| AxonError::Parse { 
                                    path: file.path().clone(), 
                                    message: format!("Rkyv Serialization failed: {}", e) 
                                })?;

                            Ok((file.id(), file.path().as_str().to_string(), bytes.into_vec()))
                        })
                        .collect();

                    let batch = serialized_batch?;

                    let write_refs: Vec<(&str, &str, &[u8])> = batch.iter()
                        .map(|(_, path, bytes)| (commit_hash.as_str(), path.as_str(), bytes.as_slice()))
                        .collect();

                    spool.write_batch(&write_refs)?;

                    for file in chunk.iter() {
                        analyzed_files.push(AxonFile::transition(
                            file.id(),
                            file.path().clone(),
                            file.parent_id(),
                            file.source_type(),
                            Outlined {
                                content: Arc::from(""), 
                                symbols: vec![],
                                imports: vec![],
                                exports: vec![],
                            },
                        ));
                    }
                }

                Ok::<_, AxonError>(analyzed_files)
            })
            .await
            .map_err(|e| AxonError::Startup(format!("Spawn blocking panicked: {}", e)))??
        });
        
        
        Ok(AxonTree {
            core: self.core,
            state: Analyzed(TreeRegistry {
                root_dir_id: registry.root_dir_id,
                directories: registry.directories,
                files: processed_files,
                dir_by_path: registry.dir_by_path,
                file_by_path: registry.file_by_path,
            }),
        })
    }
}