use std::{env, path};
use axon_core::error::{AxonError, AxonResult};
use tracing::{info, instrument};

use crate::infrastructure::bootstrapper::{Bootstrapper, db_ready::DbReady};
use crate::infrastructure::config::AppConfig;
use crate::infrastructure::db::init_db_pool;

pub struct Unconfigured;

impl Bootstrapper<Unconfigured> {
    #[instrument(err)]
    pub async fn new() -> AxonResult<Self> {
        let run_mode = env::var("RUN_MODE").unwrap_or_else(|_| "dev".to_string());

        if run_mode == "dev" {
            let env_path = path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../infra/dev/.env");
            match dotenvy::from_path(&env_path) {
                Ok(_) => info!("✅ Loaded dev .env file from {:?}", env_path),
                Err(e) => tracing::warn!("⚠️ Could not load dev .env file: {}", e),
            }
        } else {
            info!("🚀 Running in {} mode. Relying entirely on Docker-injected variables.", run_mode);
        }

        let config = AppConfig::load()?;
        Ok(Self { config, state: Unconfigured })
    }

    #[instrument(skip(self), err)]
    pub async fn connect_db(self) -> AxonResult<Bootstrapper<DbReady>> {
        // Pass the validated DB URL from config
        let pool = init_db_pool(&self.config.db_url).await?; 
        info!("✅ Connected to Postgres database.");
        
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .map_err(|e| AxonError::Database(format!("Migration failed: {}", e)))?;
            
        // Transition state: Pack the pool into DbReady
        Ok(Bootstrapper {
            config: self.config,
            state: DbReady { pool },
        })
    }
}