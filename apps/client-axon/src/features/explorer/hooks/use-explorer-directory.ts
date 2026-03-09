import { useAuth } from "react-oidc-context";
import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";

import { useListDirectoryQuery } from "@features/core/workspace/api/workspace-api"; 
import { useListPublicDirectoryQuery } from "@features/public/api/public-api"; 

export const useExplorerDirectory = (path: string, isFolder: boolean = false, isOpen: boolean) => {
  const activeWorkspaceId = useActiveWorkspaceId();
  const { isAuthenticated } = useAuth();

  // 1. Private Query (Skips if anonymous)
  const privateQuery = useListDirectoryQuery(
    { id: activeWorkspaceId!, query: { path } },
    { skip: !isOpen || !isFolder || !activeWorkspaceId || !isAuthenticated }
  );

  // 2. Public Query (Skips if authenticated)
  const publicQuery = useListPublicDirectoryQuery(
    { id: activeWorkspaceId!, query: { path } },
    { skip: !isOpen || !isFolder || !activeWorkspaceId || isAuthenticated }
  );

  // 3. The Switchboard
  const activeQuery = isAuthenticated ? privateQuery : publicQuery;

  return {
    children: activeQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
  };
};