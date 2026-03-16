import { useIsAuthenticated } from "@shared/hooks/use-auth-mode";
import { useSwitchboardQuery } from "@shared/hooks/use-switchboard-query";
import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";

import { useListDirectoryQuery } from "@features/core/workspace/api/workspace-api";
import { useListPublicDirectoryQuery } from "@features/public/api/public-api";

export const useExplorerDirectory = (path: string, isFolder: boolean = false, isOpen: boolean) => {
  const activeWorkspaceId = useActiveWorkspaceId();
  const isAuthenticated = useIsAuthenticated();

  const commonSkip = !isOpen || !isFolder || !activeWorkspaceId;
  const payload = { id: activeWorkspaceId!, query: { path } };

  const privateQuery = useListDirectoryQuery(payload, { skip: commonSkip || !isAuthenticated });
  const publicQuery = useListPublicDirectoryQuery(payload, { skip: commonSkip || isAuthenticated });

  const activeQuery = useSwitchboardQuery(privateQuery, publicQuery);

  return {
    children: activeQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
  };
};