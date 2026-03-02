#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run SQL commands as the superuser to create our domain databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE axon_db;
    CREATE DATABASE keycloak_db;
    GRANT ALL PRIVILEGES ON DATABASE axon_db TO admin;
    GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO admin;
EOSQL

echo "✅ Databases axon_db and keycloak_db created successfully!"