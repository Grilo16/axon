import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "@app/store";

const initialState = {
  activeId: null as string | null,
  selectedPaths: [] as string[],
  hoveredPath: null as string | null,
  viewedFilePath: null as string | null,
  viewedBundleContent: null as string | null,
};

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    setActiveWorkspaceId: (state, action: PayloadAction<string | null>) => {
      state.activeId = action.payload;
      state.selectedPaths = [];
      state.hoveredPath = null;
      state.viewedFilePath = null;
      state.viewedBundleContent = null;
    },
    togglePathSelection: (state, action: PayloadAction<{ path: string; multi: boolean }>) => {
      const { path, multi } = action.payload;
      if (!multi) {
        state.selectedPaths = [path];
        return;
      }
      const index = state.selectedPaths.indexOf(path);
      if (index === -1) state.selectedPaths.push(path);
      else state.selectedPaths.splice(index, 1);
    },
    clearSelection: (state) => { state.selectedPaths = []; },
    setHoveredPath: (state, action: PayloadAction<string | null>) => { state.hoveredPath = action.payload; },
    setViewedFilePath: (state, action: PayloadAction<string | null>) => {
      state.viewedFilePath = action.payload;
      if (action.payload) state.viewedBundleContent = null;
    },
    setViewedBundleContent: (state, action: PayloadAction<string | null>) => {
      state.viewedBundleContent = action.payload;
      if (action.payload) state.viewedFilePath = null;
    },
  },
});

export const {
  setActiveWorkspaceId, togglePathSelection, clearSelection,
  setHoveredPath, setViewedFilePath, setViewedBundleContent,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

// --- Selectors ---
export const selectActiveWorkspaceId = (state: RootState) => state.workspaces.activeId;
export const selectSelectedPaths = (state: RootState) => state.workspaces.selectedPaths;
export const selectViewedFilePath = (state: RootState) => state.workspaces.viewedFilePath;
export const selectViewedBundleContent = (state: RootState) => state.workspaces.viewedBundleContent;

export type HoverRelationship = "exact" | "child-hovered" | "parent-hovered" | "none";
export const makeSelectHoverRelationship = (myPath: string) => (state: RootState): HoverRelationship => {
  const hovered = state.workspaces.hoveredPath;
  if (!hovered) return "none";
  if (myPath === hovered) return "exact";
  if (hovered.startsWith(myPath + "/")) return "child-hovered";
  if (myPath.startsWith(hovered + "/")) return "parent-hovered";
  return "none";
};
export const makeSelectIsPathSelected = (path: string) => (state: RootState) => state.workspaces.selectedPaths.includes(path);