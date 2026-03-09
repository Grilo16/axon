use sqlx::{postgres::PgPoolOptions, PgPool};
use tracing::info;
use axon_core::error::{AxonError, AxonResult};
use crate::infrastructure::config::DatabaseUrl;

pub async fn init_db_pool(db_url: &DatabaseUrl) -> AxonResult<PgPool> {
    info!("🔌 Connecting to database...");

    PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url.0)
        .await
        .map_err(|e| AxonError::Database(format!("Failed to connect to Postgres: {}", e)))
}