# 🧠 Axon | Code Architecture Intelligence
<div align="center">

[![Rust](https://img.shields.io/badge/Rust-Core-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-State-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Keycloak](https://img.shields.io/badge/Keycloak-Auth-cyan?style=flat-square&logo=keycloak&logoColor=black)](https://www.keycloak.org/)
[![Caddy](https://img.shields.io/badge/Caddy-Proxy-00ADD8?style=flat-square&logo=caddy&logoColor=white)](https://caddyserver.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/features/actions)

</div>

Axon is an ultra-fast, visually interactive code architecture intelligence tool designed to solve the "AI Context Crisis." By parsing your codebase into an Abstract Syntax Tree (AST) in memory, Axon allows developers to visualize dependencies, identify tech debt, and dynamically generate highly optimized, low-noise context bundles for Large Language Models (LLMs).

## ✨ Key Features
- ⚡ Nanosecond AST Parsing: Powered by a high-performance Rust core, Axon parses JavaScript codebases down to the symbol level in memory, providing instantaneous analysis without interrupting the developer workflow.

- 🕸️ Interactive Dependency Graph: A React-based visual node-graph that maps out your entire architecture. Instantly spot tight coupling, dangling files, and circular dependencies.

- 🤖 Smart AI Context Bundler: Stop pasting thousands of lines of noisy code into ChatGPT or Claude. Axon generates curated context bundles where you can:

  - Hide internal function implementations (showing only signatures).

  - Redact sensitive variables.

  - Strip out comments to maximize token efficiency and LLM signal-to-noise ratio.

- 🔐 Enterprise-Grade Security: Fully integrated Keycloak (OIDC) authentication with seamless cross-origin token exchanges via a Caddy reverse proxy.

## 🏗️ Architecture & Tech Stack
Axon is built as a highly decoupled monorepo, bridging a memory-safe, high-performance backend with a complex, state-driven frontend.

**Frontend (`apps/client-axon`)**
- **Core:** React 18, TypeScript, Vite.

- **State Management:** Redux Toolkit (with Persist), completely decoupled type architecture to prevent circular hydration loops.

- **Styling:** Styled-Components with a custom dark/light theme engine.

**Backend (`crates/axon_core` & `apps/axon-server`)**
- **Core:** Rust.

- **Parsing:** Custom AST generation holding symbol data entirely in RAM for zero-latency queries.

- **Database:** PostgreSQL with SQLx for compile-time query validation.

**Infrastructure & DevOps (`/infra`)**
- **Deployment:** Docker & Docker Compose.

- **Reverse Proxy:** Caddy (Automated SSL, strict CORS header management).

- **Identity Provider:** Keycloak 26 (OpenID Connect).

- **CI/CD:** GitHub Actions featuring path-based job execution and advanced Docker layer caching (type=gha), reducing build times by >60%.

## 🚀 Getting Started (Local Development)
**Prerequisites**
- Docker Desktop

- Rust toolchain (Cargo)

- Node.js (v20+)

**1. Spin up Infrastructure (Database & Auth)**
```Bash
#Navigate to the infra directory
cd infra

#Start PostgreSQL and Keycloak
docker compose -f docker-compose.yml up -d
```
**2. Start the Backend (Rust)**
```Bash
# From the project root
cd apps/axon-server

# Run the API server
cargo run
```
**3. Start the Frontend (React)**
```Bash
# From the project root
cd apps/client-axon

# Install dependencies and start the Vite dev server
npm install
npm run dev
```
## 🛣️ Roadmap
- [x] Initial JavaScript/TypeScript AST parsing.

- [x] Visual Node-Graph Implementation.

- [x] Context Bundler (Redaction & formatting).

- [ ] Add support for Python parsing.

- [ ] Add support for Rust parsing.

- [ ] Editor Plugin Integration (VSCode / JetBrains).

### 📄 License
 This project is licensed under the MIT License - see the `LICENSE` file for details.

