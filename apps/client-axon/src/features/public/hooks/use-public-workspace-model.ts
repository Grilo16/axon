import { useMemo } from "react";
import { useListPublicWorkspacesQuery } from "../api/public-api";
import { usePublicActions } from "./use-public-actions";

export const usePublicWorkspaceModel = () => {
  // Declarative query for the list
  const listQuery = useListPublicWorkspacesQuery();
  
  // Action Handlers
  const actions = usePublicActions();

  // Derived aggregate state
  const isWorking = 
    listQuery.isFetching || 
    actions.readPublicFile.isFetching || 
    actions.listPublicDirectory.isFetching;

  return useMemo(() => ({
    // Data
    publicWorkspaces: listQuery.data ?? [],
    
    // Status
    isWorking,
    isError: listQuery.isError,

    // Actions (Lazy File System Browsing)
    readFile: actions.readPublicFile.handle,
    listDirectory: actions.listPublicDirectory.handle,
    getPathsByDir: actions.getPublicPathsByDir.handle,
    getAllPaths: actions.getAllPublicPaths.handle,
  }), [listQuery, isWorking, actions]);
};