import {
  createSlice,
  createEntityAdapter,
  createSelector,
  type PayloadAction,
  nanoid,
} from "@reduxjs/toolkit";
import { type RootState } from "@app/store";

export interface WorkspaceData {
  id: string;
  name: string;
  projectRoot: string;
  lastOpened: string;
}

// Sort by lastOpened (descending) -> fallback to Name
const workspacesAdapter = createEntityAdapter<WorkspaceData>({
  sortComparer: (a, b) => {
    const dateDiff =
      new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  },
});

const initialState = workspacesAdapter.getInitialState({
  activeId: null as string | null,

  // --- Ephemeral UI State (Applies across all bundles) ---
  selectedPaths: [] as string[],
  hoveredPath: null as string | null,
  viewedFilePath: null as string | null,
  viewedBundleContent: null as string | null,
});

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    createWorkspace: {
      reducer: (state, action: PayloadAction<WorkspaceData>) => {
        workspacesAdapter.addOne(state, action.payload);
        state.activeId = action.payload.id;
      },
      prepare: (name: string, root: string) => ({
        payload: {
          id: nanoid(),
          name,
          projectRoot: root,
          lastOpened: new Date().toISOString(),
        },
      }),
    },

    deleteWorkspace: (state, action: PayloadAction<string>) => {
      workspacesAdapter.removeOne(state, action.payload);
      if (state.activeId === action.payload) {
        state.activeId = null;
      }
    },

    setActiveWorkspace: {
      reducer: (
        state,
        action: PayloadAction<{ id: string; timestamp: string }>,
      ) => {
        workspacesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { lastOpened: action.payload.timestamp },
        });
        state.activeId = action.payload.id;
        state.selectedPaths = [];
        state.hoveredPath = null;
        state.viewedFilePath = null;
      },
      prepare: (id: string) => ({
        payload: { id, timestamp: new Date().toISOString() },
      }),
    },

    togglePathSelection: (
      state,
      action: PayloadAction<{ path: string; multi: boolean }>,
    ) => {
      const { path, multi } = action.payload;

      if (!multi) {
        state.selectedPaths = [path];
        return;
      }

      const index = state.selectedPaths.indexOf(path);
      if (index === -1) {
        state.selectedPaths.push(path);
      } else {
        state.selectedPaths.splice(index, 1);
      }
    },

    clearSelection: (state) => {
      state.selectedPaths = [];
    },

    setHoveredPath: (state, action: PayloadAction<string | null>) => {
      state.hoveredPath = action.payload;
    },

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
  createWorkspace,
  deleteWorkspace,
  setActiveWorkspace,
  togglePathSelection,
  clearSelection,
  setHoveredPath,
  setViewedFilePath,
  setViewedBundleContent,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

// ==========================================
// SELECTORS
// ==========================================

export const {
  selectAll: selectAllWorkspaces,
  selectById: selectWorkspaceById,
  selectEntities: selectWorkspaceEntities,
} = workspacesAdapter.getSelectors<RootState>((state) => state.workspaces);

export const selectActiveId = (state: RootState) => state.workspaces.activeId;

export const selectActiveWorkspace = createSelector(
  [selectWorkspaceEntities, selectActiveId],
  (entities, activeId) => (activeId ? (entities[activeId] ?? null) : null),
);

export const selectActiveRoot = createSelector(
  [selectActiveWorkspace],
  (activeWorkspace) => activeWorkspace?.projectRoot ?? null,
);

export const selectSelectedPaths = (state: RootState) =>
  state.workspaces.selectedPaths;
export const selectViewedFilePath = (state: RootState) =>
  state.workspaces.viewedFilePath;

// --- Relational Selectors ---

export type HoverRelationship =
  | "exact"
  | "child-hovered"
  | "parent-hovered"
  | "none";

/**
 * Determines the visual glow relationship between a given path and the currently hovered path.
 */
export const makeSelectHoverRelationship =
  (myPath: string) =>
  (state: RootState): HoverRelationship => {
    const hovered = state.workspaces.hoveredPath;
    if (!hovered) return "none";

    if (myPath === hovered) return "exact";
    if (hovered.startsWith(myPath + "/")) return "child-hovered";
    if (myPath.startsWith(hovered + "/")) return "parent-hovered";

    return "none";
  };

export const makeSelectIsPathSelected = (path: string) => (state: RootState) =>
  state.workspaces.selectedPaths.includes(path);

export const selectViewedBundleContent = (state: RootState) => state.workspaces.viewedBundleContent;