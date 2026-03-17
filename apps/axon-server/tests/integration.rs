use std::sync::Arc;
use tokio::sync::Mutex;

use axum::{routing::{get, post}, Router};
use axum::http::{Request, StatusCode};
use tower::ServiceExt;
use http_body_util::BodyExt;

use async_trait::async_trait;
use axon_core::{
    domain::{
        bundle::{BundleOptions, BundleRecord, BundleRepository, UpdateBundlePayload},
        workspace::{UpdateWorkspacePayload, WorkspaceRecord, WorkspaceRepository},
    },
    error::{AxonError, AxonResult},
    spool::AxonSpool,
};
use axon_server::{
    api::public::{list_public_workspaces, validate_public_options},
    state::AppState,
};

// ==========================================
// IN-MEMORY MOCK REPOSITORIES
// ==========================================

#[derive(Clone, Default)]
struct MockWorkspaceRepo {
    records: Arc<Mutex<Vec<WorkspaceRecord>>>,
}

#[async_trait]
impl WorkspaceRepository for MockWorkspaceRepo {
    async fn create(&self, workspace: WorkspaceRecord) -> AxonResult<()> {
        self.records.lock().await.push(workspace);
        Ok(())
    }

    async fn get_by_id_and_owner(&self, id: &str, owner_id: &str) -> AxonResult<Option<WorkspaceRecord>> {
        let records = self.records.lock().await;
        Ok(records.iter().find(|r| r.id == id && r.owner_id == owner_id).cloned())
    }

    async fn list_for_user(&self, owner_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<WorkspaceRecord>> {
        let records = self.records.lock().await;
        let result: Vec<_> = records
            .iter()
            .filter(|r| r.owner_id == owner_id)
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect();
        Ok(result)
    }

    async fn update(&self, id: &str, owner_id: &str, payload: UpdateWorkspacePayload) -> AxonResult<()> {
        let mut records = self.records.lock().await;
        let record = records
            .iter_mut()
            .find(|r| r.id == id && r.owner_id == owner_id)
            .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id: id.to_string() })?;
        if let Some(name) = payload.name { record.name = name; }
        if let Some(root) = payload.project_root { record.project_root = root; }
        if let Some(lo) = payload.last_opened { record.last_opened = lo; }
        Ok(())
    }

    async fn touch(&self, id: &str, owner_id: &str) -> AxonResult<()> {
        let mut records = self.records.lock().await;
        let record = records
            .iter_mut()
            .find(|r| r.id == id && r.owner_id == owner_id)
            .ok_or_else(|| AxonError::NotFound { entity: "Workspace", id: id.to_string() })?;
        record.last_opened = "touched".to_string();
        Ok(())
    }

    async fn delete(&self, id: &str, owner_id: &str) -> AxonResult<bool> {
        let mut records = self.records.lock().await;
        let before = records.len();
        records.retain(|r| !(r.id == id && r.owner_id == owner_id));
        Ok(records.len() < before)
    }
}

#[derive(Clone, Default)]
struct MockBundleRepo {
    records: Arc<Mutex<Vec<BundleRecord>>>,
}

#[async_trait]
impl BundleRepository for MockBundleRepo {
    async fn create(&self, bundle: BundleRecord) -> AxonResult<()> {
        self.records.lock().await.push(bundle);
        Ok(())
    }

    async fn duplicate(&self, bundle_id: &str, new_id: &str, new_name: Option<String>) -> AxonResult<BundleRecord> {
        let records = self.records.lock().await;
        let original = records
            .iter()
            .find(|r| r.id == bundle_id)
            .ok_or_else(|| AxonError::NotFound { entity: "Bundle", id: bundle_id.to_string() })?;
        let mut cloned = original.clone();
        cloned.id = new_id.to_string();
        cloned.name = new_name.unwrap_or_else(|| format!("{} (Copy)", original.name));
        drop(records);
        self.records.lock().await.push(cloned.clone());
        Ok(cloned)
    }

    async fn get_by_id(&self, id: &str) -> AxonResult<Option<BundleRecord>> {
        let records = self.records.lock().await;
        Ok(records.iter().find(|r| r.id == id).cloned())
    }

    async fn get_by_workspace_id(&self, workspace_id: &str, limit: i64, offset: i64) -> AxonResult<Vec<BundleRecord>> {
        let records = self.records.lock().await;
        let result: Vec<_> = records
            .iter()
            .filter(|r| r.workspace_id == workspace_id)
            .skip(offset as usize)
            .take(limit as usize)
            .cloned()
            .collect();
        Ok(result)
    }

    async fn update(&self, id: &str, updates: UpdateBundlePayload) -> AxonResult<()> {
        let mut records = self.records.lock().await;
        let record = records
            .iter_mut()
            .find(|r| r.id == id)
            .ok_or_else(|| AxonError::NotFound { entity: "Bundle", id: id.to_string() })?;
        if let Some(name) = updates.name { record.name = name; }
        if let Some(options) = updates.options { record.options = options; }
        Ok(())
    }

    async fn delete(&self, id: &str) -> AxonResult<bool> {
        let mut records = self.records.lock().await;
        let before = records.len();
        records.retain(|r| r.id != id);
        Ok(records.len() < before)
    }

    async fn delete_by_workspace_id(&self, workspace_id: &str) -> AxonResult<u64> {
        let mut records = self.records.lock().await;
        let before = records.len();
        records.retain(|r| r.workspace_id != workspace_id);
        Ok((before - records.len()) as u64)
    }
}

// ==========================================
// TEST HELPERS
// ==========================================

/// Creates an AppState backed by mock repos and a temp spool.
fn test_state(ws_repo: MockWorkspaceRepo, bundle_repo: MockBundleRepo) -> (AppState, tempfile::TempDir) {
    let tmp = tempfile::tempdir().expect("failed to create temp dir");
    let spool = AxonSpool::new(tmp.path().join("spool.redb")).expect("failed to create spool");

    let state = AppState::new(
        Arc::new(ws_repo),
        Arc::new(bundle_repo),
        Arc::new(spool),
        None,
    );
    (state, tmp)
}

/// Builds a test router with the public routes and health endpoint.
/// These routes do NOT require Keycloak authentication.
fn public_test_router(state: AppState) -> Router {
    let public_router = Router::new()
        .route("/workspaces", get(list_public_workspaces))
        .route("/bundles/validate", post(validate_public_options));

    Router::new()
        .nest("/api/v1/public", public_router)
        .route("/health", get(|| async { StatusCode::OK }))
        .with_state(state)
}

/// Extracts the response body as a JSON value.
async fn json_body(response: axum::http::Response<axum::body::Body>) -> serde_json::Value {
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap()
}

// ==========================================
// HEALTH ENDPOINT
// ==========================================

#[tokio::test]
async fn health_returns_200() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let response = app
        .oneshot(Request::builder().uri("/health").body(axum::body::Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

// ==========================================
// PUBLIC WORKSPACES
// ==========================================

#[tokio::test]
async fn list_public_workspaces_returns_system_owned_records() {
    let ws_repo = MockWorkspaceRepo::default();
    // Public workspaces are owned by "system"
    ws_repo.create(WorkspaceRecord {
        id: "pub-1".into(),
        owner_id: "system".into(),
        name: "Public Project".into(),
        project_root: "/tmp/pub".into(),
        last_opened: "2026-01-01T00:00:00Z".into(),
        created_at: "2026-01-01T00:00:00Z".into(),
        updated_at: "2026-01-01T00:00:00Z".into(),
    }).await.unwrap();

    // This one is user-owned — should NOT appear in public listing
    ws_repo.create(WorkspaceRecord {
        id: "priv-1".into(),
        owner_id: "alice".into(),
        name: "Private Project".into(),
        project_root: "/tmp/priv".into(),
        last_opened: "2026-01-01T00:00:00Z".into(),
        created_at: "2026-01-01T00:00:00Z".into(),
        updated_at: "2026-01-01T00:00:00Z".into(),
    }).await.unwrap();

    let (state, _tmp) = test_state(ws_repo, MockBundleRepo::default());
    let app = public_test_router(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/public/workspaces")
                .body(axum::body::Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = json_body(response).await;
    let workspaces = body.as_array().expect("response should be an array");
    assert_eq!(workspaces.len(), 1, "Only system-owned workspaces should appear");
    assert_eq!(workspaces[0]["name"], "Public Project");
}

#[tokio::test]
async fn list_public_workspaces_returns_empty_when_none_exist() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/public/workspaces")
                .body(axum::body::Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = json_body(response).await;
    let workspaces = body.as_array().expect("response should be an array");
    assert!(workspaces.is_empty());
}

// ==========================================
// BUNDLE VALIDATION (PUBLIC)
// ==========================================

#[tokio::test]
async fn validate_options_accepts_valid_payload() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let payload = serde_json::json!({
        "rules": [],
        "targetFiles": ["app.ts"],
        "hideBarrelExports": false
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/v1/public/bundles/validate")
                .header("content-type", "application/json")
                .body(axum::body::Body::from(serde_json::to_vec(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn validate_options_rejects_duplicate_rules() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let payload = serde_json::json!({
        "rules": [
            { "target": { "entireFile": "secret.ts" }, "action": "removeEntirely" },
            { "target": { "entireFile": "secret.ts" }, "action": "removeEntirely" }
        ],
        "targetFiles": [],
        "hideBarrelExports": false
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/v1/public/bundles/validate")
                .header("content-type", "application/json")
                .body(axum::body::Body::from(serde_json::to_vec(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    // Duplicate rules trigger AxonError::Parse → 400
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn validate_options_rejects_malformed_json() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/v1/public/bundles/validate")
                .header("content-type", "application/json")
                .body(axum::body::Body::from("{not valid json}"))
                .unwrap(),
        )
        .await
        .unwrap();

    // Axum returns 400 for JSON deserialization failures
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn validate_options_accepts_complex_valid_payload() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let payload = serde_json::json!({
        "rules": [
            { "target": { "entireFile": "a.ts" }, "action": "removeEntirely" },
            { "target": { "entireFile": "b.ts" }, "action": "removeEntirely" }
        ],
        "targetFiles": ["main.ts", "app.ts", "index.ts"],
        "hideBarrelExports": true
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/v1/public/bundles/validate")
                .header("content-type", "application/json")
                .body(axum::body::Body::from(serde_json::to_vec(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

// ==========================================
// 404 ON UNKNOWN ROUTES
// ==========================================

#[tokio::test]
async fn unknown_route_returns_404() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/public/does-not-exist")
                .body(axum::body::Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn wrong_method_returns_405() {
    let (state, _tmp) = test_state(MockWorkspaceRepo::default(), MockBundleRepo::default());
    let app = public_test_router(state);

    // GET on a POST-only route
    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/v1/public/bundles/validate")
                .body(axum::body::Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

// ==========================================
// MOCK REPOSITORY BEHAVIOR
// ==========================================

#[tokio::test]
async fn mock_workspace_repo_crud_lifecycle() {
    let repo = MockWorkspaceRepo::default();

    // Create
    repo.create(WorkspaceRecord {
        id: "w1".into(),
        owner_id: "alice".into(),
        name: "Test".into(),
        project_root: "/tmp".into(),
        last_opened: "now".into(),
        created_at: "now".into(),
        updated_at: "now".into(),
    }).await.unwrap();

    // Read
    let found = repo.get_by_id_and_owner("w1", "alice").await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().name, "Test");

    // Ownership isolation
    let not_found = repo.get_by_id_and_owner("w1", "bob").await.unwrap();
    assert!(not_found.is_none());

    // Update
    repo.update("w1", "alice", UpdateWorkspacePayload {
        name: Some("Updated".into()),
        project_root: None,
        last_opened: None,
    }).await.unwrap();
    let updated = repo.get_by_id_and_owner("w1", "alice").await.unwrap().unwrap();
    assert_eq!(updated.name, "Updated");

    // List
    let list = repo.list_for_user("alice", 50, 0).await.unwrap();
    assert_eq!(list.len(), 1);

    // Delete
    let deleted = repo.delete("w1", "alice").await.unwrap();
    assert!(deleted);
    let gone = repo.get_by_id_and_owner("w1", "alice").await.unwrap();
    assert!(gone.is_none());
}

#[tokio::test]
async fn mock_bundle_repo_duplicate_preserves_workspace() {
    let repo = MockBundleRepo::default();

    repo.create(BundleRecord {
        id: "b1".into(),
        workspace_id: "w1".into(),
        name: "Original".into(),
        options: BundleOptions::default(),
        created_at: "now".into(),
        updated_at: "now".into(),
    }).await.unwrap();

    let cloned = repo.duplicate("b1", "b2", None).await.unwrap();
    assert_eq!(cloned.id, "b2");
    assert_eq!(cloned.workspace_id, "w1");
    assert_eq!(cloned.name, "Original (Copy)");

    // Both exist
    assert!(repo.get_by_id("b1").await.unwrap().is_some());
    assert!(repo.get_by_id("b2").await.unwrap().is_some());
}

#[tokio::test]
async fn mock_bundle_repo_delete_by_workspace() {
    let repo = MockBundleRepo::default();

    for i in 0..3 {
        repo.create(BundleRecord {
            id: format!("b{i}"),
            workspace_id: "w1".into(),
            name: format!("Bundle {i}"),
            options: BundleOptions::default(),
            created_at: "now".into(),
            updated_at: "now".into(),
        }).await.unwrap();
    }

    let count = repo.delete_by_workspace_id("w1").await.unwrap();
    assert_eq!(count, 3);

    let remaining = repo.get_by_workspace_id("w1", 50, 0).await.unwrap();
    assert!(remaining.is_empty());
}
