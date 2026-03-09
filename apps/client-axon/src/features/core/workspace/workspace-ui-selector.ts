import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { bundleApi } from "@features/core/bundles/api/bundles-api";
import { publicApi } from "@features/public/api/public-api";
import { selectActiveBundleId } from "./workspace-ui-slice";

// 1. Safely extract the Public Graph Payload from the local slice
const selectPublicGraphReq = (state: RootState) => {
  const id = selectActiveBundleId(state);
  return id ? state.publicBundles.bundles[id] : undefined;
};

// 2. Extract the raw RTK Query Cache data WITHOUT triggering network requests
// RTKQ provides `.select(queryArgs)` which creates a selector for that specific cache entry!
const selectPrivateGraphCache = (state: RootState) => {
  const id = selectActiveBundleId(state);
  if (!id) return undefined;
  // We match the exact args used in the query hook
  return bundleApi.endpoints.getBundleGraph.select(id)(state)?.data;
};

const selectPublicGraphCache = (state: RootState) => {
  const req = selectPublicGraphReq(state);
  if (!req) return undefined;
  return publicApi.endpoints.getPublicGraph.select(req)(state)?.data;
};

// 3. The Elite Optimization: Convert arrays to O(1) Sets globally!
// These createSelectors guarantee the loop only runs ONCE when the graph data changes, not per-component.
export const selectPrivateGraphPathsSet = createSelector(
  [selectPrivateGraphCache],
  (graphData) => {
    const paths = new Set<string>();
    if (!graphData?.nodes) return paths;
    graphData.nodes.forEach(node => paths.add(node.id));
    return paths;
  }
);

export const selectPublicGraphPathsSet = createSelector(
  [selectPublicGraphCache],
  (graphData) => {
    const paths = new Set<string>();
    if (!graphData?.nodes) return paths;
    graphData.nodes.forEach(node => paths.add(node.id));
    return paths;
  }
);