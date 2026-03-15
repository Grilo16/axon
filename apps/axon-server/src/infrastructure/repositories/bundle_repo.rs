use async_trait::async_trait;
use sqlx::{PgPool, types::Json};
use tracing::instrument;
use chrono::Utc;

use axon_core::{
    domain::bundle::{BundleOptions, BundleRecord, BundleRepository, UpdateBundlePayload},
    error::{AxonError, AxonResult},
};

pub struct PostgresBundleRepo {
    pool: PgPool,
}

impl PostgresBundleRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl BundleRepository for PostgresBundleRepo {
    #[instrument(skip(self, bundle))]
    async fn create(&self, bundle: BundleRecord) -> AxonResult<()> {
        sqlx::query!(
            r#"
            INSERT INTO bundles (id, workspace_id, name, options, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            bundle.id,
            bundle.workspace_id,
            bundle.name,
            Json(&bundle.options) as _, 
            bundle.created_at,
            bundle.updated_at
        )
        .execute(&self.pool)
        .await?; // 🌟 Implicitly mapped via From trait
        
        Ok(())
    }

    #[instrument(skip(self))]
    async fn duplicate(&self, bundle_id: &str, new_id: &str, new_name: Option<String>) -> AxonResult<BundleRecord> {
        let original = self.get_by_id(bundle_id).await?
            .ok_or_else(|| AxonError::NotFound {
                entity: "Bundle",
                id: bundle_id.to_string()
            })?;
            
        let now = Utc::now().to_rfc3339();
        let cloned_record = BundleRecord {
            id: new_id.to_string(),
            workspace_id: original.workspace_id,
            // 🌟 Use unwrap_or_else to prevent allocating the "(Copy)" string if a new_name IS provided
            name: new_name.unwrap_or_else(|| format!("{} (Copy)", original.name)),
            options: original.options,
            created_at: now.clone(),
            updated_at: now,
        };

        self.create(cloned_record.clone()).await?;

        Ok(cloned_record)
    }

    #[instrument(skip(self))]
    async fn get_by_id(&self, id: &str) -> AxonResult<Option<BundleRecord>> {
        let record = sqlx::query!(
            r#"
            SELECT 
                id as "id!", 
                workspace_id as "workspace_id!", 
                name as "name!", 
                options as "options!: Json<BundleOptions>", 
                created_at as "created_at!", 
                updated_at as "updated_at!" 
            FROM bundles WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(record.map(|r| BundleRecord {
            id: r.id,
            workspace_id: r.workspace_id,
            name: r.name,
            options: r.options.0, 
            created_at: r.created_at,
            updated_at: r.updated_at,
        }))
    }

    #[instrument(skip(self))]
    async fn get_by_workspace_id(&self, workspace_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<BundleRecord>> {
        let records = sqlx::query!(
            r#"
            SELECT 
                id as "id!", 
                workspace_id as "workspace_id!", 
                name as "name!", 
                options as "options!: Json<BundleOptions>", 
                created_at as "created_at!", 
                updated_at as "updated_at!" 
            FROM bundles 
            WHERE workspace_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            workspace_id, limit, offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(records.into_iter().map(|r| BundleRecord {
            id: r.id,
            workspace_id: r.workspace_id,
            name: r.name,
            options: r.options.0,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }).collect())
    }

    #[instrument(skip(self, updates))]
    async fn update(&self, id: &str, updates: UpdateBundlePayload) -> AxonResult<()> {
        let now = Utc::now().to_rfc3339();
        let options_json = updates.options.map(Json);

        sqlx::query!(
            r#"
            UPDATE bundles 
            SET 
                name = COALESCE($1, name),
                options = COALESCE($2, options),
                updated_at = $3
            WHERE id = $4
            "#,
            updates.name,
            options_json as _, 
            now,
            id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    #[instrument(skip(self))]
    async fn delete(&self, id: &str) -> AxonResult<bool> {
        let result = sqlx::query!("DELETE FROM bundles WHERE id = $1", id)
            .execute(&self.pool)
            .await?;
            
        Ok(result.rows_affected() > 0)
    }

    #[instrument(skip(self))]
    async fn delete_by_workspace_id(&self, workspace_id: &str) -> AxonResult<u64> {
        let result = sqlx::query!("DELETE FROM bundles WHERE workspace_id = $1", workspace_id)
            .execute(&self.pool)
            .await?;
            
        Ok(result.rows_affected())
    }
}