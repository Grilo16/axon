import { useIsAuthenticated } from "@shared/hooks/use-auth-mode";
import { useSwitchboardQuery } from "@shared/hooks/use-switchboard-query";
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
import { useReadPublicFileQuery, useSearchPublicFilesQuery } from "@core/public/api/public-api";

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
  const isAuthenticated = useIsAuthenticated();
  const isFile = viewMode === "file";

  const commonSkip = !activeId || !viewedFilePath || !isFile;
  const payload = { id: activeId!, query: { path: viewedFilePath! } };

  const privateQuery = useReadFileQuery(payload, { skip: commonSkip || !isAuthenticated });
  const publicQuery = useReadPublicFileQuery(payload, { skip: commonSkip || isAuthenticated });

  return useSwitchboardQuery(privateQuery, publicQuery);
};

export const useActiveWorkspaceSearchFilesQuery = (value: string) => {
  const id = useActiveWorkspaceId();
  const isAuthenticated = useIsAuthenticated();

  const safeQuery = value || "";
  const isQuerySubstantial = safeQuery.trim().length >= 2;
  const payload = { id: id!, query: { limit: null, value } };

  const commonSkip = !id || !isQuerySubstantial;

  const privateQuery = useSearchFilesQuery(payload, { skip: commonSkip || !isAuthenticated });
  const publicQuery = useSearchPublicFilesQuery(payload, { skip: commonSkip || isAuthenticated });

  const { data, ...result } = useSwitchboardQuery(privateQuery, publicQuery);

  return {
    results: data ?? [],
    ...result,
  };
};
