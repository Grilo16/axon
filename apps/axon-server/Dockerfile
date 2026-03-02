# ==========================================
# Stage 1: Builder
# ==========================================
FROM rustlang/rust:nightly-bookworm AS builder

WORKDIR /usr/src/axon

# 1. Install system dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# 2. Copy ONLY the manifests first (The Dependency Layer)
# This allows Docker to cache your compiled dependencies.
# If you don't change your dependencies, this stage is skipped in future builds!
COPY Cargo.toml Cargo.lock ./
COPY crates/axon_core/Cargo.toml ./crates/axon_core/
COPY apps/axon-server/Cargo.toml ./apps/axon-server/
COPY apps/axon-server/.env ./apps/axon-server/


# Dummy build to cache dependencies (Optional but pro move)
# RUN mkdir -p crates/axon_core/src && echo "fn main() {}" > crates/axon_core/src/lib.rs
# RUN mkdir -p apps/axon-server/src && echo "fn main() {}" > apps/axon-server/src/main.rs
# RUN cargo build --release -p axon-server

# 3. Copy the actual Source Code
COPY crates/axon_core/src ./crates/axon_core/src
COPY apps/axon-server/src ./apps/axon-server/src
# If you have a migrations folder for the server, copy it too!
COPY apps/axon-server/migrations ./apps/axon-server/migrations 
COPY apps/client-axon/src-tauri/Cargo.toml ./apps/client-axon/src-tauri/
COPY .sqlx ./.sqlx

ENV SQLX_OFFLINE=true
RUN cargo build --release -p axon-server

# ==========================================
# Stage 2: Runtime (The "Tiny" Image)
# ==========================================
FROM debian:bookworm-slim

WORKDIR /app

# Install only what's needed to run
RUN apt-get update && apt-get install -y \
    ca-certificates \
    git \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /usr/src/axon/target/release/axon-server /app/axon-server

EXPOSE 8000

CMD ["./axon-server"]