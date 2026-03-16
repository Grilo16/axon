// Barrel export for backward compatibility
export {
  useActiveWorkspaceId,
  useActiveBundleId,
  useViewMode,
  useViewedFilePath,
  useSelectedPaths,
  useSelectedExplorerKey,
  useIsNodeHovered,
  useHoveredPath,
  useNodeHoverRelationship,
  useIsNodeSelected,
  useIsNodeDimmed,
} from "./use-workspace-selectors";

export {
  useIsNodeInGraph,
  useFolderHasFilesInGraph,
} from "./use-graph-membership";

export {
  useWorkspaceDispatchers,
} from "./use-workspace-dispatchers";
