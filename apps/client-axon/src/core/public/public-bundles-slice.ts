import { createEntityAdapter, createSlice, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";
import type { BundleRecord } from "@shared/types/axon-core/bundle-api";

// 🌟 Use your actual types! 


// 🌟 1. Create the Elite Entity Adapter
const publicBundlesAdapter = createEntityAdapter<BundleRecord>({
  sortComparer: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

export const publicBundlesSlice = createSlice({
  name: "publicBundles",
  initialState: publicBundlesAdapter.getInitialState(),
  reducers: {
    // 🌟 2. Adapter handles all the complex immutable logic!
    addPublicBundle: publicBundlesAdapter.addOne,
    
    // updateOne expects { id: string, changes: Partial<BundleRecord> }
    updatePublicBundle: publicBundlesAdapter.updateOne,
    
    removePublicBundle: publicBundlesAdapter.removeOne,
  },
});

export const { addPublicBundle, updatePublicBundle, removePublicBundle } = publicBundlesSlice.actions;
export default publicBundlesSlice.reducer;

// ==========================================
// 🧠 DATA ACCESS LAYER (SELECTORS)
// ==========================================

// Auto-generated selectors
export const { 
  selectAll: selectAllPublicBundles, 
  selectById: selectPublicBundleById 
} = publicBundlesAdapter.getSelectors((state: RootState) => state.publicBundles);

// 🌟 Custom Memoized Selector to filter by Workspace ID
export const selectPublicBundlesByWorkspace = createSelector(
  [selectAllPublicBundles, (_state: RootState, workspaceId: string | null) => workspaceId],
  (allBundles, workspaceId) => {
    if (!workspaceId) return [];
    return allBundles.filter(bundle => bundle.workspaceId === workspaceId);
  }
);