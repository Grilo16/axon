use async_trait::async_trait;
use sqlx::PgPool;
use tracing::instrument;
use chrono::Utc;

use axon_core::{
    domain::workspace::{UpdateWorkspacePayload, WorkspaceRecord, WorkspaceRepository},
    error::{AxonError, AxonResult},
};

pub struct PostgresWorkspaceRepo {
    pool: PgPool,
}

impl PostgresWorkspaceRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl WorkspaceRepository for PostgresWorkspaceRepo {
    #[instrument(skip(self))]
    async fn create(&self, workspace: WorkspaceRecord) -> AxonResult<()> {
        sqlx::query!(
            r#"
            INSERT INTO workspaces (id, owner_id, name, project_root, last_opened, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            workspace.id,
            workspace.owner_id,
            workspace.name,
            workspace.project_root,
            workspace.last_opened,
            workspace.created_at,
            workspace.updated_at
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Create Error: {}", e)))?;

        Ok(())
    }

    #[instrument(skip(self))]
    async fn get_by_id_and_owner(&self, id: &str, owner_id: &str) -> AxonResult<Option<WorkspaceRecord>> {
        let record = sqlx::query_as!(
            WorkspaceRecord,
            r#"
            SELECT id, owner_id, name, project_root, last_opened, created_at, updated_at
            FROM workspaces
            WHERE id = $1 AND owner_id = $2
            "#,
            id,
            owner_id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Get Error: {}", e)))?;

        Ok(record)
    }

    #[instrument(skip(self))]
    async fn list_for_user(&self, owner_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<WorkspaceRecord>> {
        let records = sqlx::query_as!(
            WorkspaceRecord,
            r#"
            SELECT id, owner_id, name, project_root, last_opened, created_at, updated_at
            FROM workspaces
            WHERE owner_id = $1
            ORDER BY last_opened DESC
            LIMIT $2 OFFSET $3
            "#,
            owner_id,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB List Error: {}", e)))?;

        Ok(records)
    }

    #[instrument(skip(self))]
    async fn update(&self, id: &str, owner_id: &str, payload: UpdateWorkspacePayload) -> AxonResult<()> {
        let now = Utc::now().to_rfc3339();
        
        // COALESCE allows us to only update fields that were provided in the payload
        let result = sqlx::query!(
            r#"
            UPDATE workspaces
            SET 
                name = COALESCE($1, name),
                updated_at = $2
            WHERE id = $3 AND owner_id = $4
            "#,
            payload.name,
            now,
            id,
            owner_id
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Update Error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AxonError::NotFound { entity: "Workspace".into(), id: id.to_string() });
        }

        Ok(())
    }

    #[instrument(skip(self))]
    async fn touch(&self, id: &str, owner_id: &str) -> AxonResult<()> {
        let now = Utc::now().to_rfc3339();
        
        let result = sqlx::query!(
            r#"
            UPDATE workspaces
            SET last_opened = $1
            WHERE id = $2 AND owner_id = $3
            "#,
            now,
            id,
            owner_id
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Touch Error: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AxonError::NotFound { entity: "Workspace".into(), id: id.to_string() });
        }

        Ok(())
    }

    #[instrument(skip(self))]
    async fn delete(&self, id: &str, owner_id: &str) -> AxonResult<bool> {
        let result = sqlx::query!(
            r#"
            DELETE FROM workspaces
            WHERE id = $1 AND owner_id = $2
            "#,
            id,
            owner_id
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Delete Error: {}", e)))?;

        Ok(result.rows_affected() > 0)
    }
}