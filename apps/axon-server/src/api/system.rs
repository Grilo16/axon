use crate::api::prelude::*;
use axon_core::spool::SpoolStats;

#[instrument(skip(ctx))]
pub async fn get_spool_stats(
    ctx: AuthContext,
) -> AxonResult<Json<SpoolStats>> {
    // 🛡️ Security Check: Only the configured admin can view system internals.
    // Set the ADMIN_USER_ID env var to your Keycloak user UUID.
    match &ctx.state.admin_user_id {
        Some(admin_id) if ctx.user_id == *admin_id => {}
        _ => return Err(AxonError::Auth("Only system administrators can view telemetry".into())),
    }

    let stats = ctx.state.spool.get_stats()?;
    Ok(Json(stats))
}