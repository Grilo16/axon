import type { RootState } from '@app/state-types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


// bundles-slice.ts
export interface BundlesState {
  activeBundleByWorkspace: Record<string, string>;
}

const initialState = {
  // Dictionary to remember which bundle was last active per workspace
  activeBundleByWorkspace: {} as Record<string, string>, 
};

const bundlesSlice = createSlice({
  name: 'bundles',
  initialState,
  reducers: {
    setActiveBundleId: (state, action: PayloadAction<{ workspaceId: string; bundleId: string }>) => {
      state.activeBundleByWorkspace[action.payload.workspaceId] = action.payload.bundleId;
    },
  }
});

export const { setActiveBundleId } = bundlesSlice.actions;
export default bundlesSlice.reducer;

export const selectActiveBundleIdForWorkspace = (state: RootState) => {
  const activeWorkspaceId = state.workspaces.activeId; 
  if (!activeWorkspaceId) return null;
  return state.bundles.activeBundleByWorkspace[activeWorkspaceId] || null;
};