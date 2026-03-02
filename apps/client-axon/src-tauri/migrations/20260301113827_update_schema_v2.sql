-- Rename the column
ALTER TABLE workspaces RENAME COLUMN root_url TO project_root;

-- Add timestamps to workspaces
ALTER TABLE workspaces ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE workspaces ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';

-- Add timestamps to bundles
ALTER TABLE bundles ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE bundles ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';