use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;
use tracing::info;

pub async fn init_db_pool() -> PgPool {
    let database_url = env::var("DATABASE_URL")
        .expect("❌ DATABASE_URL must be set in .env or environment variables!");
    info!("🔌 Connecting to database...");
        

    PgPoolOptions::new()
        .max_connections(10) // Perfect for a VPS deployment
        .connect(&database_url)
        .await
        .expect("❌ Failed to connect to Postgres! Is Docker running and the URL correct?")
}