mod api;
mod infrastructure;
mod state;

use crate::infrastructure::prelude::*;
// use tracing::info;

#[tokio::main]
async fn main() -> AxonResult<()> {
    tracing_subscriber::fmt()
  .with_env_filter("axon=debug,axum_keycloak_auth=debug") 
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