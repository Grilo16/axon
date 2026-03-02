CREATE TABLE workspaces (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    root_url VARCHAR(255) NOT NULL,
    last_opened VARCHAR(255) NOT NULL
);