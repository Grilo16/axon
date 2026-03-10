import type { RootState } from "@app/store";
import {
  createSelector,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { workspaceApi } from "./api/workspace-api";
import { publicApi } from "@features/public/api/public-api";

export type ViewMode = "none" | "file" | "bundle-context";
export type HoverRelationship =
  | "exact"
  | "child-hovered"
  | "parent-hovered"
  | "none";

export interface WorkspaceUiState {
  activeWorkspaceId: string | null;
  activeBundleId: string | null;
  hoveredPath: string | null;
  selectedPaths: string[];
  viewMode: ViewMode;
  viewedFilePath: string | null;
  explorerResetKey: number,
}

const initialState: WorkspaceUiState = {
  activeWorkspaceId: null,
  activeBundleId: null,
  hoveredPath: null,
  selectedPaths: [],
  viewMode: "none",
  viewedFilePath: null,
  explorerResetKey: 0,
};

export const workspaceUiSlice = createSlice({
  name: "workspaceUi",
  initialState,
  reducers: {
    // Navigation
    setWorkspace: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
      state.activeBundleId = null;
      state.selectedPaths = [];
      state.viewMode = "none";
      state.viewedFilePath = null;
    },
    setBundle: (state, action: PayloadAction<string | null>) => {
      state.activeBundleId = action.payload;
      state.selectedPaths = [];
      state.viewMode = "none";
      state.viewedFilePath = null;
    },
    clearNavigation: (state) => {
      state.activeWorkspaceId = null;
      state.activeBundleId = null;
      state.selectedPaths = [];
      state.viewMode = "none";
      state.viewedFilePath = null;
    },

    // Graph & Explorer Interactions
    setHoveredPath: (state, action: PayloadAction<string | null>) => {
      state.hoveredPath = action.payload;
    },
    toggleNodeSelection: (
      state,
      action: PayloadAction<{ path: string; multi?: boolean }>,
    ) => {
      const { path, multi } = action.payload;
      if (!multi) {
        state.selectedPaths = [path];
        return;
      }
      const index = state.selectedPaths.indexOf(path);
      if (index !== -1) {
        state.selectedPaths.splice(index, 1);
      } else {
        state.selectedPaths.push(path);
      }
    },
    setSelection: (state, action: PayloadAction<string[]>) => {
      state.selectedPaths = action.payload;
    },
    clearSelection: (state) => {
      state.selectedPaths = [];
    },

    viewFile: (state, action: PayloadAction<string>) => {
      state.viewMode = "file";
      state.viewedFilePath = action.payload;
    },
    viewBundleContext: (state) => {
      state.viewMode = "bundle-context";
      state.viewedFilePath = null;
    },
    closeView: (state) => {
      state.viewMode = "none";
      state.viewedFilePath = null;
    },
    resetExplorer: (state) => {
    state.explorerResetKey += 1;
  },
  },

extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        workspaceApi.endpoints.listWorkspaces.matchFulfilled,
        publicApi.endpoints.listPublicWorkspaces.matchFulfilled
      ),
      (state, action) => {
        const workspaces = action.payload;

        if (workspaces && workspaces.length > 0) {
          // 🌟 1. Does the current persisted ID actually exist in this new dimension?
          const isValidWorkspace = workspaces.some((w) => w.id === state.activeWorkspaceId);

          // 🌟 2. THE DIMENSIONAL HEALER
          // If the ID is a ghost (from the other auth state) or it's just missing...
          if (!isValidWorkspace) {
            console.log("[WorkspaceUI] Ghost workspace detected. Healing state to default...");
            
            // Instantly snap to the first valid workspace in this dimension
            state.activeWorkspaceId = workspaces[0].id;

            state.activeBundleId = null;
            state.selectedPaths = [];
            state.hoveredPath = null;
            state.viewMode = "none";
            state.viewedFilePath = null;
          }
        }
      },
    );
  },
});

export const {
  setWorkspace,
  setBundle,
  clearNavigation,
  setHoveredPath,
  toggleNodeSelection,
  setSelection,
  clearSelection,
  viewFile,
  viewBundleContext,
  closeView,
  resetExplorer
} = workspaceUiSlice.actions;

export default workspaceUiSlice.reducer;

// ==========================================
// 🧠 DATA ACCESS LAYER (SELECTORS)
// ==========================================

const selectWorkspaceUi = (state: RootState) => state.workspaceUi;

export const selectActiveWorkspaceId = createSelector(
  selectWorkspaceUi,
  (ui) => ui.activeWorkspaceId,
);
export const selectActiveBundleId = createSelector(
  selectWorkspaceUi,
  (ui) => ui.activeBundleId,
);
export const selectViewMode = createSelector(
  selectWorkspaceUi,
  (ui) => ui.viewMode,
);
export const selectViewedFilePath = createSelector(
  selectWorkspaceUi,
  (ui) => ui.viewedFilePath,
);
export const selectSelectedPaths = createSelector(
  selectWorkspaceUi,
  (ui) => ui.selectedPaths,
);
export const selectExplorerKey = createSelector(
  selectWorkspaceUi,
  (ui) => ui.explorerResetKey,
);

// Parameterized pure functions
export const selectIsNodeHovered = (state: RootState, path: string) =>
  state.workspaceUi.hoveredPath === path;

export const selectIsNodeSelected = (state: RootState, path: string) =>
  state.workspaceUi.selectedPaths.includes(path);

// Advanced Relational Selectors
export const makeSelectHoverRelationship =
  (myPath: string) =>
  (state: RootState): HoverRelationship => {
    const hovered = state.workspaceUi.hoveredPath;
    if (!hovered) return "none";
    if (myPath === hovered) return "exact";
    if (hovered.startsWith(myPath + "/")) return "child-hovered";
    if (myPath.startsWith(hovered + "/")) return "parent-hovered";
    return "none";
  };

export const makeSelectIsPathSelected = (path: string) => (state: RootState) =>
  state.workspaceUi.selectedPaths.includes(path);
