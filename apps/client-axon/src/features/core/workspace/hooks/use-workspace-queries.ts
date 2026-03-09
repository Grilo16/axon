import { useGetWorkspaceQuery, useListWorkspacesQuery, useListDirectoryQuery, useReadFileQuery, useSearchFilesQuery } from "../api/workspace-api";
import { useActiveWorkspaceId, useViewedFilePath, useViewMode } from "./use-workspace-slice";

export const useActiveWorkspaceQuery = () => {
  const activeId = useActiveWorkspaceId();
  return useGetWorkspaceQuery(activeId!, {
    skip: !activeId,
  });
};

export const useActiveWorkspaceDirectory = (path: string, isOpen: boolean) => {
  const activeId = useActiveWorkspaceId();
  return useListDirectoryQuery(
    { id: activeId!, query: { path } },
    { skip: !activeId || !isOpen } 
  );
};

export const useAllWorkspacesQuery = () => {
  const {data, ...result} = useListWorkspacesQuery({ limit: null, offset: null });
  return {
    workspaces: data ?? [],
    ...result,
  }
};

export const useReadWorkspaceFileQuery = () => {
  const activeId = useActiveWorkspaceId();
  const viewedFilePath = useViewedFilePath()
  const viewMode = useViewMode()
  const isFile = viewMode === "file"
  
  return useReadFileQuery(
      { id: activeId!, query: { path: viewedFilePath! } },
      { skip: !activeId || !viewedFilePath || !isFile  }
    );
}

export const useActiveWorkspaceSearchFilesQuery = (value: string) => {
  const id = useActiveWorkspaceId();
  
  const safeQuery = value || "";
  const isQuerySubstantial = safeQuery.trim().length >= 2;

  const { data, ...result } = useSearchFilesQuery(
    { id: id!, query: {
      limit: null, 
      value
    } },
    { 
      skip: !id || !isQuerySubstantial 
    } 
  );

  return {
    results: data ?? [], 
    ...result,
  };
};