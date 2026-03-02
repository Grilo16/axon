import { useMemo } from "react";
import type { FocusNodeActions } from "../types";

// ✨ IMPORT FROM THE NEW BUNDLES API
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useGetBundleGraphQuery } from "@features/core/bundles/api/bundles-api";

export function useAxonGraph() {
  const { activeBundle, activePaths, setPaths } = useBundleSession();

  const { 
    data: graphData, 
    error, 
    isLoading, 
    isFetching 
  } = useGetBundleGraphQuery(
    activeBundle?.id ?? "", 
    { skip: !activeBundle?.id } 
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