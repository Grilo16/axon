use std::sync::Arc;

use axon_desktop_lib::{
    commands::{bundle, workspace},
    db::{bundle_repo::SqliteBundleRepo, workspace_repo::SqliteWorkspaceRepo},
    state::AppState,
};
use axon_core::spool::AxonSpool;
use sqlx::migrate::Migrator;
use tauri::Manager;
use tracing::{error, info};
use tracing_subscriber::{fmt, EnvFilter};

static MIGRATOR: Migrator = sqlx::migrate!("./migrations");

fn main() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        EnvFilter::new(
            "axon_core=info,axon_desktop_lib=info,\
             sqlx=warn,moka=warn,hyper=warn,tauri=info",
        )
    });

    fmt()
        .with_env_filter(filter)
        .with_target(true)
        .compact()
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                if let Err(e) = initialize_backend(&app_handle).await {
                    error!("Backend initialization failed: {}", e);
                }
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
            workspace::rescan_workspace,
            // Workspace Engine
            workspace::get_all_file_paths,
            workspace::get_file_paths_by_dir,
            workspace::read_file,
            workspace::list_directory,
            workspace::search_files,
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

async fn initialize_backend(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {e}"))?;

    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)?;
    }

    // 1. SQLite Database
    let db_path = app_data_dir.join("axon.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());

    info!(db_url = %db_url, "connecting to SQLite database");

    use sqlx::sqlite::SqliteConnectOptions;
    use std::str::FromStr;

    let options = SqliteConnectOptions::from_str(&db_url)?
        .create_if_missing(true);

    let pool = sqlx::SqlitePool::connect_with(options).await?;
    MIGRATOR.run(&pool).await?;

    // 2. NVMe Spool (redb cache for parsed AST chunks + skeletons)
    let spool_path = app_data_dir.join("axon_spool.db");
    let spool = Arc::new(AxonSpool::new(&spool_path)?);
    info!(path = %spool_path.display(), "spool initialized");

    // 3. Build application state
    let workspace_repo = Arc::new(SqliteWorkspaceRepo::new(pool.clone()));
    let bundle_repo = Arc::new(SqliteBundleRepo::new(pool.clone()));
    let app_state = AppState::new(workspace_repo, bundle_repo, spool);

    app_handle.manage(app_state);
    info!("backend initialized successfully");

    Ok(())
}
