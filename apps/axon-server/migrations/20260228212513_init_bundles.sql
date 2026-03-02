-- FILE: apps/axon-server/migrations/<timestamp>_init_bundles.sql

CREATE TABLE bundles (
    id VARCHAR(255) PRIMARY KEY,
    workspace_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    options JSONB NOT NULL,
    
    -- Foreign Key Constraint!
    CONSTRAINT fk_workspace
        FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id)
        ON DELETE CASCADE
);

-- Optional: Add an index on workspace_id since we will query by it constantly
CREATE INDEX idx_bundles_workspace_id ON bundles(workspace_id);