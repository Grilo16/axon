import type { RootState } from '@app/store';
import { createSlice, createEntityAdapter, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';
import type { BundleOptions, RedactionRule } from '@shared/types/axon-core/bundler'; // Or your actual path

// 1. The Entity Shape (activePaths is GONE!)
export interface ContextBundle {
  id: string;
  workspaceId: string; 
  name: string;
  options: BundleOptions;
}

// 2. The Adapter
export const bundlesAdapter = createEntityAdapter<ContextBundle>();

// 3. The State
const initialState = bundlesAdapter.getInitialState({
  activeBundleByWorkspace: {} as Record<string, string>, 
});

const bundlesSlice = createSlice({
  name: 'bundles',
  initialState,
  reducers: {
    // --- Bundle Management ---
    createNewBundle: (state, action: PayloadAction<{ workspaceId: string; name: string }>) => {
      const newId = nanoid();
      bundlesAdapter.addOne(state, {
        id: newId,
        workspaceId: action.payload.workspaceId,
        name: action.payload.name,
        options: { rules: [], targetFiles: [] } // Just options now!
      });
      state.activeBundleByWorkspace[action.payload.workspaceId] = newId;
    },
    
    setActiveBundle: (state, action: PayloadAction<{ workspaceId: string; bundleId: string }>) => {
      state.activeBundleByWorkspace[action.payload.workspaceId] = action.payload.bundleId;
    },

    // --- Graph & Bundler Updates ---
    
    // Replaces updateBundlePaths - used for bulk actions (like clearing the graph or adding a whole folder)
    setTargetFiles: (state, action: PayloadAction<{ bundleId: string; files: string[] }>) => {
      const bundle = state.entities[action.payload.bundleId];
      if (bundle) {
        bundle.options.targetFiles = action.payload.files;
      }
    },

    toggleTargetFile: (state, action: PayloadAction<{ bundleId: string; filePath: string }>) => {
      const bundle = state.entities[action.payload.bundleId];
      if (!bundle) return;

      const exists = bundle.options.targetFiles.includes(action.payload.filePath);
      if (exists) {
        bundle.options.targetFiles = bundle.options.targetFiles.filter(p => p !== action.payload.filePath);
      } else {
        bundle.options.targetFiles.push(action.payload.filePath);
      }
    },

    addRule: (state, action: PayloadAction<{ bundleId: string; rule: RedactionRule }>) => {
      const bundle = state.entities[action.payload.bundleId];
      if (bundle) {
        bundle.options.rules.push(action.payload.rule);
      }
    },
    
    removeRule: (state, action: PayloadAction<{ bundleId: string; ruleIndex: number }>) => {
      const bundle = state.entities[action.payload.bundleId];
      if (bundle) {
        bundle.options.rules.splice(action.payload.ruleIndex, 1);
      }
    },
  },
  
  extraReducers: (builder) => {
    // Note: Make sure 'workspaces/createWorkspace' matches the exact action type from your workspace slice
    builder.addCase('workspaces/createWorkspace', (state, action: any) => {
      const defaultId = nanoid();
      bundlesAdapter.addOne(state, {
        id: defaultId,
        workspaceId: action.payload.id,
        name: "Main Bundle",
        options: { rules: [], targetFiles: [] }
      });
      state.activeBundleByWorkspace[action.payload.id] = defaultId;
    });
  }
});

export const { 
  createNewBundle, setActiveBundle, setTargetFiles, toggleTargetFile, addRule, removeRule 
} = bundlesSlice.actions;

export default bundlesSlice.reducer;

// --- SELECTORS ---

export const { selectAll: selectAllBundles, selectById: selectBundleById } = 
  bundlesAdapter.getSelectors((state: RootState) => state.bundles);

export const selectActiveBundleIdForWorkspace = (state: RootState) => {
  const activeWorkspaceId = state.workspaces.activeId; 
  if (!activeWorkspaceId) return null;
  return state.bundles.activeBundleByWorkspace[activeWorkspaceId] || null;
};

export const selectActiveBundle = createSelector(
  [(state: RootState) => state.bundles.entities, selectActiveBundleIdForWorkspace],
  (entities, activeBundleId) => activeBundleId ? entities[activeBundleId] : null
);

// ✨ MAGIC: The Graph now renders directly based on targetFiles!
export const selectActiveGraphPaths = createSelector(
  [selectActiveBundle],
  (bundle) => bundle?.options.targetFiles ?? []
);

export const selectActiveBundleOptions = createSelector(
  [selectActiveBundle],
  (bundle) => bundle?.options ?? { rules: [], targetFiles: [] }
);

export const selectBundlesForActiveWorkspace = createSelector(
  [(state: RootState) => state.workspaces.activeId, selectAllBundles],
  (activeWorkspaceId, allBundles) => 
    allBundles.filter(b => b.workspaceId === activeWorkspaceId)
);