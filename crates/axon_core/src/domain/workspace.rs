use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use crate::error::AxonResult;
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS, FromRow)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceRecord {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub project_root: String,
    pub last_opened: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspacePayload {
    pub name: Option<String>,
    pub project_root: Option<String>,
    pub last_opened: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct CreateWorkspaceReq {
    pub name: String,
    pub project_root: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ListWorkspacesQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct FileQuery {
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct DirQuery {
    pub path: String,
    pub recursive: bool,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ReadFileReq {
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export_to = "workspace-api.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct SearchQuery {
    pub value: String,
    pub limit: Option<usize>,
}

#[async_trait]
pub trait WorkspaceRepository: Send + Sync {
    async fn create(&self, workspace: WorkspaceRecord) -> AxonResult<()>;
    async fn get_by_id_and_owner(&self, id: &str, owner_id: &str) -> AxonResult<Option<WorkspaceRecord>>;
    async fn list_for_user(&self, owner_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<WorkspaceRecord>>;
    async fn update(&self, id: &str, owner_id: &str, payload: UpdateWorkspacePayload) -> AxonResult<()>;
    async fn touch(&self, id: &str, owner_id: &str) -> AxonResult<()>;
    async fn delete(&self, id: &str, owner_id: &str) -> AxonResult<bool>;
}