use async_trait::async_trait;
use sqlx::{SqlitePool, Row, types::Json};
use axon_core::{
    domain::bundle::{BundleRecord, BundleRepository, UpdateBundlePayload},
    error::{AxonError, AxonResult},
    bundler::rules::BundleOptions,
};
use chrono::Utc;

pub struct SqliteBundleRepo {
    pool: SqlitePool,
}

impl SqliteBundleRepo {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl BundleRepository for SqliteBundleRepo {
    async fn create(&self, bundle: BundleRecord) -> AxonResult<()> {
        let bundle_options = Json(&bundle.options);
        sqlx::query(
            r#"
            INSERT INTO bundles (id, workspace_id, name, options, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&bundle.id)
        .bind(&bundle.workspace_id)
        .bind(&bundle.name)
        .bind(bundle_options)
        .bind(&bundle.created_at)
        .bind(&bundle.updated_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Save Error: {}", e)))?;
        Ok(())
    }

    async fn duplicate(&self, bundle_id: &str, new_id: &str, new_name: Option<String>) -> AxonResult<BundleRecord> {
        let original = self.get_by_id(bundle_id).await?
            .ok_or_else(|| AxonError::NotFound {
                entity: "Bundle",
                id: bundle_id.to_string(),
            })?;

        let now = Utc::now().to_rfc3339();
        
        let cloned_record = BundleRecord {
            id: new_id.to_string(),
            workspace_id: original.workspace_id,
            name: new_name.unwrap_or(format!("{} (Copy)", original.name)),
            options: original.options,
            created_at: now.clone(),
            updated_at: now,
        };

        self.create(cloned_record.clone()).await?;
        Ok(cloned_record)
    }

    async fn get_by_id(&self, id: &str) -> AxonResult<Option<BundleRecord>> {
        // Without macros, we fetch a generic row and map it manually
        let row = sqlx::query(
            "SELECT id, workspace_id, name, options, created_at, updated_at FROM bundles WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Fetch Error: {}", e)))?;

        if let Some(r) = row {
            let options: Json<BundleOptions> = r.try_get("options")
                .map_err(|e| AxonError::Backend(format!("JSON Parse Error: {}", e)))?;
                
            Ok(Some(BundleRecord {
                id: r.get("id"),
                workspace_id: r.get("workspace_id"),
                name: r.get("name"),
                options: options.0,
                created_at: r.get("created_at"),
                updated_at: r.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn get_by_workspace_id(&self, workspace_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<BundleRecord>> {
        let rows = sqlx::query(
            r#"
            SELECT id, workspace_id, name, options, created_at, updated_at 
            FROM bundles 
            WHERE workspace_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            "#
        )
        .bind(workspace_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Fetch Error: {}", e)))?;

        let mut results = Vec::new();
        for r in rows {
            let options: Json<BundleOptions> = r.try_get("options")
                .map_err(|e| AxonError::Backend(format!("JSON Parse Error: {}", e)))?;
                
            results.push(BundleRecord {
                id: r.get("id"),
                workspace_id: r.get("workspace_id"),
                name: r.get("name"),
                options: options.0,
                created_at: r.get("created_at"),
                updated_at: r.get("updated_at"),
            });
        }
        Ok(results)
    }

    async fn update(&self, id: &str, updates: UpdateBundlePayload) -> AxonResult<()> {
        let now = Utc::now().to_rfc3339();
        let options_json = updates.options.map(|opts| Json(opts));

        sqlx::query(
            r#"
            UPDATE bundles 
            SET 
                name = COALESCE(?, name),
                options = COALESCE(?, options),
                updated_at = ?
            WHERE id = ?
            "#
        )
        .bind(updates.name)
        .bind(options_json)
        .bind(now)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AxonError::Backend(format!("DB Update Error: {}", e)))?;

        Ok(())
    }

    async fn delete(&self, id: &str) -> AxonResult<bool> {
        let result = sqlx::query("DELETE FROM bundles WHERE id = ?").bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AxonError::Backend(format!("DB Delete Error: {}", e)))?;
            
        Ok(result.rows_affected() > 0)
    }

    async fn delete_by_workspace_id(&self, workspace_id: &str) -> AxonResult<u64> {
        let result = sqlx::query("DELETE FROM bundles WHERE workspace_id = ?").bind(workspace_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AxonError::Backend(format!("DB Delete Error: {}", e)))?;
            
        Ok(result.rows_affected())
    }
}