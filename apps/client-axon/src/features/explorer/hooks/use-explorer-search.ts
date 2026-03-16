import { useDeferredValue } from "react";
import { useIsAuthenticated } from "@shared/hooks/use-auth-mode";
import { toast } from "sonner";

import { useAppSelector } from "@app/store";
import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";
import { selectPrivateGraphPathsSet, selectPublicGraphPathsSet } from "@features/core/workspace/workspace-ui-selector";
import { useActiveWorkspaceSearchFilesQuery } from "@features/core/workspace/hooks/use-workspace-queries";

export const useExplorerSearch = (searchQuery: string) => {
  
  // 1. Action Hooks
  const { toggleTargetFile, addTargetFiles, removeTargetFiles } = useActiveBundleActions();
  
  const isAuthenticated = useIsAuthenticated();
  const privatePathsSet = useAppSelector(selectPrivateGraphPathsSet);
  const publicPathsSet = useAppSelector(selectPublicGraphPathsSet);
  const activePathsSet = isAuthenticated ? privatePathsSet : publicPathsSet;

  const deferredQuery = useDeferredValue(searchQuery);

  const { results, isFetching } = useActiveWorkspaceSearchFilesQuery(deferredQuery)

  // ==========================================
  // 🌟 ELITE BULK ACTIONS
  // ==========================================

  const addAllToGraph = () => {
    if (results.length === 0) return;
    
    const toAdd = results.filter(path => !activePathsSet.has(path));
    
    if (toAdd.length > 0) {
      addTargetFiles(toAdd);
      toast.success(`Added ${toAdd.length} search results to graph.`);
    } else {
      toast.info("All search results are already in the graph.");
    }
  };

  const removeAllFromGraph = () => {
    if (results.length === 0) return;
    
    const toRemove = results.filter(path => activePathsSet.has(path));
    
    if (toRemove.length > 0) {
      removeTargetFiles(toRemove);
      toast.success(`Removed ${toRemove.length} search results from graph.`);
    } else {
      toast.info("None of the search results were in the graph.");
    }
  };

  const toggleTarget = (path: string) => {
    toggleTargetFile(path);
  };

  return {
    results, 
    isSearching: isFetching || (deferredQuery !== searchQuery), 
    activePathsSet,
    toggleTarget,
    addAllToGraph,
    removeAllFromGraph,
  };
};