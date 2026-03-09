import { useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@app/store";
import { useAuth } from "react-oidc-context";
import {
  selectActiveWorkspaceId,
  selectActiveBundleId,
  selectViewMode,
  selectViewedFilePath,
  selectSelectedPaths,
  selectIsNodeHovered,
  selectIsNodeSelected,
  setWorkspace,
  setBundle,
  viewFile,
  viewBundleContext,
  closeView,
  setHoveredPath,
  toggleNodeSelection,
  clearSelection,
} from "../workspace-ui-slice";
import { 
  selectHoverRelationship,
  selectPrivateGraphPathsSet, 
  selectPublicGraphPathsSet 
} from "../workspace-ui-selector";

// ==========================================
// 🌟 GLOBAL WORKSPACE STATE
// ==========================================
export const useActiveWorkspaceId = () => useAppSelector(selectActiveWorkspaceId);
export const useActiveBundleId = () => useAppSelector(selectActiveBundleId);
export const useViewMode = () => useAppSelector(selectViewMode);
export const useViewedFilePath = () => useAppSelector(selectViewedFilePath);
export const useSelectedPaths = () => useAppSelector(selectSelectedPaths);

// ==========================================
// 🌟 ATOMIC NODE STATE (High Performance)
// ==========================================
export const useIsNodeHovered = (path: string) => 
  useAppSelector((state) => selectIsNodeHovered(state, path));

export const useHoveredPath = () => useAppSelector(state => state.workspaceUi.hoveredPath);

export const useNodeHoverRelationship = (path: string) => 
  useAppSelector(state => selectHoverRelationship(state, path));

export const useIsNodeSelected = (path: string) => 
  useAppSelector((state) => selectIsNodeSelected(state, path));

export const useIsNodeDimmed = (path: string) => {
  const selectedPaths = useSelectedPaths();
  const isSelected = useIsNodeSelected(path);
  const hasGlobalSelection = selectedPaths.length > 0;
  return hasGlobalSelection && !isSelected;
};
// --- Graph Topology State ---

// Internal helper to seamlessly switch between public/private graph Sets
const useActiveGraphPathsSet = () => {
  const { isAuthenticated } = useAuth();
  const privatePathsSet = useAppSelector(selectPrivateGraphPathsSet);
  const publicPathsSet = useAppSelector(selectPublicGraphPathsSet);
  
  return isAuthenticated ? privatePathsSet : publicPathsSet;
};

export const useIsNodeInGraph = (path: string) => {
  const activePathsSet = useActiveGraphPathsSet();
  // Instant O(1) check!
  return activePathsSet.has(path);
};

export const useFolderHasFilesInGraph = (path: string) => {
  const activePathsSet = useActiveGraphPathsSet();
  
  return useMemo(() => {
    const dirPrefix = path.endsWith('/') ? path : `${path}/`;
    
    // Iterating a Set of ONLY active graph nodes is thousands of 
    // times faster than iterating the entire file tree.
    for (const activePath of activePathsSet) {
      if (activePath.startsWith(dirPrefix)) return true;
    }
    return false;
  }, [activePathsSet, path]);
};

// ==========================================
// 🌟 WORKSPACE DISPATCHERS
// ==========================================
export const useWorkspaceDispatchers = () => {
  const dispatch = useAppDispatch();
  
  return {
    switchWorkspace: useCallback(
      (id: string | null) => dispatch(setWorkspace(id)),
      [dispatch],
    ),
    switchBundle: useCallback(
      (id: string | null) => dispatch(setBundle(id)),
      [dispatch],
    ),
    openFileViewer: useCallback(
      (path: string) => dispatch(viewFile(path)),
      [dispatch],
    ),
    openBundleViewer: useCallback(
      () => dispatch(viewBundleContext()),
      [dispatch],
    ),
    closeViewer: useCallback(
      () => dispatch(closeView()), 
      [dispatch]
    ),
    hoverNode: useCallback(
      (path: string | null) => dispatch(setHoveredPath(path)),
      [dispatch],
    ),
    toggleSelection: useCallback(
      (path: string, multi: boolean = false) => dispatch(toggleNodeSelection({ path, multi })),
      [dispatch],
    ),
    clearSelection: useCallback(
      () => dispatch(clearSelection()), 
      [dispatch]
    ),
  };
};