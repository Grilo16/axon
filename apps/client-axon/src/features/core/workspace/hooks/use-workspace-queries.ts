import { useAuth } from "react-oidc-context";
import {
  useGetWorkspaceQuery,
  useListWorkspacesQuery,
  useListDirectoryQuery,
  useReadFileQuery,
  useSearchFilesQuery,
} from "../api/workspace-api";
import {
  useActiveWorkspaceId,
  useViewedFilePath,
  useViewMode,
} from "./use-workspace-slice";
import { useReadPublicFileQuery, useSearchPublicFilesQuery } from "@features/public/api/public-api";

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
    { skip: !activeId || !isOpen },
  );
};

export const useAllWorkspacesQuery = () => {
  const { data, ...result } = useListWorkspacesQuery({
    limit: null,
    offset: null,
  });
  return {
    workspaces: data ?? [],
    ...result,
  };
};

export const useReadWorkspaceFileQuery = () => {
  const activeId = useActiveWorkspaceId();
  const viewedFilePath = useViewedFilePath();
  const viewMode = useViewMode();
  const { isAuthenticated } = useAuth();
  const isFile = viewMode === "file";

  const privateQuery = useReadFileQuery(
     { id: activeId!, query: { path: viewedFilePath! } },
    { skip: !activeId || !viewedFilePath || !isFile || !isAuthenticated},
  );

  const publicQuery = useReadPublicFileQuery(
     { id: activeId!, query: { path: viewedFilePath! } },
    { skip: !activeId || !viewedFilePath || !isFile || isAuthenticated },
  );

  return isAuthenticated ? privateQuery : publicQuery
};

export const useActiveWorkspaceSearchFilesQuery = (value: string) => {
  const id = useActiveWorkspaceId();
  const { isAuthenticated } = useAuth();

  const safeQuery = value || "";
  const isQuerySubstantial = safeQuery.trim().length >= 2;
  const payload = {
    id: id!,
    query: {
      limit: null,
      value,
    },
  };

  const privateQuery = useSearchFilesQuery(payload, {
    skip: !id || !isQuerySubstantial || !isAuthenticated,
  });

  const publicQuery = useSearchPublicFilesQuery(payload, {
    skip: !id || !isQuerySubstantial || isAuthenticated,
  });

  const { data, ...result } = isAuthenticated ? privateQuery : publicQuery;

  return {
    results: data ?? [],
    ...result,
  };
};
