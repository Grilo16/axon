use crate::api::prelude::*;
use axon_core::spool::SpoolStats;

#[instrument(skip(ctx))]
pub async fn get_spool_stats(
    ctx: AuthContext,
) -> AxonResult<Json<SpoolStats>> {
    // 🛡️ Security Check: Ensure only your Admin Keycloak account can view system internals
    // You can customize this to match your specific admin UUID or role
    // if ctx.user_id != "YOUR_ADMIN_UUID_HERE" {
    //     return Err(AxonError::Unauthorized("Only system administrators can view telemetry.".into()));
    // }

    let stats = ctx.state.spool.get_stats()?;
    Ok(Json(stats))
}