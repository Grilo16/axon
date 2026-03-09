use serde::Deserialize;
use ts_rs::TS;

use crate::bundler::rules::BundleOptions;


#[derive(Deserialize, TS)]
#[ts(export_to = "public-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct StatelessGraphReq {
    pub workspace_id: String,
    pub options: BundleOptions,
}
