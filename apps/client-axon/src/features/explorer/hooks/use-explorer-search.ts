import { useState, useMemo } from "react";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useGetAllFilePathsQuery } from "@features/core/workspace/api/workspace-api";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";

export const useExplorerSearch = () => {
  const { activeId } = useWorkspaceManager();
  const { activePaths, setPaths, toggleTarget } = useBundleSession();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allPaths } = useGetAllFilePathsQuery(
    { id: activeId!, query: { limit: 100 } }, 
    { skip: !activeId }
  );

  const searchResults = useMemo(() => {
    if (!searchQuery || !allPaths) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return allPaths.filter(p => p.toLowerCase().includes(lowerQuery)).slice(0, 100);
  }, [searchQuery, allPaths]);

  const handleAddAll = () => {
    const nextPaths = Array.from(new Set([...activePaths, ...searchResults]));
    setPaths(nextPaths);
    setSearchQuery(""); 
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    handleAddAll,
    toggleTarget,
    activePaths
  };
};