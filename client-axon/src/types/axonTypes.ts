// --- 1. Graph Primitives (Matches React Flow + Rust) ---

import type { Node } from "@xyflow/react";

export interface Position {
  x: number;
  y: number;
}

/**
 * Data associated with a File Node.
 * Matches the Rust `NodeData` struct.
 */
export interface FileNodeData {
  label: string;
  path: string;
  definitions: string[];
  calls: string[];
  // Allow flexibility for extra fields React Flow might inject
  [key: string]: any; 
}

/**
 * Data associated with a Group Node.
 * This is mostly frontend-specific (Config Mode vs View Mode).
 */
export interface GroupNodeData {
  label: string;
  entryPoint: string | null;
  depth: number;
  [key: string]: any;
}

// --- 2. The Main Node Types ---

export type AxonNode = Node<FileNodeData | GroupNodeData, 'fileNode' | 'groupNode'>;

export interface AxonEdge {
  id: string;
  source: string;
  target: string;

  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  type?: string;

  markerEnd?: any;
  markerStart?: any;
  className?: string;
}

// --- 3. Command & API Types ---

/**
 * Matches the `PromptOptions` struct in Rust.
 * Used for generate_group_prompt and generate_combined_prompt.
 */
export interface PromptOptions {
  // Matches #[serde(rename_all = "camelCase")]
  showLineNumbers: boolean;
  removeComments: boolean;
  redactions: string[];
  
  // Rust expects strings: "none", "all", "keep_only", "strip_only"
  // We map our Redux 'Full'/'Signatures' to these strings before sending.
  skeletonMode: string; 
  skeletonTargets: string[];
}

/**
 * Request payload for scanning a single group
 */
export interface ScanParams {
  groupId: string;
  projectRoot: string;
  entryPoint: string;
  depth: number;
  flatten: boolean;
}

/**
 * Request payload for combining multiple groups
 */
export interface GroupRequest {
  entryPoint: string;
  depth: number;
  flatten: boolean;
}

/**
 * The raw response from the Rust `scan_workspace_group` command
 */
export interface ScanResponse {
  nodes: AxonNode[];
  edges: AxonEdge[];
}