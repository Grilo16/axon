use std::sync::Arc;

use axon_desktop_lib::{
    commands::{bundle, workspace},
    db::{bundle_repo::SqliteBundleRepo, workspace_repo::SqliteWorkspaceRepo},
    state::AppState,
};
use sqlx::migrate::Migrator;
use tauri::Manager;
use tracing::info;

static MIGRATOR: Migrator = sqlx::migrate!("./migrations");
fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // 1. We spawn the async initialization task
            // This runs on Tauri's managed async runtime without "blocking" the main thread
            tauri::async_runtime::spawn(async move {
                let app_data_dir = app_handle
                    .path()
                    .app_data_dir()
                    .expect("Failed to resolve app data directory");

                // 1. Ensure the directory exists
                if !app_data_dir.exists() {
                    std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
                }

                let db_path = app_data_dir.join("axon.db");

                // 2. REINFORCED: Use the 'create_if_missing' option in the connection string
                // And use a cleaner path conversion
                let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());

                info!("🚀 Attempting to open database: {}", db_url);

                // 3. Use ConnectOptions for more control
                use sqlx::sqlite::SqliteConnectOptions;
                use std::str::FromStr;

                let options = SqliteConnectOptions::from_str(&db_url)
                    .expect("Failed to parse connection string")
                    .create_if_missing(true); // Double-ensure it creates the file

                let pool = sqlx::SqlitePool::connect_with(options)
                    .await
                    .expect("Failed to connect to SQLite");

                // 4. Run Migrations
                MIGRATOR.run(&pool).await.expect("Failed to run migrations");

                // ... (rest of your state setup)
                let workspace_repo = Arc::new(SqliteWorkspaceRepo::new(pool.clone()));
                let bundle_repo = Arc::new(SqliteBundleRepo::new(pool.clone()));
                let app_state = AppState::new(workspace_repo, bundle_repo);

                app_handle.manage(app_state);
                info!("✅ Backend initialized!");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Workspace CRUD
            workspace::create_workspace,
            workspace::get_workspace,
            workspace::list_workspaces,
            workspace::update_workspace,
            workspace::touch_workspace,
            workspace::delete_workspace,
            // Workspace Engine
            workspace::workspace_status,
            workspace::load_github_workspace_ast,
            workspace::load_local_workspace_ast,
            workspace::get_all_file_paths,
            workspace::get_file_paths_by_dir,
            workspace::read_file,
            workspace::list_directory,
            // Bundles
            bundle::create_bundle,
            bundle::get_bundle,
            bundle::get_workspace_bundles,
            bundle::update_bundle,
            bundle::delete_bundle,
            bundle::clone_bundle,
            bundle::get_bundle_graph,
            bundle::generate_bundle,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
