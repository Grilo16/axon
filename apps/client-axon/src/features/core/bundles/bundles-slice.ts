import type { RootState } from '@app/state-types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface BundlesState {
  activeBundleByWorkspace: Record<string, string>;
  hideBarrelExports: boolean; // ✨ New toggle state
}

const initialState: BundlesState = {
  activeBundleByWorkspace: {}, 
  hideBarrelExports: false,
};

const bundlesSlice = createSlice({
  name: 'bundles',
  initialState,
  reducers: {
    setActiveBundleId: (state, action: PayloadAction<{ workspaceId: string; bundleId: string }>) => {
      state.activeBundleByWorkspace[action.payload.workspaceId] = action.payload.bundleId;
    },
    setHideBarrelExports: (state, action: PayloadAction<boolean>) => {
      state.hideBarrelExports = action.payload;
    }
  }
});

export const { setActiveBundleId, setHideBarrelExports } = bundlesSlice.actions;
export default bundlesSlice.reducer;

export const selectActiveBundleIdForWorkspace = (state: RootState) => {
  const activeWorkspaceId = state.workspaces.activeId; 
  if (!activeWorkspaceId) return null;
  return state.bundles.activeBundleByWorkspace[activeWorkspaceId] || null;
};

export const selectHideBarrelExports = (state: RootState) => state.bundles.hideBarrelExports;