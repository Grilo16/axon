<div align="center">
  <h1>🧠 Axon Client</h1>
  <p><strong>A Visual, AST-Aware LLM Context Bundler for Massive Codebases</strong></p>

  [![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tauri](https://img.shields.io/badge/Tauri-2.0-orange?style=flat-square&logo=tauri)](https://tauri.app/)
  [![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
  [![React Flow](https://img.shields.io/badge/React_Flow-11.x-FF0072?style=flat-square)](#)
</div>

<br />

## ⚡ The Problem
Feeding an entire repository to an LLM fills the context window with noise, degrading the quality of the AI's reasoning. Manually copy-pasting specific functions and stripping out heavy, irrelevant implementations is tedious and breaks developer flow.

## 🎯 The Solution
**Axon** is a desktop IDE designed specifically for AI-assisted development. It parses your project's Abstract Syntax Tree (AST) via a Rust backend and visualizes the dependency graph in React. 

Developers can visually select files, surgically redact specific functions (e.g., hiding a 500-line implementation while keeping the function signature), and instantly generate a perfectly formatted, token-optimized Markdown context bundle to paste into Claude, ChatGPT, or Cursor.

---

## ✨ Key Features

- **AST-Aware Visual Graph Engine**: Powered by `React Flow` and `ELK.js`, capable of rendering and auto-layouting 700+ node dependency graphs without dropping frames.
- **Surgical Context Redaction**: Hover over any exported symbol (Class, Function, Interface) in the graph and apply Redux-managed rules to *Hide Implementation* or *Remove Entirely* before sending to the LLM.
- **Multi-Context Workspaces**: Create multiple isolated "Bundles" within a single project. Switching bundles instantly swaps the active graph canvas and redaction rules.
- **Fuzzy Search Explorer**: Instantly search thousands of files and add them directly to the visual context.
- **VS Code-Grade Layout**: Built with `react-resizable-panels` for fluid, drag-to-resize split panes, complete with an integrated Monaco Code Viewer (`@monaco-editor/react`).
- **One-Click Generation**: Compiles the selected graph and redaction rules, requests the trimmed strings from the Rust AST engine, and pipes a ready-to-use Markdown file directly to your clipboard.

---

## 🏗️ Architecture & Tech Stack

The frontend is architected using a strict, scalable **Feature-Sliced Design (FSD)** approach, ensuring deep separation of concerns.

### Core Technologies
* **Framework**: React (Vite) + Strict TypeScript
* **State Management**: Redux Toolkit (RTK) + RTK Query
    * *Normalized State*: Utilizes `createEntityAdapter` for O(1) lookups. The `workspace-slice` and `bundles-slice` are strictly decoupled to prevent "God-Slice" anti-patterns.
    * *RTK Query*: Wraps Tauri `invoke` commands, providing automatic caching, loading states, and cache invalidation across the app.
* **Graph Engine**: `@xyflow/react` (React Flow)
* **Layout Algorithm**: `elkjs` (Eclipse Layout Kernel) for advanced, collision-free directed graph routing.
* **Styling**: `styled-components` with a fully typed, customizable dark-mode theme.
* **Desktop Bridge**: Tauri IPC (Inter-Process Communication).

### Directory Structure
```text
src/
├── app/               # Global setup (Store, Routing, RTKQ Base Queries)
├── shared/            # Dumb UI components, types, pure utility functions
├── features/          # Domain-specific modules
│   ├── axon-graph/    # React Flow canvas, ELK layout engine, File Nodes
│   ├── bundles/       # Context bundling logic, Redaction UI, AST Rule state
│   ├── code-viewer/   # Monaco editor integration
│   ├── core/          # Global Workspace Managers, Theming, Redux Slices
│   ├── explorer/      # File system tree, fuzzy search
│   └── sidebar/       # Global navigation and Library Hub
└── pages/             # Route-level composition (WorkspacePage)
```

---

## 🚀 Getting Started

To run the Axon Client locally, you will need Node.js and the Rust toolchain installed (for the Tauri backend).

### Prerequisites
* Node.js (v18+)
* Rust / Cargo
* Tauri CLI prerequisites (depends on your OS)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/axon.git](https://github.com/yourusername/axon.git)
   cd axon/apps/client-axon
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Run the Tauri Development App**
   ```bash
   npm run tauri dev
   ```
   *This will compile the Rust backend and launch the React frontend in a native desktop window.*

---

## 🧠 State Management Highlight: The Bundler API

Axon avoids traditional prop-drilling by utilizing highly memoized RTK selectors and custom session hooks. The UI components are completely decoupled from the Rust IPC payload structure. 

When a user clicks "Hide Implementation" on a graph node, the UI simply calls:
```typescript
addRedaction({
  target: { specificSymbol: { file_path: data.path, symbol_id: sym.id } },
  action: "hideImplementation"
});
```
The `bundles-slice` intercepts this, updates the normalized dictionary, immediately triggers a re-render of the specific node to show a visual strike-through, and queues the rule for the final Rust compilation phase.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <i>Designed and engineered with passion for the AI-assisted future.</i>
</div>