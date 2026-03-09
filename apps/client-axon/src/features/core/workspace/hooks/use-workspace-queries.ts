import { useGetWorkspaceQuery, useListWorkspacesQuery, useListDirectoryQuery, useReadFileQuery } from "../api/workspace-api";
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