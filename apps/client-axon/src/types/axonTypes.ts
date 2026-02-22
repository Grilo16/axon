import type { Node } from "@xyflow/react";
import type { CSSProperties } from "react";

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
  [key: string]: any;
}

/**
 * Data associated with a Folder Group Node.
 * Frontend-generated grouping based on each file's directory.
 */
export interface GroupNodeData {
  /** Display label (usually the folder path). */
  label: string;
  /** Folder path represented by this group (relative or absolute, depending on backend output). */
  folderPath: string;
  /** Optional count of file nodes inside the group. */
  fileCount?: number;
  [key: string]: any;
}

export type AxonNode = Node<FileNodeData | GroupNodeData, "fileNode" | "groupNode">;

export interface AxonEdge {
  id: string;
  source: string;
  target: string;

  /** React Flow handle ids (e.g. FileNode has `in` + `out`). */
  sourceHandle?: string;
  targetHandle?: string;

  label?: string;
  animated?: boolean;
  style?: CSSProperties;
  type?: string;

  /** Optional extra metadata for edge renderers. */
  data?: Record<string, any>;

  markerEnd?: any;
  markerStart?: any;
  className?: string;
}

/**
 * Matches the `PromptOptions` struct in Rust.
 * Used for generate_group_prompt and generate_combined_prompt.
 */
export interface PromptOptions {
  showLineNumbers: boolean;
  removeComments: boolean;
  redactions: string[];

  skeletonMode: string;
  skeletonTargets: string[];
}

/**
 * Request payload for scanning a workspace from a single entrypoint.
 */
export interface ScanParams {
  /** A stable id for the scan (we use workspace id on the frontend). */
  groupId: string;
  projectRoot: string;
  entryPoint: string;
  depth: number;
  flatten: boolean;
}

/**
 * Request payload for combining multiple groups (we use a single group in the new flow).
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
