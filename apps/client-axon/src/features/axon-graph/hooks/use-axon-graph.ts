import { useMemo } from "react";
import type { FocusNodeActions } from "../types";

import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useGetBundleGraphQuery } from "@features/core/bundles/api/bundles-api";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";

export function useAxonGraph() {
  // ✨ Grab hideBarrelExports
  const { activeBundle, activePaths, setPaths, hideBarrelExports } = useBundleSession();
  const { isBooting } = useWorkspaceManager();

  const { 
    data: graphData, 
    error, 
    isLoading, 
    isFetching 
  } = useGetBundleGraphQuery(
    { id: activeBundle?.id ?? "", hideBarrelExports }, 
    { skip: !activeBundle?.id } 
  );

  const actions = useMemo<FocusNodeActions>(() => ({
    addFile: (fileId) => {
      if (!activePaths.includes(fileId)) setPaths([...activePaths, fileId]);
    },
    removeFile: (fileId) => {
      setPaths(activePaths.filter((id) => id !== fileId));
    },
    batchUpdateFiles: (toAdd, toRemove) => {
      const next = new Set(activePaths);
      toAdd.forEach((id) => next.add(id));
      toRemove.forEach((id) => next.delete(id));
      setPaths(Array.from(next));
    },
    reset: () => setPaths([]),
  }), [activePaths, setPaths]);

  return {
    activeFiles: activePaths, 
    graphData,
    isLoading: isLoading || isBooting, 
    error,
    isFetching,
    actions,
  };
}