#!/bin/bash
set -e

# This script creates multiple databases for our different services
# It uses the default POSTGRES_USER to create the isolated DBs
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE keycloak_db;
    CREATE DATABASE axon_db;
    
    -- Optional: Create a specific user for the Axon Server
    CREATE USER axon_user WITH PASSWORD 'axon_pass';
    GRANT ALL PRIVILEGES ON DATABASE axon_db TO axon_user;
EOSQL