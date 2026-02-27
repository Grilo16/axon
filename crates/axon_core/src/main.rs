use axon_core::error::AxonResult;
use axon_core::graph::AxonGraph;
use axon_core::parser::javascript::JsTsParser;
use axon_core::tree::node::file::symbol::Symbol;
use axon_core::tree::options::AxonScanOptions;
use axon_core::tree::source::OsSource;
use axon_core::tree::state::RegistryAccess;
use axon_core::tree::AxonTree;
use std::path::PathBuf;

#[tokio::main]
async fn main() -> AxonResult<()> {
    // 1. Setup & Configuration
    let root = PathBuf::from("G:/Lesgo Coding Projects/axon/client-axon/");
    let options = AxonScanOptions::default();
    let parser = JsTsParser;

    println!("🚀 Starting Axon Engine at: {:?}", root.canonicalize()?);

    // ---------------------------------------------------------
    // THE PIPELINE: Discovery -> Hydration -> Analysis
    // ---------------------------------------------------------

    let tree = AxonTree::new(root.clone(), options)?.scan_os()?;
    let source_manager = OsSource::new(root);

    let loaded_tree = tree.load_all_sources(&source_manager).await?;
    let analyzed_tree = loaded_tree.analyze(&parser).await?;

    // ---------------------------------------------------------
    // THE GRAPH: Resolve all internal relationships
    // ---------------------------------------------------------

    let graph = AxonGraph::build(&analyzed_tree);

    let graph_view = graph.to_view(&analyzed_tree, &[],true);

    // 2. Serialize to pretty-printed JSON
    let json_data = serde_json::to_string_pretty(&graph_view)?;

    // 3. Save to a file in your project root
    let output_path = "axon_graph_output.json";
    std::fs::write(output_path, json_data)?;

    println!("\n💾 Graph exported successfully to: {}", output_path);
    println!("📈 Nodes: {} | Edges: {}", graph_view.nodes.len(), graph_view.edges.len());

    // ---------------------------------------------------------
    // REPORTING: Show the fruits of our labor
    // ---------------------------------------------------------

    println!(
        "📁 Stats: {} dirs, {} files",
        analyzed_tree.directories().len(),
        analyzed_tree.files().len()
    );
    println!(
        "🧠 Semantic Analysis: Found {} total symbols",
        analyzed_tree.total_symbol_count()
    );

    // Use our new Graph Reporter
    let target_path = "src/features/workspace/workspacesSlice.ts";

    if let Some(file_id) = analyzed_tree.file_id_by_path(target_path) {
        let file = analyzed_tree.file(file_id).expect("File must exist");

        println!("\n🔍 Targeted Deep Dive: {}", file.name());
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Use our new Graph Reporter
        println!("\n🌳 Semantic Structure (Tree View):");

        // NOW 'file' is a value, not a macro!
        for sym in file.symbols().iter().filter(|s| s.parent.is_none()) {
            print_symbol_tree(sym, file.symbols(), 0);
        }
    } else {
        println!("\n⚠️  Target file {} not found in scan.", target_path);

        // Optional: Just print the first file found as a fallback
        if let Some(first_file) = analyzed_tree.files().iter().next() {
            println!(
                "Printing first available file instead: {}",
                first_file.name()
            );
            for sym in first_file.symbols().iter().filter(|s| s.parent.is_none()) {
                print_symbol_tree(sym, first_file.symbols(), 0);
            }
        }
    }

    Ok(())
}

// Simple recursive helper for the console
fn print_symbol_tree(sym: &Symbol, all_symbols: &[Symbol], depth: usize) {
    let indent = "  ".repeat(depth);
    let branch = if depth > 0 { "└─ " } else { "" };

    // Print Docstring if it exists (shortened for console)
    if let Some(doc) = &sym.docstring {
        let clean_doc = doc.trim().replace("\n", " ");
        let short_doc = if clean_doc.len() > 60 {
            format!("{}...", &clean_doc[..57])
        } else {
            clean_doc
        };
        println!("{}  /** {} */", indent, short_doc);
    }

    println!(
        "{}{}[{:?}] {:<25} | Body: {}",
        indent,
        branch,
        sym.kind,
        sym.name,
        if sym.body_range.is_some() {
            "✅"
        } else {
            "❌"
        }
    );

    // Recursively print children
    for child_id in &sym.children {
        if let Some(child) = all_symbols.iter().find(|s| s.id == *child_id) {
            print_symbol_tree(child, all_symbols, depth + 1);
        }
    }
}
