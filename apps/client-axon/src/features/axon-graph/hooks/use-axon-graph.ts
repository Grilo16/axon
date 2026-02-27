import { useMemo } from "react";
import type { FocusNodeActions } from "../types";
import { useGetFocusedGraphQuery } from "../api/graph-api";

import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";

export function useAxonGraph() {
  const { activePaths, setPaths } = useBundleSession()

  const { 
    data: graphData, 
    error, 
    isLoading, 
    isFetching 
  } = useGetFocusedGraphQuery(
    { requestedPaths: activePaths }, 
    {  } 
  );

  // 3. Update the actions to mutate the global state
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
    isLoading,
    error,
    isFetching,
    actions,
  };
}