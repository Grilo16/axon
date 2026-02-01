export type SkeletonMode = "all" | "keepOnly" | "stripOnly";

/**
 * Scan settings for the current workspace.
 * The app performs a single scan from `entryPoint` up to `depth`.
 */
export interface ScanConfig {
  entryPoint: string;
  depth: number;
  /**
   * Passed to the Rust scanner. If true, the backend may flatten directory structure.
   * Folder grouping in the UI still uses the returned file paths.
   */
  flatten: boolean;
}

/**
 * Legacy types (kept for backward compatibility with older notes/components).
 * If you no longer need them, feel free to remove.
 */
export interface WorkspaceState {
  id: string;
  name: string;
  projectRoot: string;
  tsConfigPath: string | null;
  selectedGroupId: string | null;

  skeletonMode: SkeletonMode;
  redactions: string[];
  skeletonTargets: string[];

  showLineNumbers: boolean;
  removeComments: boolean;
}
