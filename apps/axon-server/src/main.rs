mod api;
mod infrastructure;
mod state;

use crate::infrastructure::prelude::*;
use tracing_subscriber::{fmt, EnvFilter};

#[tokio::main]
async fn main() -> AxonResult<()> {
    // Build a strict EnvFilter that silences noisy external crates by default.
    // Override at runtime with RUST_LOG, e.g.:
    //   RUST_LOG="axon_core=trace,axon_server=trace,tower_http=trace"
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        EnvFilter::new(
            "axon_core=info,axon_server=info,tower_http=debug,\
             axum_keycloak_auth=warn,hyper=warn,h2=warn,\
             sqlx=warn,moka=warn,reqwest=warn",
        )
    });

    fmt()
        .with_env_filter(filter)
        .with_target(true)
        .with_thread_ids(false)
        .with_file(false)
        .compact()
        .init();

    Bootstrapper::<Unconfigured>::new()
        .await?
        .connect_db()
        .await?
        .seed_public_workspaces()
        .await?
        .serve()
        .await?;

    Ok(())
}
