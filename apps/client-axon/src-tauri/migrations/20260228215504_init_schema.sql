CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    root_url TEXT NOT NULL,
    last_opened TEXT NOT NULL
);

CREATE TABLE bundles (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    name TEXT NOT NULL,
    options TEXT NOT NULL,
    CONSTRAINT fk_workspace 
        FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_bundles_workspace_id ON bundles(workspace_id);