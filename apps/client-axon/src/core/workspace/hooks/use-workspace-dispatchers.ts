import { useCallback } from "react";
import { useAppDispatch } from "@core/store";
import {
  setWorkspace,
  setBundle,
  viewFile,
  viewBundleContext,
  closeView,
  setHoveredPath,
  toggleNodeSelection,
  clearSelection,
  setSelection,
  resetExplorer,
} from "../workspace-ui-slice";

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
    setSelection: useCallback(
      (paths: string[]) => dispatch(setSelection(paths)),
      [dispatch]
    ),
    clearSelection: useCallback(
      () => dispatch(clearSelection()),
      [dispatch]
    ),
    resetExplorer: useCallback(
      () => dispatch(resetExplorer()),
      [dispatch]
    ),
  };
};
