use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::error::AxonResult;
use crate::bundler::rules::BundleOptions;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundle-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct BundleRecord {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub options: BundleOptions,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundle-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct UpdateBundlePayload {
    pub name: Option<String>,
    pub options: Option<BundleOptions>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundle-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct CreateBundleReq {
    pub workspace_id: String,
    pub name: String,
    pub options: BundleOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundle-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct CloneBundleReq {
    pub new_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "bundle-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ListBundlesQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}



#[async_trait]
pub trait BundleRepository: Send + Sync {
    async fn create(&self, bundle: BundleRecord) -> AxonResult<()>;
    async fn duplicate(&self, bundle_id: &str, new_id: &str, new_name: Option<String>) -> AxonResult<BundleRecord>;
    async fn get_by_id(&self, id: &str) -> AxonResult<Option<BundleRecord>>;
    async fn get_by_workspace_id(&self, workspace_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<BundleRecord>>;
    async fn update(&self, id: &str, updates: UpdateBundlePayload) -> AxonResult<()>;
    async fn delete(&self, id: &str) -> AxonResult<bool>;
    async fn delete_by_workspace_id(&self, workspace_id: &str) -> AxonResult<u64>; // Returns count
}