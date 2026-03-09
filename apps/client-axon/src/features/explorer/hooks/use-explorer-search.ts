import { useMemo, useDeferredValue } from "react";
import { useAppSelector, useAppDispatch } from "@app/store";
import { toggleNodeSelection } from "@features/core/workspace/workspace-ui-slice";
import { useGetAllFilePathsQuery } from "@features/core/workspace/api/workspace-api";

export const useExplorerSearch = (searchQuery: string) => {
  const dispatch = useAppDispatch();
  const activeWorkspaceId = useAppSelector((state) => state.workspaceUi.activeWorkspaceId);

  // 1. Defer the search query to keep the UI typing at a buttery 60fps
  // even if the mock frontend filtering takes a few milliseconds.
  const deferredQuery = useDeferredValue(searchQuery);

  // ==========================================
  // 🚧 MOCK BACKEND IMPLEMENTATION 🚧
  // TODO: Replace this entire block with your future Rust endpoint!
  // Example future code: 
  // const { data: results = [], isFetching } = useSearchFilesQuery({ id: activeWorkspaceId, query: deferredQuery });
  
  const { data: allPaths = [], isFetching } = useGetAllFilePathsQuery(
    { id: activeWorkspaceId!, query: {limit: 200} },
    { skip: !activeWorkspaceId || !deferredQuery } 
  );

  const results = useMemo(() => {
    if (!deferredQuery) return [];
    
    const lowerQuery = deferredQuery.toLowerCase();
    
    // Naive frontend fuzzy search 
    return allPaths
      .filter((path) => path.toLowerCase().includes(lowerQuery))
      .slice(0, 100); // Cap it at 100 so the DOM doesn't crash before the backend is ready
  }, [allPaths, deferredQuery]);
  // ==========================================


  // 2. Actions
  const toggleTarget = (path: string) => {
    // Note: For now we map this to our UI slice selection. 
    // Later, this might dispatch a mutation to actually add the file to your active Bundle!
    dispatch(toggleNodeSelection(path));
  };

  const addAllToGraph = () => {
    // Note: Same as above. Dispatching in a loop for the mock, 
    // but future-state this will be a single API mutation `addFilesToBundle({ files: results })`
    results.forEach((path) => {
      dispatch(toggleNodeSelection(path));
    });
  };

  return {
    results,
    isSearching: isFetching || deferredQuery !== searchQuery, // True if typing OR fetching
    toggleTarget,
    addAllToGraph,
  };
};