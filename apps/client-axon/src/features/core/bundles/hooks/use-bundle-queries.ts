import { useAuth } from "react-oidc-context";
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
import { usePublicBundle, usePublicWorkspaceBundles } from "@features/public/hooks/use-public-bundles-slice";
import { useGetPublicGeneratedContextQuery, useGetPublicGraphQuery } from "@features/public/api/public-api";
import { useAppSelector } from "@app/store";
import type { StatelessGraphReq } from "@shared/types/axon-core/public-api";
import { useMemo } from "react";

export const useActiveWorkspaceBundlesQuery = () => {
  const { isAuthenticated } = useAuth();
  const activeWorkspaceId = useActiveWorkspaceId();

  // 1. Private Network Query (Skips if anonymous)
  const privateQuery = useGetWorkspaceBundlesQuery(
     { id: activeWorkspaceId!, query: { limit: null, offset: null } },
    { skip: !isAuthenticated || !activeWorkspaceId }
  );

  // 2. Public Local Query (Runs instantly against Redux)
  const publicQuery = usePublicWorkspaceBundles(activeWorkspaceId);

  // 3. The Switchboard Router
  const bundles = isAuthenticated ? privateQuery.data : publicQuery.bundles;
  const isLoading = isAuthenticated ? privateQuery.isLoading : publicQuery.isLoading;

  return {
    allBundles: bundles ?? [], 
    isLoading,
  };
};

export const useActiveBundleQuery = () => {
  const { isAuthenticated } = useAuth();
  const activeBundleId = useActiveBundleId();

  // 1. Private Network Query (Skips if anonymous)
  const privateQuery = useGetBundleQuery(
    activeBundleId!,
    { skip: !isAuthenticated || !activeBundleId }
  );

  // 2. Public Local Query (Runs instantly against Redux)
  const publicQuery = usePublicBundle(activeBundleId);

  // 3. The Switchboard Router
  const activeBundle = isAuthenticated ? privateQuery.data : publicQuery.bundle;
  const isLoading = isAuthenticated ? privateQuery.isLoading : publicQuery.isLoading;

  return {
    activeBundle: activeBundle ?? null,
    isLoading
  };
};

// 🌟 Inside useActiveBundleGraphQuery
export const useActiveBundleGraphQuery = () => {
  const { isAuthenticated } = useAuth();
  const activeBundleId = useActiveBundleId();
  
  const publicBundle = useAppSelector((state) => 
    activeBundleId ? state.publicBundles.entities[activeBundleId] : undefined
  );

  // 🌟 THE ELITE FIX: Granular Dependency Tracking
  const publicGraphPayload = useMemo(() => {
    if (!publicBundle) return undefined;
    return {
      workspaceId: publicBundle.workspaceId,
      options: {
        targetFiles: publicBundle.options.targetFiles,
        hideBarrelExports: publicBundle.options.hideBarrelExports,
        // We strip rules out entirely so they don't break the RTK Query cache key!
        rules: [], 
      },
    } as StatelessGraphReq;
  }, [
    publicBundle?.workspaceId, 
    // Listen to these specific array/primitive references, NOT the parent options object!
    publicBundle?.options.targetFiles, 
    publicBundle?.options.hideBarrelExports 
  ]);

  // Private Network Query
  const privateQuery = useGetBundleGraphQuery(
    activeBundleId!,
    { skip: !isAuthenticated || !activeBundleId }
  );

  // Public Network Query 
  const publicQuery = useGetPublicGraphQuery(
    publicGraphPayload!, 
    { skip: isAuthenticated || !activeBundleId || !publicGraphPayload }
  );

  return isAuthenticated ? privateQuery : publicQuery;
};

export const useReadBundleContextQuery = (contextName: string) => {
  const { isAuthenticated } = useAuth();
  const activeBundleId = useActiveBundleId();
  const viewMode = useViewMode();
  const isBundle = viewMode === "bundle-context";

  const publicBundle = useAppSelector((state) => 
    activeBundleId ? state.publicBundles.entities[activeBundleId] : undefined
  );

  // 🌟 CONTEXT PAYLOAD: Needs to listen to everything, including rules!
  const publicContextPayload = useMemo(() => {
    if (!publicBundle) return undefined;
    return {
      workspaceId: publicBundle.workspaceId,
      options: publicBundle.options, // Full options object
    } as StatelessGraphReq;
  }, [publicBundle?.workspaceId, publicBundle?.options]); // Triggers on ANY option change

  const privateQuery = useGetGeneratedContextQuery(
    { id: activeBundleId!, name: contextName },
    { skip: !isAuthenticated || !activeBundleId || !isBundle || !contextName }
  );

  const publicQuery = useGetPublicGeneratedContextQuery(
    { name: contextName, payload: publicContextPayload! },
    { skip: isAuthenticated || !activeBundleId || !isBundle || !publicContextPayload }
  );

  return isAuthenticated ? privateQuery : publicQuery;
};