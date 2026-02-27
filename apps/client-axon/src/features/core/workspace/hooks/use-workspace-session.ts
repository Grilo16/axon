import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  selectSelectedPaths,
  togglePathSelection,
  clearSelection,
  setHoveredPath,
  setViewedFilePath,
  selectViewedFilePath,
  selectViewedBundleContent,
  setViewedBundleContent,
} from "../workspace-slice";

/**
 * Workspace UI Session
 * Manages the ephemeral interactions (Hover, Selection, Code Viewer)
 * for the currently active workspace.
 */
export const useWorkspaceSession = () => {
  const dispatch = useAppDispatch();

  const selectedPaths = useAppSelector(selectSelectedPaths);
  const viewedFilePath = useAppSelector(selectViewedFilePath);
  const viewedBundleContent = useAppSelector(selectViewedBundleContent);


  // --- Code Viewer ---
  const openFileInViewer = useCallback((path: string) => {
    dispatch(setViewedFilePath(path));
  }, [dispatch]);

  const openBundleInViewer = useCallback((content: string) => {
    dispatch(setViewedBundleContent(content));
  }, [dispatch]);

  const closeViewer = useCallback(() => {
    dispatch(setViewedFilePath(null));
    dispatch(setViewedBundleContent(null)); // Clear both!
  }, [dispatch]);

  // --- Graph/Explorer Selection ---
  const toggleSelection = useCallback(
    (path: string, multi: boolean = false) => {
      dispatch(togglePathSelection({ path, multi }));
    },
    [dispatch],
  );

  const clearAllSelections = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  // --- Graph/Explorer Hover Magic ---
  const setHovered = useCallback(
    (path: string | null) => {
      dispatch(setHoveredPath(path));
    },
    [dispatch],
  );

  return {
    selectedPaths,
    viewedFilePath,
    viewedBundleContent,
    openFileInViewer,
    openBundleInViewer,
    closeViewer,
    toggleSelection,
    clearAllSelections,
    setHovered,
  };
};
