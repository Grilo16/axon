pub mod workspace_repo;
pub mod bundle_repo;

#[cfg(test)]
mod tests {
    use sqlx::SqlitePool;
    use axon_core::{
        domain::{
            bundle::{BundleOptions, BundleRecord, BundleRepository, UpdateBundlePayload},
            workspace::{UpdateWorkspacePayload, WorkspaceRecord, WorkspaceRepository},
        },
        error::AxonError,
    };
    use super::workspace_repo::SqliteWorkspaceRepo;
    use super::bundle_repo::SqliteBundleRepo;

    /// Creates an in-memory SQLite pool and runs migrations.
    async fn test_pool() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE workspaces (
                id TEXT PRIMARY KEY,
                owner_id VARCHAR(255) NOT NULL DEFAULT 'unassigned',
                name TEXT NOT NULL,
                project_root TEXT NOT NULL,
                last_opened TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL DEFAULT ''
            )"
        ).execute(&pool).await.unwrap();

        sqlx::query(
            "CREATE TABLE bundles (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                name TEXT NOT NULL,
                options TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL DEFAULT '',
                CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
            )"
        ).execute(&pool).await.unwrap();

        // Enable foreign keys (off by default in SQLite)
        sqlx::query("PRAGMA foreign_keys = ON").execute(&pool).await.unwrap();

        pool
    }

    fn make_workspace(id: &str, owner: &str, name: &str) -> WorkspaceRecord {
        WorkspaceRecord {
            id: id.to_string(),
            owner_id: owner.to_string(),
            name: name.to_string(),
            project_root: "/tmp/test".to_string(),
            last_opened: "2026-01-01T00:00:00Z".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        }
    }

    fn make_bundle(id: &str, workspace_id: &str, name: &str) -> BundleRecord {
        BundleRecord {
            id: id.to_string(),
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            options: BundleOptions::default(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        }
    }

    // ==========================================
    // WORKSPACE REPOSITORY TESTS
    // ==========================================

    #[tokio::test]
    async fn workspace_create_and_get() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        let ws = make_workspace("w1", "alice", "My Project");
        repo.create(ws).await.unwrap();

        let fetched = repo.get_by_id_and_owner("w1", "alice").await.unwrap();
        assert!(fetched.is_some());

        let record = fetched.unwrap();
        assert_eq!(record.id, "w1");
        assert_eq!(record.name, "My Project");
        assert_eq!(record.owner_id, "alice");
    }

    #[tokio::test]
    async fn workspace_get_wrong_owner_returns_none() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        repo.create(make_workspace("w1", "alice", "Project")).await.unwrap();

        // Bob cannot see Alice's workspace
        let result = repo.get_by_id_and_owner("w1", "bob").await.unwrap();
        assert!(result.is_none(), "Ownership isolation violated: bob saw alice's workspace");
    }

    #[tokio::test]
    async fn workspace_get_nonexistent_returns_none() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        let result = repo.get_by_id_and_owner("nope", "alice").await.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn workspace_list_for_user_respects_ownership() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        repo.create(make_workspace("w1", "alice", "Alice's 1")).await.unwrap();
        repo.create(make_workspace("w2", "alice", "Alice's 2")).await.unwrap();
        repo.create(make_workspace("w3", "bob", "Bob's 1")).await.unwrap();

        let alice_list = repo.list_for_user("alice", 50, 0).await.unwrap();
        assert_eq!(alice_list.len(), 2, "Alice should see exactly 2 workspaces");

        let bob_list = repo.list_for_user("bob", 50, 0).await.unwrap();
        assert_eq!(bob_list.len(), 1, "Bob should see exactly 1 workspace");

        let nobody_list = repo.list_for_user("charlie", 50, 0).await.unwrap();
        assert_eq!(nobody_list.len(), 0, "Charlie should see no workspaces");
    }

    #[tokio::test]
    async fn workspace_list_respects_limit_and_offset() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        for i in 0..5 {
            repo.create(make_workspace(&format!("w{i}"), "user", &format!("WS {i}"))).await.unwrap();
        }

        let page1 = repo.list_for_user("user", 2, 0).await.unwrap();
        assert_eq!(page1.len(), 2);

        let page2 = repo.list_for_user("user", 2, 2).await.unwrap();
        assert_eq!(page2.len(), 2);

        let page3 = repo.list_for_user("user", 2, 4).await.unwrap();
        assert_eq!(page3.len(), 1);
    }

    #[tokio::test]
    async fn workspace_update_changes_name() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        repo.create(make_workspace("w1", "alice", "Old Name")).await.unwrap();

        repo.update("w1", "alice", UpdateWorkspacePayload {
            name: Some("New Name".to_string()),
            project_root: None,
            last_opened: None,
        }).await.unwrap();

        let updated = repo.get_by_id_and_owner("w1", "alice").await.unwrap().unwrap();
        assert_eq!(updated.name, "New Name");
    }

    #[tokio::test]
    async fn workspace_update_nonexistent_returns_not_found() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        let result = repo.update("nope", "alice", UpdateWorkspacePayload {
            name: Some("x".into()),
            project_root: None,
            last_opened: None,
        }).await;

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.is_not_found(), "Expected NotFound, got: {:?}", err);
    }

    #[tokio::test]
    async fn workspace_touch_updates_last_opened() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        repo.create(make_workspace("w1", "alice", "Project")).await.unwrap();

        let before = repo.get_by_id_and_owner("w1", "alice").await.unwrap().unwrap();
        repo.touch("w1", "alice").await.unwrap();
        let after = repo.get_by_id_and_owner("w1", "alice").await.unwrap().unwrap();

        assert_ne!(before.last_opened, after.last_opened, "touch should update last_opened");
    }

    #[tokio::test]
    async fn workspace_delete_removes_record() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        repo.create(make_workspace("w1", "alice", "Project")).await.unwrap();
        let deleted = repo.delete("w1", "alice").await.unwrap();
        assert!(deleted, "delete should return true for existing record");

        let after = repo.get_by_id_and_owner("w1", "alice").await.unwrap();
        assert!(after.is_none(), "workspace should be gone after delete");
    }

    #[tokio::test]
    async fn workspace_delete_wrong_owner_does_nothing() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        repo.create(make_workspace("w1", "alice", "Project")).await.unwrap();
        let deleted = repo.delete("w1", "bob").await.unwrap();
        assert!(!deleted, "bob should not be able to delete alice's workspace");

        // Verify it still exists
        let still_there = repo.get_by_id_and_owner("w1", "alice").await.unwrap();
        assert!(still_there.is_some());
    }

    #[tokio::test]
    async fn workspace_delete_nonexistent_returns_false() {
        let pool = test_pool().await;
        let repo = SqliteWorkspaceRepo::new(pool);

        let deleted = repo.delete("nope", "alice").await.unwrap();
        assert!(!deleted);
    }

    // ==========================================
    // BUNDLE REPOSITORY TESTS
    // ==========================================

    #[tokio::test]
    async fn bundle_create_and_get() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();
        repo.create(make_bundle("b1", "w1", "My Bundle")).await.unwrap();

        let fetched = repo.get_by_id("b1").await.unwrap();
        assert!(fetched.is_some());
        assert_eq!(fetched.unwrap().name, "My Bundle");
    }

    #[tokio::test]
    async fn bundle_get_nonexistent_returns_none() {
        let pool = test_pool().await;
        let repo = SqliteBundleRepo::new(pool);

        let result = repo.get_by_id("nope").await.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn bundle_list_by_workspace() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS1")).await.unwrap();
        ws_repo.create(make_workspace("w2", "user", "WS2")).await.unwrap();

        repo.create(make_bundle("b1", "w1", "Bundle A")).await.unwrap();
        repo.create(make_bundle("b2", "w1", "Bundle B")).await.unwrap();
        repo.create(make_bundle("b3", "w2", "Bundle C")).await.unwrap();

        let w1_bundles = repo.get_by_workspace_id("w1", 50, 0).await.unwrap();
        assert_eq!(w1_bundles.len(), 2);

        let w2_bundles = repo.get_by_workspace_id("w2", 50, 0).await.unwrap();
        assert_eq!(w2_bundles.len(), 1);
    }

    #[tokio::test]
    async fn bundle_update_changes_name() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();
        repo.create(make_bundle("b1", "w1", "Old Name")).await.unwrap();

        repo.update("b1", UpdateBundlePayload {
            name: Some("New Name".into()),
            options: None,
        }).await.unwrap();

        let updated = repo.get_by_id("b1").await.unwrap().unwrap();
        assert_eq!(updated.name, "New Name");
    }

    #[tokio::test]
    async fn bundle_duplicate_creates_copy() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();
        repo.create(make_bundle("b1", "w1", "Original")).await.unwrap();

        let cloned = repo.duplicate("b1", "b2", None).await.unwrap();
        assert_eq!(cloned.id, "b2");
        assert_eq!(cloned.name, "Original (Copy)");
        assert_eq!(cloned.workspace_id, "w1");

        // Both should exist
        assert!(repo.get_by_id("b1").await.unwrap().is_some());
        assert!(repo.get_by_id("b2").await.unwrap().is_some());
    }

    #[tokio::test]
    async fn bundle_duplicate_with_custom_name() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();
        repo.create(make_bundle("b1", "w1", "Original")).await.unwrap();

        let cloned = repo.duplicate("b1", "b2", Some("Custom Name".into())).await.unwrap();
        assert_eq!(cloned.name, "Custom Name");
    }

    #[tokio::test]
    async fn bundle_duplicate_nonexistent_returns_not_found() {
        let pool = test_pool().await;
        let repo = SqliteBundleRepo::new(pool);

        let result = repo.duplicate("nope", "b2", None).await;
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(matches!(err, AxonError::NotFound { entity: "Bundle", .. }));
    }

    #[tokio::test]
    async fn bundle_delete_removes_record() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();
        repo.create(make_bundle("b1", "w1", "Bundle")).await.unwrap();

        let deleted = repo.delete("b1").await.unwrap();
        assert!(deleted);
        assert!(repo.get_by_id("b1").await.unwrap().is_none());
    }

    #[tokio::test]
    async fn bundle_delete_nonexistent_returns_false() {
        let pool = test_pool().await;
        let repo = SqliteBundleRepo::new(pool);

        let deleted = repo.delete("nope").await.unwrap();
        assert!(!deleted);
    }

    #[tokio::test]
    async fn bundle_delete_by_workspace_removes_all() {
        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();
        repo.create(make_bundle("b1", "w1", "Bundle 1")).await.unwrap();
        repo.create(make_bundle("b2", "w1", "Bundle 2")).await.unwrap();
        repo.create(make_bundle("b3", "w1", "Bundle 3")).await.unwrap();

        let count = repo.delete_by_workspace_id("w1").await.unwrap();
        assert_eq!(count, 3);

        let remaining = repo.get_by_workspace_id("w1", 50, 0).await.unwrap();
        assert!(remaining.is_empty());
    }

    #[tokio::test]
    async fn bundle_options_roundtrip_through_json() {
        use axon_core::bundler::rules::{RedactionRule, RedactionType, TargetScope};

        let pool = test_pool().await;
        let ws_repo = SqliteWorkspaceRepo::new(pool.clone());
        let repo = SqliteBundleRepo::new(pool);

        ws_repo.create(make_workspace("w1", "user", "WS")).await.unwrap();

        let options = BundleOptions {
            rules: vec![RedactionRule {
                target: TargetScope::EntireFile("secret.ts".into()),
                action: RedactionType::RemoveEntirely,
            }],
            target_files: vec!["app.ts".into(), "main.ts".into()],
            hide_barrel_exports: true,
        };

        let bundle = BundleRecord {
            id: "b1".into(),
            workspace_id: "w1".into(),
            name: "Complex Bundle".into(),
            options: options.clone(),
            created_at: "2026-01-01T00:00:00Z".into(),
            updated_at: "2026-01-01T00:00:00Z".into(),
        };

        repo.create(bundle).await.unwrap();

        let fetched = repo.get_by_id("b1").await.unwrap().unwrap();
        assert_eq!(fetched.options.target_files, vec!["app.ts", "main.ts"]);
        assert_eq!(fetched.options.rules.len(), 1);
        assert!(fetched.options.hide_barrel_exports);
    }
}
