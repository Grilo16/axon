use std::path::Path;
use ts_rs::TS;

use crate::{
    error::AxonError, explorer::{ExplorerEntry, ExplorerFile, ExplorerFolder}, graph::{AxonGraphView, FileNodeView}, ids::{DirectoryId, FileId, SymbolId}, tree::node::file::symbol::{
        ByteOffset, Export, Symbol, SymbolKind, TextRange, UnresolvedReference,
    }
};

pub fn do_export() {
    // The ONLY place the path exists
    let base_path = Path::new("../../apps/client-axon/src/shared/types/axon-core/");

    // Map types to their filenames
    let registry = vec![

        // export all the ID types together since they're often used together
        (FileId::export_all_to(base_path)),
        (DirectoryId::export_all_to(base_path)),
        (SymbolId::export_all_to(base_path)),


        // export all the symbol-related types together since they're often used together
        (SymbolKind::export_all_to(base_path)),
        (Symbol::export_all_to(base_path)),
        (ByteOffset::export_all_to(base_path)),
        (TextRange::export_all_to(base_path)),
        (UnresolvedReference::export_all_to(base_path)),
        (Export::export_all_to(base_path)),
        
        
        // export the graph and file node views
        (AxonGraphView::export_all_to(base_path)),
        (FileNodeView::export_all_to(base_path)),

        // export the explorer types
        (ExplorerFile::export_all_to(base_path)),
        (ExplorerFolder::export_all_to(base_path)),
        (ExplorerEntry::export_all_to(base_path)),

        // export the error type 
        (AxonError::export_all_to(base_path)),

    ];

    for result in registry {
        result.expect("TS Export Failed");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn update_typescript_types() {
        super::do_export();
    }
}
