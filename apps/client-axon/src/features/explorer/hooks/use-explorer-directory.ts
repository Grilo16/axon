import { useAuth } from "react-oidc-context";
import { useAppSelector } from "@app/store";
import { useListDirectoryQuery } from "@features/core/workspace/api/workspace-api";
import { useListPublicDirectoryQuery } from "@features/public/api/public-api";

export const useExplorerDirectory = (path: string, isOpen: boolean) => {
  const { isAuthenticated } = useAuth();
  const activeWorkspaceId = useAppSelector((state) => state.workspaceUi.activeWorkspaceId);

  const privateQuery = useListDirectoryQuery(
    { id: activeWorkspaceId!, query: { path } },
    { skip: !activeWorkspaceId || !isOpen || !isAuthenticated } 
  );

  const publicQuery = useListPublicDirectoryQuery(
    { id: activeWorkspaceId!, query: { path } },
    { skip: !activeWorkspaceId || !isOpen || isAuthenticated }
  );

  const isFetching = isAuthenticated ? privateQuery.isFetching : publicQuery.isFetching;
  const isError = isAuthenticated ? privateQuery.isError : publicQuery.isError;
  const children = isAuthenticated ? privateQuery.data : publicQuery.data;

  return {
    children: children ?? [],
    isLoading: isFetching,
    isError,
  };
};