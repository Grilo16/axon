use std::{path::PathBuf, time::Instant};
use axon_core::{engine::crawler::Crawler, features::prompt}; 
use log::{error, info};
use axon_core::analysis::javascript::skeleton::SkeletonTarget;

fn main() -> anyhow::Result<()> {
    // 1. Setup Logger (Hardcoded to debug for dev)
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug"))
        .format_timestamp(None) 
        .init();

    let start_time = Instant::now();

    // 2. HARDCODED CONFIGURATION AREA 🛠️
    let output_file = "axon_map.json";
    let output_prompt = "axon_prompt.md";
    let project_root = PathBuf::from(r"G:\Lesgo Coding Projects\Gamify\gamify-client");
    let target_file = project_root.join("src/main.tsx");

    let use_flattening = true;
    let crawl_depth = 2;     
    let show_line_numbers = true;
    let remove_comments = false;
    let redact_vars = vec![
        "App.tsx:Hideme".to_string(),
        "inventorySlice.ts:name".to_string()
        ];
    
    // Skeleton Choice: 
    // None                                  => Full code
    // Some(SkeletonTarget::All)             => Just signatures
    // Some(SkeletonTarget::KeepOnly(vec![])) => Focus Mode
    // Some(SkeletonTarget::StripOnly(vec![]))=> Shrink Mode
    let skeleton_choice = Some(SkeletonTarget::KeepOnly(vec![
        // "App.tsx:App".to_string(),
        "inventorySlice.ts:addItem".to_string(),
        "inventorySlice.ts:addMany".to_string(),
        ])); 

    // 3. EXECUTION
    info!("🚀 Axon Engine Initialized");
    info!("📂 Project Root: {:?}", project_root);
    info!("🎯 Entry Point: {:?}", target_file);

    let mut crawler = Crawler::new(project_root.clone());
    crawler.set_flattening(use_flattening);
    crawler.set_depth(crawl_depth);

    if let Err(e) = crawler.crawl(vec![target_file]) {
         error!("❌ Error during crawl: {}", e);
    }

    // 4. GENERATE PROMPT
    let config = prompt::PromptConfig { 
        files: crawler.visited.clone(), 
        project_root: project_root.clone(), 
        redactions: redact_vars, 
        show_line_numbers, 
        remove_comments, 
        skeleton_config: skeleton_choice 
    };

    let content = prompt::build_context(config)?;
            
    std::fs::write(&output_prompt, content)?;
    
    // 5. EXPORT GRAPH
    crawler.export_json(output_file)?;

    let duration = start_time.elapsed();
    info!("--------------------------------");
    info!("✅ Scan Complete in {:.2?}", duration);
    info!("📦 Bundled {} files.", crawler.visited.len());
    info!("🔗 Found {} connections.", crawler.links.len());
    info!("📝 Context saved to: {}", output_prompt);

    Ok(())
}