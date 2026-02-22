import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
  nanoid,
} from "@reduxjs/toolkit";
import { type RootState } from "@app/store";
import type { PromptOptions } from "@axon-types/axonTypes";
import type { ScanConfig } from "@axon-types/workspaceTypes";
 


/** Represents a single workspace, which corresponds to a project root and its associated metadata. */
export interface WorkspaceData {
  id: string;
  name: string;
  projectRoot: string;
  lastOpened: string;

  /** Single-scan settings for this workspace. */
  scan: ScanConfig;

  /** Prompt generation options (rules, stripping, skeletons, etc.). */
  globalOptions: PromptOptions;

  /** Selected node id in the graph (file node only). */
  selectedNodeId: string | null;
}

const workspacesAdapter = createEntityAdapter<WorkspaceData>({
  // Stable ordering in the sidebar (no reordering when selecting a workspace).
  // Keep `lastOpened` for metadata, but do not use it for sorting.
  sortComparer: (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) ||
    a.id.localeCompare(b.id),
});

const initialState = workspacesAdapter.getInitialState({
  activeId: null as string | null,
});

const defaultPromptOptions: PromptOptions = {
  skeletonMode: "stripOnly",
  redactions: [],
  removeComments: true,
  showLineNumbers: true,
  skeletonTargets: [],
};

const defaultScanConfig: ScanConfig = {
  entryPoint: "",
  depth: 3,
  flatten: true,
};



const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    createWorkspace: {
      reducer: (state, action: PayloadAction<WorkspaceData>) => {
        workspacesAdapter.addOne(state, action.payload);
        state.activeId = action.payload.id;
      },
      prepare: (name: string, root: string) => {
        const id = nanoid();
        return {
          payload: {
            id,
            name,
            projectRoot: root,
            lastOpened: new Date().toISOString(),
            scan: { ...defaultScanConfig },
            globalOptions: { ...defaultPromptOptions },
            selectedNodeId: null,
          } as WorkspaceData,
        };
      },
    },

    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      if (state.activeId && state.entities[state.activeId]) {
        state.entities[state.activeId]!.selectedNodeId = action.payload;
      }
    },

    deleteWorkspace: (state, action: PayloadAction<string>) => {
      workspacesAdapter.removeOne(state, action.payload);
      if (state.activeId === action.payload) {
        state.activeId = null;
      }
    },

    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      workspacesAdapter.updateOne(state, {
        id: action.payload,
        changes: { lastOpened: new Date().toISOString() },
      });
      state.activeId = action.payload;
    },

    updateScanConfig: (state, action: PayloadAction<Partial<ScanConfig>>) => {
      if (!state.activeId) return;
      /** Update the scan config for the active workspace by merging the existing config with the provided partial config.*/
      const ws = state.entities[state.activeId];
      if (!ws) return;

      ws.scan = { ...ws.scan, ...action.payload };
    },

    updateProjectRoot: (state, action: PayloadAction<string>) => {
      if (!state.activeId) return;
      const ws = state.entities[state.activeId];
      if (!ws) return;

      ws.projectRoot = action.payload;
      ws.lastOpened = new Date().toISOString();
      ws.scan = { ...ws.scan, entryPoint: "" };
      ws.selectedNodeId = null;
    },

    updateGlobalOptions: (
      state,
      action: PayloadAction<Partial<WorkspaceData["globalOptions"]>>,
    ) => {
      if (state.activeId && state.entities[state.activeId]) {
        const ws = state.entities[state.activeId]!;
        ws.globalOptions = { ...ws.globalOptions, ...action.payload };
      }
    },
  },
});

export const {
  createWorkspace,
  deleteWorkspace,
  setActiveWorkspace,
  setSelectedNode,
  updateScanConfig,
  updateProjectRoot,
  updateGlobalOptions,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

export const {
  selectAll: selectAllWorkspaces,
  selectById: selectWorkspaceById,
} = workspacesAdapter.getSelectors<RootState>((state) => state.workspaces);

export const selectActiveId = (state: RootState) => state.workspaces.activeId;

export const selectActiveWorkspace = (state: RootState) => {
  const id = state.workspaces.activeId;
  return id ? state.workspaces.entities[id] : null;
};

export const selectActiveScanConfig = (state: RootState) =>
  selectActiveWorkspace(state)?.scan ?? null;

export const selectActiveRoot = (state: RootState) =>
  selectActiveWorkspace(state)?.projectRoot ?? null;


/** Returns the selected node ID for the active workspace, or null if no workspace is active. */
export const selectSelectedNodeId = (state: RootState) =>
  selectActiveWorkspace(state)?.selectedNodeId ?? null;
