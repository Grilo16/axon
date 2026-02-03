# Context Map
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/themeSlice.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/workspacesSlice.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/theme/themes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/axonTypes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/themeTypes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/workspaceTypes.ts

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts">
   1 | import {type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
   2 | import type { AppDispatch, RootState } from '../store';
   3 | 
   4 | export const useAppDispatch = () => useDispatch<AppDispatch>();
   5 | export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts">
   1 | import { configureStore, combineReducers } from '@reduxjs/toolkit';
   2 | import { 
   3 |   persistStore, 
   4 |   persistReducer,
   5 |   FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER 
   6 | } from 'redux-persist';
   7 | import storage from 'redux-persist/lib/storage'; 
   8 | import workspacesReducer from '@features/workspace/workspacesSlice'; 
   9 | import themeReducer from '@features/theme/themeSlice';
  10 | 
  11 | const rootReducer = combineReducers({
  12 |   workspaces: workspacesReducer,
  13 |   theme: themeReducer,
  14 | });
  15 | 
  16 | const persistConfig = {
  17 |   key: 'axon-root',
  18 |   version: 1,
  19 |   storage,
  20 |   whitelist: ['workspaces', 'theme'] 
  21 | };
  22 | 
  23 | const persistedReducer = persistReducer(persistConfig, rootReducer);
  24 | 
  25 | export const store = configureStore({
  26 |   reducer: persistedReducer,
  27 |   middleware: (getDefaultMiddleware) =>
  28 |     getDefaultMiddleware({
  29 |       serializableCheck: {
  30 |         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  31 |       },
  32 |     }),
  33 | });
  34 | 
  35 | export const persistor = persistStore(store);
  36 | 
  37 | export type RootState = ReturnType<typeof store.getState>;
  38 | export type AppDispatch = typeof store.dispatch;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts">
   1 | import { configureStore, combineReducers } from '@reduxjs/toolkit';
   2 | import { 
   3 |   persistStore, 
   4 |   persistReducer,
   5 |   FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER 
   6 | } from 'redux-persist';
   7 | import storage from 'redux-persist/lib/storage'; 
   8 | import workspacesReducer from '@features/workspace/workspacesSlice'; 
   9 | import themeReducer from '@features/theme/themeSlice';
  10 | 
  11 | const rootReducer = combineReducers({
  12 |   workspaces: workspacesReducer,
  13 |   theme: themeReducer,
  14 | });
  15 | 
  16 | const persistConfig = {
  17 |   key: 'axon-root',
  18 |   version: 1,
  19 |   storage,
  20 |   whitelist: ['workspaces', 'theme'] 
  21 | };
  22 | 
  23 | const persistedReducer = persistReducer(persistConfig, rootReducer);
  24 | 
  25 | export const store = configureStore({
  26 |   reducer: persistedReducer,
  27 |   middleware: (getDefaultMiddleware) =>
  28 |     getDefaultMiddleware({
  29 |       serializableCheck: {
  30 |         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  31 |       },
  32 |     }),
  33 | });
  34 | 
  35 | export const persistor = persistStore(store);
  36 | 
  37 | export type RootState = ReturnType<typeof store.getState>;
  38 | export type AppDispatch = typeof store.dispatch;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/themeSlice.ts">
   1 | import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
   2 | import { type RootState } from '@app/store';
   3 | import { darkTheme, lightTheme } from '@theme/themes'; 
   4 | import { type AxonTheme } from '@axon-types/themeTypes';
   5 | 
   6 | interface ThemeState {
   7 |   mode: 'light' | 'dark';
   8 | }
   9 | 
  10 | const getInitialMode = (): 'light' | 'dark' => {
  11 |   const saved = localStorage.getItem('axon-theme');
  12 |   if (saved === 'light' || saved === 'dark') return saved;
  13 |   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  14 | };
  15 | 
  16 | const initialState: ThemeState = {
  17 |   mode: getInitialMode(),
  18 | };
  19 | 
  20 | const themeSlice = createSlice({
  21 |   name: 'theme',
  22 |   initialState,
  23 |   reducers: {
  24 |     toggleTheme: (state) => {
  25 |       state.mode = state.mode === 'light' ? 'dark' : 'light';
  26 |       localStorage.setItem('axon-theme', state.mode);
  27 |     },
  28 |     setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
  29 |       state.mode = action.payload;
  30 |       localStorage.setItem('axon-theme', state.mode);
  31 |     },
  32 |   },
  33 | });
  34 | 
  35 | export const { toggleTheme, setThemeMode } = themeSlice.actions;
  36 | 
  37 | 
  38 | export const selectThemeMode = (state: RootState) => state.theme.mode;
  39 | 
  40 | export const selectCurrentTheme = (state: RootState): AxonTheme => {
  41 |   return state.theme.mode === 'dark' ? darkTheme : lightTheme;
  42 | };
  43 | 
  44 | export default themeSlice.reducer;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/workspacesSlice.ts">
   1 | import {
   2 |   createSlice,
   3 |   createEntityAdapter,
   4 |   type PayloadAction,
   5 |   nanoid,
   6 | } from "@reduxjs/toolkit";
   7 | import { type RootState } from "@app/store";
   8 | import type { PromptOptions } from "@axon-types/axonTypes";
   9 | import type { ScanConfig } from "@axon-types/workspaceTypes";
  10 | 
  11 | export interface WorkspaceData {
  12 |   id: string;
  13 |   name: string;
  14 |   projectRoot: string;
  15 |   lastOpened: string;
  16 | 
  17 |   /** Single-scan settings for this workspace. */
  18 |   scan: ScanConfig;
  19 | 
  20 |   /** Prompt generation options (rules, stripping, skeletons, etc.). */
  21 |   globalOptions: PromptOptions;
  22 | 
  23 |   /** Selected node id in the graph (file node only). */
  24 |   selectedNodeId: string | null;
  25 | }
  26 | 
  27 | const workspacesAdapter = createEntityAdapter<WorkspaceData>({
  28 |   sortComparer: (a, b) => b.lastOpened.localeCompare(a.lastOpened),
  29 | });
  30 | 
  31 | const initialState = workspacesAdapter.getInitialState({
  32 |   activeId: null as string | null,
  33 | });
  34 | 
  35 | const defaultPromptOptions: PromptOptions = {
  36 |   skeletonMode: "stripOnly",
  37 |   redactions: [],
  38 |   removeComments: true,
  39 |   showLineNumbers: true,
  40 |   skeletonTargets: [],
  41 | };
  42 | 
  43 | const defaultScanConfig: ScanConfig = {
  44 |   entryPoint: "",
  45 |   depth: 3,
  46 |   flatten: true,
  47 | };
  48 | 
  49 | const workspacesSlice = createSlice({
  50 |   name: "workspaces",
  51 |   initialState,
  52 |   reducers: {
  53 |     createWorkspace: {
  54 |       reducer: (state, action: PayloadAction<WorkspaceData>) => {
  55 |         workspacesAdapter.addOne(state, action.payload);
  56 |         state.activeId = action.payload.id;
  57 |       },
  58 |       prepare: (name: string, root: string) => {
  59 |         const id = nanoid();
  60 |         return {
  61 |           payload: {
  62 |             id,
  63 |             name,
  64 |             projectRoot: root,
  65 |             lastOpened: new Date().toISOString(),
  66 |             scan: { ...defaultScanConfig },
  67 |             globalOptions: { ...defaultPromptOptions },
  68 |             selectedNodeId: null,
  69 |           } as WorkspaceData,
  70 |         };
  71 |       },
  72 |     },
  73 | 
  74 |     setSelectedNode: (state, action: PayloadAction<string | null>) => {
  75 |       if (state.activeId && state.entities[state.activeId]) {
  76 |         state.entities[state.activeId]!.selectedNodeId = action.payload;
  77 |       }
  78 |     },
  79 | 
  80 |     deleteWorkspace: (state, action: PayloadAction<string>) => {
  81 |       workspacesAdapter.removeOne(state, action.payload);
  82 |       if (state.activeId === action.payload) {
  83 |         state.activeId = null;
  84 |       }
  85 |     },
  86 | 
  87 |     setActiveWorkspace: (state, action: PayloadAction<string>) => {
  88 |       workspacesAdapter.updateOne(state, {
  89 |         id: action.payload,
  90 |         changes: { lastOpened: new Date().toISOString() },
  91 |       });
  92 |       state.activeId = action.payload;
  93 |     },
  94 | 
  95 |     updateScanConfig: (state, action: PayloadAction<Partial<ScanConfig>>) => {
  96 |       if (!state.activeId) return;
  97 |       const ws = state.entities[state.activeId];
  98 |       if (!ws) return;
  99 | 
 100 |       ws.scan = { ...ws.scan, ...action.payload };
 101 |     },
 102 | 
 103 |     updateGlobalOptions: (
 104 |       state,
 105 |       action: PayloadAction<Partial<WorkspaceData["globalOptions"]>>,
 106 |     ) => {
 107 |       if (state.activeId && state.entities[state.activeId]) {
 108 |         const ws = state.entities[state.activeId]!;
 109 |         ws.globalOptions = { ...ws.globalOptions, ...action.payload };
 110 |       }
 111 |     },
 112 |   },
 113 | });
 114 | 
 115 | export const {
 116 |   createWorkspace,
 117 |   deleteWorkspace,
 118 |   setActiveWorkspace,
 119 |   setSelectedNode,
 120 |   updateScanConfig,
 121 |   updateGlobalOptions,
 122 | } = workspacesSlice.actions;
 123 | 
 124 | export default workspacesSlice.reducer;
 125 | 
 126 | export const {
 127 |   selectAll: selectAllWorkspaces,
 128 |   selectById: selectWorkspaceById,
 129 | } = workspacesAdapter.getSelectors<RootState>((state) => state.workspaces);
 130 | 
 131 | export const selectActiveId = (state: RootState) => state.workspaces.activeId;
 132 | 
 133 | export const selectActiveWorkspace = (state: RootState) => {
 134 |   const id = state.workspaces.activeId;
 135 |   return id ? state.workspaces.entities[id] : null;
 136 | };
 137 | 
 138 | export const selectActiveScanConfig = (state: RootState) =>
 139 |   selectActiveWorkspace(state)?.scan ?? null;
 140 | 
 141 | export const selectActiveRoot = (state: RootState) =>
 142 |   selectActiveWorkspace(state)?.projectRoot ?? null;
 143 | 
 144 | export const selectSelectedNodeId = (state: RootState) =>
 145 |   selectActiveWorkspace(state)?.selectedNodeId ?? null;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/theme/themes.ts">
   1 | import type { AxonTheme } from '../types/themeTypes';
   2 | 
   3 | const SPACING_UNIT = 4; // 1 unit = 4px
   4 | 
   5 | const baseTheme = {
   6 |   spacing: (factor: number) => `${factor * SPACING_UNIT}px`,
   7 |   borderRadius: {
   8 |     sm: '4px',
   9 |     md: '6px',
  10 |     lg: '12px',
  11 |     round: '50%',
  12 |   },
  13 |   typography: {
  14 |     fontFamily: "'Segoe UI', 'Inter', sans-serif",
  15 |     sizes: {
  16 |       xs: '10px',
  17 |       sm: '12px',
  18 |       md: '14px',
  19 |       lg: '16px',
  20 |       xl: '20px',
  21 |       xxl: '32px',
  22 |     }
  23 |   }
  24 | };
  25 | 
  26 | export const darkTheme: AxonTheme = {
  27 |   ...baseTheme,
  28 |   name: 'dark',
  29 |   colors: {
  30 |     bg: {
  31 |       main: '#1e1e1e',     // VS Code Editor BG
  32 |       surface: '#252526',  // Sidebar/Panel BG
  33 |       overlay: '#333333',  // Hover states / Modals
  34 |       input: '#3c3c3c',
  35 |     },
  36 |     text: {
  37 |       primary: '#e1e1e1',
  38 |       secondary: '#cccccc',
  39 |       muted: '#858585',
  40 |     },
  41 |     palette: {
  42 |       primary: '#007acc',  // VS Code Blue
  43 |       secondary: '#0e639c',
  44 |       accent: '#dcb67a',   // Yellow/Gold for folders
  45 |       danger: '#f14c4c',
  46 |       success: '#89d185',
  47 |     },
  48 |     border: '#454545',
  49 |   }
  50 | };
  51 | 
  52 | export const lightTheme: AxonTheme = {
  53 |   ...baseTheme,
  54 |   name: 'light',
  55 |   colors: {
  56 |     bg: {
  57 |       main: '#ffffff',
  58 |       surface: '#f3f3f3',
  59 |       overlay: '#e5e5e5',
  60 |       input: '#ffffff',
  61 |     },
  62 |     text: {
  63 |       primary: '#333333',
  64 |       secondary: '#666666',
  65 |       muted: '#999999',
  66 |     },
  67 |     palette: {
  68 |       primary: '#0078d4',
  69 |       secondary: '#106ebe',
  70 |       accent: '#b08800',
  71 |       danger: '#d13438',
  72 |       success: '#107c10',
  73 |     },
  74 |     border: '#e1e1e1',
  75 |   }
  76 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/types/axonTypes.ts">
   1 | import type { Node } from "@xyflow/react";
   2 | import type { CSSProperties } from "react";
   3 | 
   4 | export interface Position {
   5 |   x: number;
   6 |   y: number;
   7 | }
   8 | 
   9 | /**
  10 |  * Data associated with a File Node.
  11 |  * Matches the Rust `NodeData` struct.
  12 |  */
  13 | export interface FileNodeData {
  14 |   label: string;
  15 |   path: string;
  16 |   definitions: string[];
  17 |   calls: string[];
  18 |   [key: string]: any;
  19 | }
  20 | 
  21 | /**
  22 |  * Data associated with a Folder Group Node.
  23 |  * Frontend-generated grouping based on each file's directory.
  24 |  */
  25 | export interface GroupNodeData {
  26 |   /** Display label (usually the folder path). */
  27 |   label: string;
  28 |   /** Folder path represented by this group (relative or absolute, depending on backend output). */
  29 |   folderPath: string;
  30 |   /** Optional count of file nodes inside the group. */
  31 |   fileCount?: number;
  32 |   [key: string]: any;
  33 | }
  34 | 
  35 | export type AxonNode = Node<FileNodeData | GroupNodeData, "fileNode" | "groupNode">;
  36 | 
  37 | export interface AxonEdge {
  38 |   id: string;
  39 |   source: string;
  40 |   target: string;
  41 | 
  42 |   /** React Flow handle ids (e.g. FileNode has `in` + `out`). */
  43 |   sourceHandle?: string;
  44 |   targetHandle?: string;
  45 | 
  46 |   label?: string;
  47 |   animated?: boolean;
  48 |   style?: CSSProperties;
  49 |   type?: string;
  50 | 
  51 |   /** Optional extra metadata for edge renderers. */
  52 |   data?: Record<string, any>;
  53 | 
  54 |   markerEnd?: any;
  55 |   markerStart?: any;
  56 |   className?: string;
  57 | }
  58 | 
  59 | /**
  60 |  * Matches the `PromptOptions` struct in Rust.
  61 |  * Used for generate_group_prompt and generate_combined_prompt.
  62 |  */
  63 | export interface PromptOptions {
  64 |   showLineNumbers: boolean;
  65 |   removeComments: boolean;
  66 |   redactions: string[];
  67 | 
  68 |   skeletonMode: string;
  69 |   skeletonTargets: string[];
  70 | }
  71 | 
  72 | /**
  73 |  * Request payload for scanning a workspace from a single entrypoint.
  74 |  */
  75 | export interface ScanParams {
  76 |   /** A stable id for the scan (we use workspace id on the frontend). */
  77 |   groupId: string;
  78 |   projectRoot: string;
  79 |   entryPoint: string;
  80 |   depth: number;
  81 |   flatten: boolean;
  82 | }
  83 | 
  84 | /**
  85 |  * Request payload for combining multiple groups (we use a single group in the new flow).
  86 |  */
  87 | export interface GroupRequest {
  88 |   entryPoint: string;
  89 |   depth: number;
  90 |   flatten: boolean;
  91 | }
  92 | 
  93 | /**
  94 |  * The raw response from the Rust `scan_workspace_group` command
  95 |  */
  96 | export interface ScanResponse {
  97 |   nodes: AxonNode[];
  98 |   edges: AxonEdge[];
  99 | }
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/types/themeTypes.ts">
   1 | export interface ColorPalette {
   2 |   primary: string;
   3 |   secondary: string;
   4 |   accent: string;
   5 |   danger: string;
   6 |   success: string;
   7 | }
   8 | 
   9 | export interface BackgroundParams {
  10 |   main: string;    // The deepest background
  11 |   surface: string; // Cards/Panels
  12 |   overlay: string; // Modals/Dropdowns
  13 |   input: string;   // Input fields
  14 | }
  15 | 
  16 | export interface TextParams {
  17 |   primary: string; // High contrast
  18 |   secondary: string; // Medium contrast
  19 |   muted: string; // Low contrast/disabled
  20 | }
  21 | 
  22 | export interface AxonTheme {
  23 |   name: string;
  24 |   colors: {
  25 |     bg: BackgroundParams;
  26 |     text: TextParams;
  27 |     palette: ColorPalette;
  28 |     border: string;
  29 |   };
  30 |   spacing: (factor: number) => string; 
  31 |   borderRadius: {
  32 |     sm: string;
  33 |     md: string;
  34 |     lg: string;
  35 |     round: string;
  36 |   };
  37 |   typography: {
  38 |     fontFamily: string;
  39 |     sizes: {
  40 |       xs: string;
  41 |       sm: string;
  42 |       md: string;
  43 |       lg: string;
  44 |       xl: string;
  45 |       xxl: string;
  46 |     }
  47 |   }
  48 | }
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/types/workspaceTypes.ts">
   1 | export type SkeletonMode = "all" | "keepOnly" | "stripOnly";
   2 | 
   3 | /**
   4 |  * Scan settings for the current workspace.
   5 |  * The app performs a single scan from `entryPoint` up to `depth`.
   6 |  */
   7 | export interface ScanConfig {
   8 |   entryPoint: string;
   9 |   depth: number;
  10 |   /**
  11 |    * Passed to the Rust scanner. If true, the backend may flatten directory structure.
  12 |    * Folder grouping in the UI still uses the returned file paths.
  13 |    */
  14 |   flatten: boolean;
  15 | }
  16 | 
  17 | /**
  18 |  * Legacy types (kept for backward compatibility with older notes/components).
  19 |  * If you no longer need them, feel free to remove.
  20 |  */
  21 | export interface WorkspaceState {
  22 |   id: string;
  23 |   name: string;
  24 |   projectRoot: string;
  25 |   tsConfigPath: string | null;
  26 |   selectedGroupId: string | null;
  27 | 
  28 |   skeletonMode: SkeletonMode;
  29 |   redactions: string[];
  30 |   skeletonTargets: string[];
  31 | 
  32 |   showLineNumbers: boolean;
  33 |   removeComments: boolean;
  34 | }
</file>

