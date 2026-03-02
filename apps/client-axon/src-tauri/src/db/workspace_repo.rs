use async_trait::async_trait;
use sqlx::SqlitePool;
use tracing::instrument;
use chrono::Utc;

use axon_core::{
    domain::workspace::{UpdateWorkspacePayload, WorkspaceRecord, WorkspaceRepository},
    error::{AxonError, AxonResult},
};

pub struct SqliteWorkspaceRepo {
    pool: SqlitePool,
}

impl SqliteWorkspaceRepo {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl WorkspaceRepository for SqliteWorkspaceRepo {
    #[instrument(skip(self))]
    async fn create(&self, workspace: WorkspaceRecord) -> AxonResult<()> {
        sqlx::query(
            r#"
            INSERT INTO workspaces (id, owner_id, name, project_root, last_opened, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&workspace.id)
        .bind(&workspace.owner_id)
        .bind(&workspace.name)
        .bind(&workspace.project_root)
        .bind(&workspace.last_opened)
        .bind(&workspace.created_at)
        .bind(&workspace.updated_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("SQLite Create Error: {}", e)))?;

        Ok(())
    }

    #[instrument(skip(self))]
    async fn get_by_id_and_owner(&self, id: &str, owner_id: &str) -> AxonResult<Option<WorkspaceRecord>> {
        // query_as::<_, Struct> works without the ! macro
        let record = sqlx::query_as::<_, WorkspaceRecord>(
            r#"
            SELECT id, owner_id, name, project_root, last_opened, created_at, updated_at
            FROM workspaces
            WHERE id = ? AND owner_id = ?
            "#
        )
        .bind(id)
        .bind(owner_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("SQLite Get Error: {}", e)))?;

        Ok(record)
    }

    #[instrument(skip(self))]
    async fn list_for_user(&self, owner_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<WorkspaceRecord>> {
        let records = sqlx::query_as::<_, WorkspaceRecord>(
            r#"
            SELECT id, owner_id, name, project_root, last_opened, created_at, updated_at
            FROM workspaces
            WHERE owner_id = ?
            ORDER BY last_opened DESC
            LIMIT ? OFFSET ?
            "#
        )
        .bind(owner_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("SQLite List Error: {}", e)))?;

        Ok(records)
    }

    #[instrument(skip(self))]
    async fn update(&self, id: &str, owner_id: &str, payload: UpdateWorkspacePayload) -> AxonResult<()> {
        let now = Utc::now().to_rfc3339();
        
        let result = sqlx::query(
            r#"
            UPDATE workspaces
            SET 
                name = COALESCE(?, name),
                updated_at = ?
            WHERE id = ? AND owner_id = ?
            "#
        )
        .bind(payload.name)
        .bind(now)
        .bind(id)
        .bind(owner_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("SQLite Update Error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AxonError::NotFound { entity: "Workspace".into(), id: id.to_string() });
        }

        Ok(())
    }

    #[instrument(skip(self))]
    async fn touch(&self, id: &str, owner_id: &str) -> AxonResult<()> {
        let now = Utc::now().to_rfc3339();
        
        let result = sqlx::query(
            r#"
            UPDATE workspaces
            SET last_opened = ?
            WHERE id = ? AND owner_id = ?
            "#
        )
        .bind(now)
        .bind(id)
        .bind(owner_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("SQLite Touch Error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AxonError::NotFound { entity: "Workspace".into(), id: id.to_string() });
        }

        Ok(())
    }

    #[instrument(skip(self))]
    async fn delete(&self, id: &str, owner_id: &str) -> AxonResult<bool> {
        let result = sqlx::query(
            r#"
            DELETE FROM workspaces
            WHERE id = ? AND owner_id = ?
            "#
        )
        .bind(id)
        .bind(owner_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("SQLite Delete Error: {}", e)))?;

        Ok(result.rows_affected() > 0)
    }
}