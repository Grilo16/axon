import { useState, useCallback, useMemo } from "react";
import { 
  useListPublicDirectoryQuery, 
  useLazyListPublicDirectoryQuery,
  useGetPublicAllFilePathsQuery,
  useLazyGetPublicFilePathsByDirQuery
} from "../api/public-api";
import { usePublicSandbox } from "./use-public-sandbox";

export const usePublicExplorerSuite = (sandbox: ReturnType<typeof usePublicSandbox>) => {
  const { activeWorkspaceId, activePaths, setPaths, toggleTarget } = sandbox;
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. Root Directory Fetching ---
  const { data: entries = [], isLoading: isTreeLoading } = useListPublicDirectoryQuery(
    { id: activeWorkspaceId!, query: { path: "" } }, 
    { skip: !activeWorkspaceId }
  );

  const [lazyListDir] = useLazyListPublicDirectoryQuery();
  const fetchDir = useCallback(async (path: string) => {
    if (!activeWorkspaceId) return undefined;
    const res = await lazyListDir({ id: activeWorkspaceId, query: { path } }).unwrap();
    return res;
  }, [activeWorkspaceId, lazyListDir]);

  // --- 2. Search Logic ---
  const { data: allPaths } = useGetPublicAllFilePathsQuery(
    { id: activeWorkspaceId!, query: { limit: 100 } }, 
    { skip: !activeWorkspaceId }
  );

  const searchResults = useMemo(() => {
    if (!searchQuery || !allPaths) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return allPaths.filter(p => p.toLowerCase().includes(lowerQuery)).slice(0, 100);
  }, [searchQuery, allPaths]);

  const handleAddAllSearch = () => {
    const nextPaths = Array.from(new Set([...activePaths, ...searchResults]));
    setPaths(nextPaths);
    setSearchQuery(""); 
  };

  // --- 3. Node Level Logic (Folder Toggling) ---
  const [lazyPathsByDir] = useLazyGetPublicFilePathsByDirQuery();
  
  const handleToggleFolderGraph = useCallback(async (path: string) => {
    if (!activeWorkspaceId) return;
    try {
      const folderFiles = await lazyPathsByDir({
        id: activeWorkspaceId,
        query: { limit: 100, path: path, recursive: true },
      }).unwrap();
      
      if (!folderFiles || folderFiles.length === 0) return;

      const allInGraph = folderFiles.every((f) => activePaths.includes(f));
      if (allInGraph) {
        setPaths(activePaths.filter((p) => !folderFiles.includes(p)));
      } else {
        setPaths(Array.from(new Set([...activePaths, ...folderFiles])));
      }
    } catch (err) {
      console.error("Failed to toggle folder files", err);
    }
  }, [activeWorkspaceId, lazyPathsByDir, activePaths, setPaths]);

  return {
    // Explorer State
    entries,
    isTreeLoading,
    fetchDir,
    // Search State
    searchQuery,
    setSearchQuery,
    searchResults,
    handleAddAllSearch,
    // Node Tools
    handleToggleFolderGraph,
    toggleTarget,
    activePaths
  };
};