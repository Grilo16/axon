import { useAppSelector } from "@core/store";
import {
  selectActiveWorkspaceId,
  selectActiveBundleId,
  selectViewMode,
  selectViewedFilePath,
  selectSelectedPaths,
  selectIsNodeHovered,
  selectIsNodeSelected,
  selectExplorerKey,
} from "../workspace-ui-slice";
import { selectHoverRelationship } from "../workspace-ui-selector";

// Global workspace state selectors
export const useActiveWorkspaceId = () => useAppSelector(selectActiveWorkspaceId);
export const useActiveBundleId = () => useAppSelector(selectActiveBundleId);
export const useViewMode = () => useAppSelector(selectViewMode);
export const useViewedFilePath = () => useAppSelector(selectViewedFilePath);
export const useSelectedPaths = () => useAppSelector(selectSelectedPaths);
export const useSelectedExplorerKey = () => useAppSelector(selectExplorerKey);

// Atomic node state selectors (high performance)
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
