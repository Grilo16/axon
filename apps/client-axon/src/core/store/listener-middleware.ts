import { createListenerMiddleware, type TypedStartListening } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./store";
import { setWorkspace, setBundle } from "@core/workspace/workspace-ui-slice";
import { bundleApi } from "@core/bundles/api/bundles-api";

// 1. Create the base middleware
export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;

// ==========================================
// RULE 1: AUTO-SELECT BUNDLE ON WORKSPACE LOAD
// ==========================================
startAppListening({
  // No more TS errors! currentState is now fully typed as RootState
  predicate: (action, currentState) => {
    const { activeWorkspaceId, activeBundleId } = currentState.workspaceUi;

    // Condition 1: We must have a workspace but no active bundle.
    if (!activeWorkspaceId || activeBundleId !== null) return false;

    // Condition 2: Sneak into the RTK Query cache and check for bundles.
    const bundles = bundleApi.endpoints.getWorkspaceBundles.select({
      id: activeWorkspaceId,
      query: { limit: null, offset: null }
    })(currentState)?.data;

    // Condition 3: We only act if there are actually bundles to select.
    if (!bundles || bundles.length === 0) return false;

    // Trigger if the user just switched workspaces (Cache Hit) 
    // OR if a network fetch just finished (Cache Miss)
    return (
      setWorkspace.match(action) ||
      bundleApi.endpoints.getWorkspaceBundles.matchFulfilled(action)
    );
  },
  
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState();
    const workspaceId = state.workspaceUi.activeWorkspaceId!;

    // Grab the bundles from the cache one last time
    const bundles = bundleApi.endpoints.getWorkspaceBundles.select({
      id: workspaceId,
      query: { limit: null, offset: null }
    })(state)?.data;

    // Mathematically safe double-check, then fire the action!
    if (bundles && bundles.length > 0) {
      listenerApi.dispatch(setBundle(bundles[0].id));
    }
  }
});
