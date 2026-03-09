import {
  useGetBundleQuery,
  useGetWorkspaceBundlesQuery,
  useGetBundleGraphQuery,
  useGetGeneratedContextQuery,
} from "../api/bundles-api";
import {
  useActiveWorkspaceId,
  useActiveBundleId,
  useViewMode,
} from "@features/core/workspace/hooks/use-workspace-slice";

export const useActiveWorkspaceBundlesQuery = () => {
  const activeWorkspaceId = useActiveWorkspaceId();

  const { data, ...result } = useGetWorkspaceBundlesQuery(
    { id: activeWorkspaceId!, query: { limit: null, offset: null } },
    { skip: !activeWorkspaceId },
  );
  return {
    allBundles: data ?? [],
    ...result,
  };
};

// 🌟 Smart Hook 2: Auto-fetches the details of the active bundle
export const useActiveBundleQuery = () => {
  const activeBundleId = useActiveBundleId();

  const { data, ...result } = useGetBundleQuery(activeBundleId!, {
    skip: !activeBundleId,
  });

  return {
    activeBundle: data ?? null,
    ...result
  };
};

// 🌟 Smart Hook 3: Auto-fetches the graph for the active bundle
export const useActiveBundleGraphQuery = () => {
  const activeBundleId = useActiveBundleId();

  // hideBarrelExports is now handled natively by the Rust backend!
  return useGetBundleGraphQuery(activeBundleId!, { skip: !activeBundleId });
};

export const useReadBundleContextQuery = (contextName: string) => {
  const activeBundleId = useActiveBundleId();
  const viewMode = useViewMode();
  const isBundle = viewMode === "bundle-context";

  return useGetGeneratedContextQuery(
    { id: activeBundleId!, name: contextName },
    { skip: !activeBundleId || !isBundle || !contextName },
  );
};
