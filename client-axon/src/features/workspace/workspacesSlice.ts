import { 
  createSlice, 
  createEntityAdapter, 
  type PayloadAction, 
  nanoid 
} from '@reduxjs/toolkit';
import { type RootState } from '@app/store';
import { type AxonGroup} from '@axon-types/workspaceTypes';
import type { PromptOptions } from '@axon-types/axonTypes';

// --- Data Types ---
export interface WorkspaceData {
  id: string;
  name: string;
  projectRoot: string;
  lastOpened: string; 
  groups: AxonGroup[];
  globalOptions: PromptOptions;
  selectedNodeId: string | null;
}

// --- Adapter Setup ---
const workspacesAdapter = createEntityAdapter<WorkspaceData>({
  // Automatic sorting by "Recent" whenever we call selectAll!
  sortComparer: (a, b) => b.lastOpened.localeCompare(a.lastOpened),
});

const initialState = workspacesAdapter.getInitialState({
  activeId: null as string | null,
});

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    // --- Management Actions ---
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
            groups: [],
            globalOptions: { skeletonMode: 'stripOnly', redactions: [], removeComments: true, showLineNumbers: true, skeletonTargets: [] },
            selectedNodeId: null,
          } as WorkspaceData
        };
      }
    },

    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      if (state.activeId && state.entities[state.activeId]) {
        state.entities[state.activeId].selectedNodeId = action.payload;
      }
    },
    
    deleteWorkspace: (state, action: PayloadAction<string>) => {
      workspacesAdapter.removeOne(state, action.payload);
      if (state.activeId === action.payload) {
        state.activeId = null;
      }
    },

    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      // Update the "Last Opened" time for sorting
      workspacesAdapter.updateOne(state, {
        id: action.payload,
        changes: { lastOpened: new Date().toISOString() }
      });
      state.activeId = action.payload;
    },

    // --- Active Workspace Actions ---
    // These actions modify the entity currently pointed to by activeId
    
    addActiveGroup: (state, action: PayloadAction<AxonGroup>) => {
      if (state.activeId) {
        const ws = state.entities[state.activeId];
        if (ws) ws.groups.push(action.payload);
      }
    },


    updateActiveGroup: (state, action: PayloadAction<{ id: string; changes: Partial<AxonGroup> }>) => {
      // 1. Check if we have an active workspace
      if (!state.activeId) return;
      
      const workspace = state.entities[state.activeId];
      if (!workspace) return;

      // 2. Find the group index
      const groupIndex = workspace.groups.findIndex(g => g.id === action.payload.id);
      
      // 3. Apply changes immutably
      if (groupIndex !== -1) {
        workspace.groups[groupIndex] = {
          ...workspace.groups[groupIndex],
          ...action.payload.changes
        };
      }
    },

    updateGlobalOptions: (state, action: PayloadAction<Partial<WorkspaceData['globalOptions']>>) => {
      if (state.activeId && state.entities[state.activeId]) {
        const ws = state.entities[state.activeId];
        ws.globalOptions = { ...ws.globalOptions, ...action.payload };
      }
    },
  },
});

export const { 
  createWorkspace, 
  deleteWorkspace, 
  setActiveWorkspace,
  addActiveGroup,
  updateActiveGroup,
  setSelectedNode,
  updateGlobalOptions,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

// --- Selectors ---

// 1. The Adapter Selectors (selectAll, selectById, selectIds)
export const {
  selectAll: selectAllWorkspaces,
  selectById: selectWorkspaceById,
} = workspacesAdapter.getSelectors<RootState>(state => state.workspaces);

// 2. The Active Selectors
export const selectActiveId = (state: RootState) => state.workspaces.activeId;

export const selectActiveWorkspace = (state: RootState) => {
  const id = state.workspaces.activeId;
  return id ? state.workspaces.entities[id] : null;
};

export const selectActiveGroups = (state: RootState) => 
  selectActiveWorkspace(state)?.groups ?? [];

export const selectActiveRoot = (state: RootState) => 
  selectActiveWorkspace(state)?.projectRoot ?? null;

export const selectSelectedNodeId = (state: RootState) => 
  selectActiveWorkspace(state)?.selectedNodeId ?? null;