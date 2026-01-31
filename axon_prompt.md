# Context Map
- G:/Lesgo Coding Projects/axon/client-axon/src/App.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/AppRoutes.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/layouts/MainLayout.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useToggle.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/FileNode.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphCanvas.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphToolbar.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GroupNode.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/NodeContextMenu.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/CreateWorkspaceCard/CreateWorkspaceCard.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Explorer/FileTree.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/FileSelector/FileSelectorModal.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/FileViewer/FileViewer.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/GroupConfigView.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/InspectorPanel.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/RootConfigView.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/LibraryHub/WorkspaceCommandPalette.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/LibraryHub/WorkspaceGrid.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Sidebar/Sidebar.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Modal.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Surface.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Typography.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useAxonCore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useFileSystem.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/themeSlice.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/useTheme.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/visualizer/useGraphLayout.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/useLibrary.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/useWorkspace.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/workspacesSlice.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/pages/LibraryHubPage.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/pages/WelcomePage.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/pages/WorkspacePage.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/theme/GlobalStyles.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/theme/themes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/axonTypes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/themeTypes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/workspaceTypes.ts

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/App.tsx">
   1 | import { BrowserRouter } from 'react-router-dom'; // Using BrowserRouter for standard web behavior
   2 | import { ThemeProvider } from 'styled-components';
   3 | import { useAppSelector } from './app/hooks';
   4 | import { selectCurrentTheme } from '@features/theme/themeSlice';
   5 | import { GlobalStyles } from '@theme/GlobalStyles';
   6 | import { AppRoutes } from './app/AppRoutes';
   7 | 
   8 | function App() {
   9 |   const theme = useAppSelector(selectCurrentTheme);
  10 | 
  11 |   return (
  12 |     <ThemeProvider theme={theme}>
  13 |       <GlobalStyles theme={theme}/>
  14 |       <BrowserRouter> 
  15 |         <AppRoutes />
  16 |       </BrowserRouter>
  17 |     </ThemeProvider>
  18 |   );
  19 | }
  20 | 
  21 | export default App;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/AppRoutes.tsx">
   1 | import { Routes, Route, Navigate } from "react-router-dom";
   2 | import { MainLayout } from "./layouts/MainLayout";
   3 | import { WelcomePage } from "@pages/WelcomePage";
   4 | import { WorkspacePage } from "@pages/WorkspacePage";
   5 | import { LibraryHubPage } from "@pages/LibraryHubPage";
   6 | import { useLibrary } from "@features/workspace/useLibrary";
   7 | import { Sidebar } from "@components/Sidebar/Sidebar";
   8 | 
   9 | export const AppRoutes = () => {
  10 |   const { activeId } = useLibrary();
  11 | 
  12 |   return (
  13 |     <Routes>
  14 |       <Route element={<MainLayout sidebar={<Sidebar />} />}>
  15 |         <Route path="/" element={activeId ? <Navigate to="/workspace" /> : <WelcomePage />} />
  16 |         <Route path="/workspace" element={activeId ? <WorkspacePage /> : <Navigate to="/" />} />
  17 | 
  18 |         <Route path="/hub" element={<LibraryHubPage />} />
  19 | 
  20 |         <Route path="*" element={<Navigate to="/" />} />
  21 |       </Route>
  22 |     </Routes>
  23 |   );
  24 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts">
   1 | import {type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
   2 | import type { AppDispatch, RootState } from '../store';
   3 | 
   4 | export const useAppDispatch = () => useDispatch<AppDispatch>();
   5 | export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/layouts/MainLayout.tsx">
   1 | import React from 'react';
   2 | import styled from 'styled-components';
   3 | import { Surface } from '@components/ui/Surface';
   4 | import { Outlet } from 'react-router-dom';
   5 | 
   6 | const LayoutContainer = styled.div`
   7 |   display: flex;
   8 |   width: 100vw;
   9 |   height: 100vh;
  10 |   overflow: hidden;
  11 | `;
  12 | 
  13 | const SidebarContainer = styled(Surface)`
  14 |   width: 60px; /* Collapsed width */
  15 |   height: 100%;
  16 |   display: flex;
  17 |   flex-direction: column;
  18 |   align-items: center;
  19 |   z-index: 10;
  20 |   /* Sidebar is usually 'surface' color */
  21 |   border-right: 1px solid ${({ theme }) => theme.colors.border};
  22 | `;
  23 | 
  24 | const ContentArea = styled.main`
  25 |   flex: 1;
  26 |   position: relative;
  27 |   background-color: ${({ theme }) => theme.colors.bg.main};
  28 |   /* The canvas will live here */
  29 | `;
  30 | 
  31 | export const MainLayout = ({ sidebar }: { sidebar?: React.ReactNode }) => {
  32 |   return (
  33 |     <LayoutContainer>
  34 |       {/* Sidebar Slot */}
  35 |       <SidebarContainer $variant="surface" $radius="none" $padding={0}>
  36 |         {sidebar}
  37 |       </SidebarContainer>
  38 | 
  39 |       {/* Main Content Slot */}
  40 |       <ContentArea>
  41 |         <Outlet /> {/* 👈 This renders the WelcomePage or WorkspacePage! */}
  42 |       </ContentArea>
  43 |     </LayoutContainer>
  44 |   );
  45 | };
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts">
   1 | import {type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
   2 | import type { AppDispatch, RootState } from '../store';
   3 | 
   4 | export const useAppDispatch = () => useDispatch<AppDispatch>();
   5 | export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useToggle.ts">
   1 | import { useState, useCallback, useRef, useEffect } from "react";
   2 | import type { SyntheticEvent } from "react";
   3 | 
   4 | type ToggleEvent = SyntheticEvent | Event;
   5 | 
   6 | export interface UseToggleOptions {
   7 |   initialOpen?: boolean;
   8 |   initialLocked?: boolean;
   9 |   preventDefault?: boolean;
  10 |   stopPropagation?: boolean;
  11 |   onOpen?: (e?: ToggleEvent) => void;
  12 |   onClose?: (e?: ToggleEvent) => void;
  13 |   onLock?: (e?: ToggleEvent) => void;
  14 |   onUnlock?: (e?: ToggleEvent) => void;
  15 | }
  16 | 
  17 | export interface UseToggleResult {
  18 |   isOpen: boolean;
  19 |   isLocked: boolean;
  20 |   open: (e?: ToggleEvent) => void;
  21 |   close: (e?: ToggleEvent) => void;
  22 |   toggle: (e?: ToggleEvent) => void;
  23 |   lock: (e?: ToggleEvent) => void;
  24 |   unlock: (e?: ToggleEvent) => void;
  25 |   toggleLock: (e?: ToggleEvent) => void;
  26 |   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  27 |   setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  28 | }
  29 | 
  30 | export const useToggle = ({
  31 |   initialOpen = false,
  32 |   initialLocked = false,
  33 |   preventDefault = false,
  34 |   stopPropagation = false,
  35 |   onOpen,
  36 |   onClose,
  37 |   onLock,
  38 |   onUnlock,
  39 | }: UseToggleOptions = {}): UseToggleResult => {
  40 |   const [isOpen, setOpen] = useState(initialOpen);
  41 |   const [isLocked, setLocked] = useState(initialLocked);
  42 | 
  43 |   const callbacksRef = useRef({ onOpen, onClose, onLock, onUnlock });
  44 | 
  45 |   useEffect(() => {
  46 |     callbacksRef.current = { onOpen, onClose, onLock, onUnlock };
  47 |   });
  48 | 
  49 |   const handleEvent = useCallback(
  50 |     (e?: ToggleEvent) => {
  51 |       if (!e) return;
  52 |       if (preventDefault && 'preventDefault' in e) e.preventDefault();
  53 |       if (stopPropagation && 'stopPropagation' in e) e.stopPropagation();
  54 |     },
  55 |     [preventDefault, stopPropagation]
  56 |   );
  57 | 
  58 |   const open = useCallback(
  59 |     (e?: ToggleEvent) => {
  60 |       handleEvent(e);
  61 |       if (!isLocked) {
  62 |         setOpen(true);
  63 |         callbacksRef.current.onOpen?.(e);
  64 |       }
  65 |     },
  66 |     [isLocked, handleEvent]
  67 |   );
  68 | 
  69 |   const close = useCallback(
  70 |     (e?: ToggleEvent) => {
  71 |       handleEvent(e);
  72 |       if (!isLocked) {
  73 |         setOpen(false);
  74 |         callbacksRef.current.onClose?.(e);
  75 |       }
  76 |     },
  77 |     [isLocked, handleEvent]
  78 |   );
  79 | 
  80 |   const toggle = useCallback(
  81 |     (e?: ToggleEvent) => {
  82 |       handleEvent(e);
  83 |       if (isLocked) return;
  84 | 
  85 |       setOpen((prev) => {
  86 |         const newState = !prev;
  87 |         if (newState) {
  88 |           callbacksRef.current.onOpen?.(e);
  89 |         } else {
  90 |           callbacksRef.current.onClose?.(e);
  91 |         }
  92 |         return newState;
  93 |       });
  94 |     },
  95 |     [isLocked, handleEvent]
  96 |   );
  97 | 
  98 |   const lock = useCallback(
  99 |     (e?: ToggleEvent) => {
 100 |       handleEvent(e);
 101 |       setLocked(true);
 102 |       callbacksRef.current.onLock?.(e);
 103 |     },
 104 |     [handleEvent]
 105 |   );
 106 | 
 107 |   const unlock = useCallback(
 108 |     (e?: ToggleEvent) => {
 109 |       handleEvent(e);
 110 |       setLocked(false);
 111 |       callbacksRef.current.onUnlock?.(e);
 112 |     },
 113 |     [handleEvent]
 114 |   );
 115 | 
 116 |   const toggleLock = useCallback(
 117 |     (e?: ToggleEvent) => {
 118 |       handleEvent(e);
 119 |       setLocked((prev) => {
 120 |         const newState = !prev;
 121 |         if (newState) {
 122 |           callbacksRef.current.onLock?.(e);
 123 |         } else {
 124 |           callbacksRef.current.onUnlock?.(e);
 125 |         }
 126 |         return newState;
 127 |       });
 128 |     },
 129 |     [handleEvent]
 130 |   );
 131 | 
 132 |   return {
 133 |     isOpen,
 134 |     isLocked,
 135 |     open,
 136 |     close,
 137 |     toggle,
 138 |     lock,
 139 |     unlock,
 140 |     toggleLock,
 141 |     setOpen,
 142 |     setLocked,
 143 |   };
 144 | };
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/FileNode.tsx">
   1 | import  { memo } from 'react';
   2 | import { Handle, Position, type NodeProps } from '@xyflow/react';
   3 | import styled from 'styled-components';
   4 | import { VscCode, VscSymbolMethod, VscSymbolVariable } from 'react-icons/vsc';
   5 | import type { AxonNode } from '@axon-types/axonTypes';
   6 | 
   7 | const NodeContainer = styled.div<{ $selected?: boolean }>`
   8 |   background: #252526;
   9 |   border: 1px solid ${props => props.$selected ? '#007acc' : '#454545'};
  10 |   border-radius: 4px;
  11 |   padding: 12px;
  12 |   color: #cccccc;
  13 |   min-width: 200px;
  14 |   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  15 |   box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  16 |   transition: border-color 0.2s ease;
  17 | `;
  18 | 
  19 | const NodeHeader = styled.div`
  20 |   display: flex;
  21 |   align-items: center;
  22 |   gap: 8px;
  23 |   border-bottom: 1px solid #333;
  24 |   padding-bottom: 8px;
  25 |   margin-bottom: 8px;
  26 |   font-weight: 600;
  27 |   font-size: 13px;
  28 |   color: #e1e1e1;
  29 | `;
  30 | 
  31 | const SymbolList = styled.div`
  32 |   display: flex;
  33 |   flex-direction: column;
  34 |   gap: 4px;
  35 | `;
  36 | 
  37 | const SymbolTag = styled.div`
  38 |   display: flex;
  39 |   align-items: center;
  40 |   gap: 6px;
  41 |   background: #1e1e1e;
  42 |   border: 1px solid #333;
  43 |   padding: 2px 8px;
  44 |   border-radius: 3px;
  45 |   font-size: 11px;
  46 |   color: #4fc1ff; /* VS Code Function Blue */
  47 |   
  48 |   svg {
  49 |     flex-shrink: 0;
  50 |     color: #b4a7d6; /* Purple for methods */
  51 |   }
  52 | `;
  53 | 
  54 | const CallTag = styled(SymbolTag)`
  55 |   color: #9cdcfe; /* Light blue for variables/calls */
  56 |   border-style: dashed;
  57 | `;
  58 | 
  59 | const SectionLabel = styled.div`
  60 |   font-size: 9px;
  61 |   text-transform: uppercase;
  62 |   color: #666;
  63 |   margin: 4px 0;
  64 |   font-weight: bold;
  65 | `;
  66 | 
  67 | export const FileNode = memo(({ data, selected }: NodeProps<AxonNode>) => {
  68 |   return (
  69 |     <NodeContainer $selected={selected}>
  70 |       <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  71 |       
  72 |       <NodeHeader>
  73 |         <VscCode size={16} color="#519aba" />
  74 |         <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
  75 |           {data.label as string}
  76 |         </span>
  77 |       </NodeHeader>
  78 | 
  79 |       {/* Definitions Section */}
  80 |       {data.definitions && (data.definitions as string[]).length > 0 && (
  81 |         <>
  82 |           <SectionLabel>Exports/Definitions</SectionLabel>
  83 |           <SymbolList>
  84 |             {(data.definitions as string[]).slice(0, 3).map((def) => (
  85 |               <SymbolTag key={def}>
  86 |                 <VscSymbolMethod size={12} />
  87 |                 {def}
  88 |               </SymbolTag>
  89 |             ))}
  90 |             {(data.definitions as string[]).length > 3 && (
  91 |               <div style={{ fontSize: '10px', color: '#555', paddingLeft: '4px' }}>
  92 |                 + {(data.definitions as string[]).length - 3} more
  93 |               </div>
  94 |             )}
  95 |           </SymbolList>
  96 |         </>
  97 |       )}
  98 | 
  99 |       {/* Calls Section (Optional) */}
 100 |       {data.calls && (data.calls as string[]).length > 0 && (
 101 |         <>
 102 |           <SectionLabel>Key Dependencies</SectionLabel>
 103 |           <SymbolList>
 104 |             {(data.calls as string[]).slice(0, 2).map((call) => (
 105 |               <CallTag key={call}>
 106 |                 <VscSymbolVariable size={12} />
 107 |                 {call}
 108 |               </CallTag>
 109 |             ))}
 110 |           </SymbolList>
 111 |         </>
 112 |       )}
 113 | 
 114 |       <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
 115 |     </NodeContainer>
 116 |   );
 117 | });
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphCanvas.tsx">
   1 | import { useCallback, useMemo, useState } from 'react';
   2 | import {
   3 |   ReactFlow,
   4 |   MiniMap,
   5 |   Controls,
   6 |   Background,
   7 |   BackgroundVariant,
   8 |   addEdge,
   9 |   type Connection,
  10 |   type NodeMouseHandler,
  11 |   useOnSelectionChange,
  12 | } from '@xyflow/react';
  13 | import '@xyflow/react/dist/style.css';
  14 | import styled from 'styled-components';
  15 | 
  16 | import { FileNode } from './FileNode';
  17 | import { GroupNode } from './GroupNode';
  18 | import { NodeContextMenu } from './NodeContextMenu';
  19 | import { GraphToolbar } from './GraphToolbar';
  20 | import { useWorkspace } from '@features/workspace/useWorkspace';
  21 | import { nanoid } from '@reduxjs/toolkit';
  22 | import { useGraphLayout } from '@features/visualizer/useGraphLayout';
  23 | import { useAppDispatch } from '@app/hooks';
  24 | import { setSelectedNode } from '@features/workspace/workspacesSlice';
  25 | const CanvasContainer = styled.div`
  26 |   width: 100%;
  27 |   height: 100%;
  28 |   background-color: ${({ theme }) => theme.colors.bg.main};
  29 |   
  30 |   /* Force React Flow to inherit theme fonts */
  31 |   .react-flow__node { font-family: ${({ theme }) => theme.typography.fontFamily}; }
  32 | `;
  33 | 
  34 | const SelectionListener = () => {
  35 |   const dispatch = useAppDispatch();
  36 | 
  37 |   useOnSelectionChange({
  38 |     onChange: ({ nodes }) => {
  39 |       const selectedId = nodes.length > 0 ? nodes[0].id : null;
  40 |       dispatch(setSelectedNode(selectedId));
  41 |     },
  42 |   });
  43 | 
  44 |   return null; // It renders nothing, just listens
  45 | };
  46 | 
  47 | export const GraphCanvas = () => {
  48 |   const { createGroup } = useWorkspace();
  49 |   
  50 |   const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useGraphLayout();
  51 | 
  52 |   const [menu, setMenu] = useState<{ x: number; y: number; node: any } | null>(null);
  53 | 
  54 |   const nodeTypes = useMemo(() => ({
  55 |     fileNode: FileNode,
  56 |     groupNode: GroupNode,
  57 |   }), []);
  58 | 
  59 | 
  60 |   const onConnect = useCallback((params: Connection) => {
  61 |     setEdges((eds) => addEdge(params, eds));
  62 |   }, [setEdges]);
  63 | 
  64 |   const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
  65 |     event.preventDefault();
  66 |     if (node.type === 'fileNode') {
  67 |       setMenu({
  68 |         x: event.clientX,
  69 |         y: event.clientY,
  70 |         node, // Pass the raw node data for extraction
  71 |       });
  72 |     }
  73 |   }, []);
  74 | 
  75 |   const onPaneClick = useCallback(() => setMenu(null), []);
  76 | 
  77 |   const handleExtractGroup = (node: any) => {
  78 |     const path = node.data.path;
  79 |     if (path) {
  80 |       createGroup({
  81 |         id: nanoid(),
  82 |         name: `${node.data.label} Scope`,
  83 |         entryPoint: path,
  84 |         depth: 2,
  85 |         isActive: true,
  86 |         flatten: true
  87 |       });
  88 |     }
  89 |     setMenu(null);
  90 |   };
  91 | 
  92 |   
  93 | 
  94 |   return (
  95 |     <CanvasContainer>
  96 |       <ReactFlow
  97 |         nodes={nodes}
  98 |         edges={edges}
  99 |         onNodesChange={onNodesChange}
 100 |         onEdgesChange={onEdgesChange}
 101 |         onConnect={onConnect}
 102 |         onNodeContextMenu={onNodeContextMenu}
 103 |         onPaneClick={onPaneClick}
 104 |         nodeTypes={nodeTypes}
 105 |         fitView
 106 |         minZoom={0.1}
 107 |         proOptions={{ hideAttribution: true }}
 108 |       >
 109 |         <SelectionListener />
 110 |         <GraphToolbar /> 
 111 |         
 112 |         {menu && (
 113 |           <NodeContextMenu
 114 |             top={menu.y}
 115 |             left={menu.x}
 116 |             node={menu.node}
 117 |             onClose={() => setMenu(null)}
 118 |             onExtractGroup={handleExtractGroup}
 119 |           />
 120 |         )}
 121 | 
 122 |         <Controls style={{ background: '#2d2d2d', fill: '#fff', border: 'none' }} />
 123 |         <MiniMap 
 124 |           zoomable 
 125 |           pannable 
 126 |           style={{ background: '#252526', border: '1px solid #454545' }}
 127 |           nodeColor={(n) => n.type === 'groupNode' ? '#2d2d2d' : '#007acc'} 
 128 |         />
 129 |         <Background 
 130 |           variant={BackgroundVariant.Dots} 
 131 |           gap={24} 
 132 |           size={1} 
 133 |           color="#444" 
 134 |         />
 135 |       </ReactFlow>
 136 |     </CanvasContainer>
 137 |   );
 138 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphToolbar.tsx">
   1 | import styled from 'styled-components';
   2 | import { Panel } from '@xyflow/react';
   3 | import { VscAdd, VscExport } from 'react-icons/vsc';
   4 | import { useWorkspace } from '@features/workspace/useWorkspace';
   5 | import { useAxonCore } from '@features/axon/useAxonCore';
   6 | import { nanoid } from '@reduxjs/toolkit';
   7 | 
   8 | const ToolbarContainer = styled.div`
   9 |   display: flex;
  10 |   gap: 8px;
  11 | `;
  12 | 
  13 | const ToolButton = styled.button<{ $primary?: boolean }>`
  14 |   background: ${({ theme, $primary }) => 
  15 |     $primary ? theme.colors.palette.primary : theme.colors.bg.surface};
  16 |   color: ${({ theme, $primary }) => 
  17 |     $primary ? '#fff' : theme.colors.text.primary};
  18 |   border: 1px solid ${({ theme, $primary }) => 
  19 |     $primary ? 'transparent' : theme.colors.border};
  20 |   padding: 8px 12px;
  21 |   border-radius: 4px;
  22 |   cursor: pointer;
  23 |   display: flex;
  24 |   align-items: center;
  25 |   gap: 8px;
  26 |   font-size: 13px;
  27 |   font-weight: 500;
  28 |   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  29 |   transition: all 0.2s;
  30 | 
  31 |   &:hover {
  32 |     transform: translateY(-1px);
  33 |     filter: brightness(1.1);
  34 |   }
  35 | `;
  36 | 
  37 | export const GraphToolbar = () => {
  38 |   const { groups, projectRoot, config, createGroup } = useWorkspace();
  39 |   const { generateCombinedPrompt } = useAxonCore();
  40 | 
  41 |   const handleAddGroup = () => {
  42 |     createGroup({
  43 |       id: nanoid(),
  44 |       name: 'New Scope',
  45 |       entryPoint: "", 
  46 |       depth: 3,
  47 |       isActive: true,
  48 |       flatten: true,
  49 |     });
  50 |   };
  51 | 
  52 |   const handleBundle = async () => {
  53 |     if (!projectRoot) return;
  54 |     const activeGroups = groups.filter(g => g.isActive && g.entryPoint);
  55 |     
  56 |     if (activeGroups.length === 0) {
  57 |       alert("No active groups to bundle!");
  58 |       return;
  59 |     }
  60 |     console.log()
  61 |     try {
  62 |       const markdown = await generateCombinedPrompt({
  63 |         projectRoot,
  64 |         groups: activeGroups.map(g => ({ entryPoint: g.entryPoint!, depth: g.depth || 3, flatten: g.flatten })),
  65 |         options: config!
  66 |       });
  67 |       await navigator.clipboard.writeText(markdown);
  68 |       alert(`Copied ${activeGroups.length} groups to clipboard!`);
  69 |     } catch (err) {
  70 |       console.error("Bundle failed", err);
  71 |     }
  72 |   };
  73 | 
  74 |   return (
  75 |     <Panel position="top-right">
  76 |       <ToolbarContainer>
  77 |         <ToolButton onClick={handleAddGroup}>
  78 |           <VscAdd /> Add Group
  79 |         </ToolButton>
  80 |         <ToolButton $primary onClick={handleBundle}>
  81 |           <VscExport /> Bundle & Copy
  82 |         </ToolButton>
  83 |       </ToolbarContainer>
  84 |     </Panel>
  85 |   );
  86 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GroupNode.tsx">
   1 | import { memo, useState, useCallback } from 'react';
   2 | import { Handle, Position, type NodeProps } from '@xyflow/react';
   3 | import styled from 'styled-components';
   4 | import { VscFolderOpened, VscPlay, VscSearch, VscSettings } from 'react-icons/vsc';
   5 | import type { AxonNode } from '@axon-types/axonTypes';
   6 | import { useFileSystem } from '@features/axon/useFileSystem';
   7 | import { useToggle } from '@app/hooks';
   8 | import { useWorkspace } from '@features/workspace/useWorkspace';
   9 | import { FileSelectorModal } from '@components/FileSelector/FileSelectorModal';
  10 | 
  11 | const NodeContainer = styled.div<{ $isConfig?: boolean; $selected?: boolean }>`
  12 |   /* Base Glassmorphism */
  13 |   background: ${props => props.$isConfig 
  14 |     ? props.theme.colors.bg.surface 
  15 |     : 'rgba(30, 30, 30, 0.4)'};
  16 |   
  17 |   /* Borders: Dashed for View Mode, Solid for Config Mode */
  18 |   border: ${props => props.$isConfig 
  19 |     ? `1px solid ${props.theme.colors.border}` 
  20 |     : `2px dashed ${props.$selected ? props.theme.colors.palette.primary : '#444'}`};
  21 |   
  22 |   /* Selection Glow */
  23 |   box-shadow: ${props => props.$selected 
  24 |     ? `0 0 0 2px ${props.theme.colors.palette.primary}40` 
  25 |     : 'none'};
  26 | 
  27 |   border-radius: 8px;
  28 |   padding: 12px;
  29 |   min-width: ${props => props.$isConfig ? '280px' : '100%'};
  30 |   min-height: ${props => props.$isConfig ? 'auto' : '100%'};
  31 |   color: ${props => props.theme.colors.text.secondary};
  32 |   transition: all 0.2s ease;
  33 |   
  34 |   /* Prevent dragging when interacting with inputs */
  35 |   .nodrag {
  36 |     cursor: default;
  37 |   }
  38 | `;
  39 | 
  40 | const Header = styled.div`
  41 |   display: flex;
  42 |   align-items: center;
  43 |   gap: 8px;
  44 |   font-weight: 600;
  45 |   font-size: 14px;
  46 |   margin-bottom: 8px;
  47 |   color: ${({ theme }) => theme.colors.text.primary};
  48 | `;
  49 | 
  50 | const InputGroup = styled.div`
  51 |   margin-bottom: 12px;
  52 |   
  53 |   label {
  54 |     display: block;
  55 |     font-size: 11px;
  56 |     color: ${({ theme }) => theme.colors.text.muted};
  57 |     margin-bottom: 6px;
  58 |     text-transform: uppercase;
  59 |     font-weight: 700;
  60 |   }
  61 | `;
  62 | 
  63 | const InputRow = styled.div`
  64 |   display: flex; 
  65 |   gap: 6px;
  66 | `;
  67 | 
  68 | const StyledInput = styled.input`
  69 |   width: 100%;
  70 |   background: ${({ theme }) => theme.colors.bg.input};
  71 |   border: 1px solid ${({ theme }) => theme.colors.border};
  72 |   color: ${({ theme }) => theme.colors.text.primary};
  73 |   padding: 8px;
  74 |   border-radius: 4px;
  75 |   font-size: 12px;
  76 |   
  77 |   &:focus {
  78 |     outline: none;
  79 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  80 |   }
  81 | `;
  82 | 
  83 | const IconButton = styled.button`
  84 |   background: ${({ theme }) => theme.colors.bg.overlay};
  85 |   border: 1px solid ${({ theme }) => theme.colors.border};
  86 |   color: ${({ theme }) => theme.colors.text.secondary};
  87 |   border-radius: 4px;
  88 |   padding: 0 10px;
  89 |   cursor: pointer;
  90 |   display: flex;
  91 |   align-items: center;
  92 |   justify-content: center;
  93 | 
  94 |   &:hover {
  95 |     background: ${({ theme }) => theme.colors.bg.surface};
  96 |     color: ${({ theme }) => theme.colors.text.primary};
  97 |   }
  98 | `;
  99 | 
 100 | const ActionButton = styled.button`
 101 |   background: ${({ theme }) => theme.colors.palette.primary};
 102 |   color: white;
 103 |   border: none;
 104 |   padding: 8px 12px;
 105 |   border-radius: 4px;
 106 |   font-size: 12px;
 107 |   font-weight: 600;
 108 |   cursor: pointer;
 109 |   display: flex;
 110 |   align-items: center;
 111 |   justify-content: center;
 112 |   gap: 6px;
 113 |   width: 100%;
 114 |   margin-top: 8px;
 115 | 
 116 |   &:hover {
 117 |     filter: brightness(1.1);
 118 |   }
 119 | `;
 120 | 
 121 | 
 122 | export const GroupNode = memo(({ id, data, selected }: NodeProps<AxonNode>) => {
 123 |   const { projectRoot, modifyGroup } = useWorkspace();
 124 |   
 125 |   const { isOpen, open, close } = useToggle();
 126 |   const fs = useFileSystem(projectRoot || null);
 127 | 
 128 |   const [entryPoint, setEntryPoint] = useState((data.entryPoint as string) || '');
 129 |   const [depth, setDepth] = useState<number>(data.depth || 3);
 130 |   
 131 |   const isConfigMode = !data.entryPoint; 
 132 | 
 133 |   const handleScan = useCallback(() => {
 134 |     if (!entryPoint) return;
 135 | 
 136 |     modifyGroup(id, {
 137 |       name: entryPoint, // Use filename as default name
 138 |       entryPoint,
 139 |       depth,
 140 |     });
 141 |   }, [entryPoint, depth, id, modifyGroup]);
 142 | 
 143 |   const handleBrowse = () => {
 144 |     fs.refresh();
 145 |     open();
 146 |   };
 147 | 
 148 |   return (
 149 |     <NodeContainer $isConfig={isConfigMode} $selected={selected}>
 150 |       {/* Invisible Target Handle for connections */}
 151 |       <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
 152 | 
 153 |       <Header>
 154 |         {isConfigMode ? <VscFolderOpened color="#dcb67a" /> : <VscSettings size={12} />}
 155 |         {/* If scanned, show label. If configuring, show "New Group" */}
 156 |         <span>{isConfigMode ? "Configure Scope" : (data.label as string)}</span>
 157 |       </Header>
 158 | 
 159 |       {isConfigMode ? (
 160 |         <div className="nodrag">
 161 |           <InputGroup>
 162 |             <label>Entry Point</label>
 163 |             <InputRow>
 164 |               <StyledInput 
 165 |                 type="text" 
 166 |                 value={entryPoint}
 167 |                 onChange={(e) => setEntryPoint(e.target.value)}
 168 |                 placeholder="src/App.tsx"
 169 |               />
 170 |               <IconButton onClick={handleBrowse} title="Browse Files">
 171 |                 <VscSearch />
 172 |               </IconButton>
 173 |             </InputRow>
 174 |           </InputGroup>
 175 |           
 176 |           <InputGroup>
 177 |             <label>Scan Depth</label>
 178 |             <StyledInput 
 179 |               type="number" 
 180 |               value={depth}
 181 |               onChange={(e) => setDepth(Number(e.target.value))}
 182 |               min="1" 
 183 |               max="10"
 184 |             />
 185 |           </InputGroup>
 186 | 
 187 |           <ActionButton onClick={handleScan}>
 188 |             <VscPlay />
 189 |             Scan Group
 190 |           </ActionButton>
 191 | 
 192 |           {/* Reusable Modal */}
 193 |           <FileSelectorModal 
 194 |             isOpen={isOpen}
 195 |             toggle={close}
 196 |             fs={fs}
 197 |             mode="file"
 198 |             onSelect={(path) => setEntryPoint(path)}
 199 |           />
 200 |         </div>
 201 |       ) : (
 202 |         /* View Mode: Empty container that holds the children visually */
 203 |         <div style={{ padding: '4px', fontSize: '10px', opacity: 0.5 }}>
 204 |            {/* We can put metrics here later, e.g. "15 Files" */}
 205 |         </div>
 206 |       )}
 207 | 
 208 |       <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
 209 |     </NodeContainer>
 210 |   );
 211 | });
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/NodeContextMenu.tsx">
   1 | import  { memo } from 'react';
   2 | import styled from 'styled-components';
   3 | import { VscGitPullRequestCreate, VscSplitHorizontal } from 'react-icons/vsc';
   4 | 
   5 | const MenuContainer = styled.div`
   6 |   position: fixed; /* Fixed to the viewport, not the canvas */
   7 |   z-index: 10000;
   8 |   width: 220px;
   9 |   background: #252526;
  10 |   border: 1px solid #454545;
  11 |   box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  12 |   border-radius: 6px;
  13 |   padding: 4px 0;
  14 |   display: flex;
  15 |   flex-direction: column;
  16 | `;
  17 | 
  18 | const MenuItem = styled.button`
  19 |   background: transparent;
  20 |   border: none;
  21 |   color: #cccccc;
  22 |   text-align: left;
  23 |   padding: 8px 12px;
  24 |   cursor: pointer;
  25 |   display: flex;
  26 |   align-items: center;
  27 |   gap: 10px;
  28 |   font-size: 13px;
  29 |   font-family: 'Segoe UI', sans-serif;
  30 | 
  31 |   &:hover {
  32 |     background: #094771; /* VS Code Highlight Blue */
  33 |     color: white;
  34 |   }
  35 | 
  36 |   svg {
  37 |     font-size: 14px;
  38 |     color: #a0a0a0;
  39 |   }
  40 | `;
  41 | 
  42 | const Divider = styled.div`
  43 |   height: 1px;
  44 |   background: #3e3e42;
  45 |   margin: 4px 0;
  46 | `;
  47 | 
  48 | interface NodeContextMenuProps {
  49 |   top: number;
  50 |   left: number;
  51 |   node: any;
  52 |   onClose: () => void;
  53 |   onExtractGroup: (node: any) => void;
  54 | }
  55 | 
  56 | export const NodeContextMenu = memo(({ top, left, node, onClose, onExtractGroup }: NodeContextMenuProps) => {
  57 |   return (
  58 |     <>
  59 |       {/* Invisible backdrop to close menu when clicking outside */}
  60 |       <div 
  61 |         style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }} 
  62 |         onClick={onClose} 
  63 |         onContextMenu={(e) => { e.preventDefault(); onClose(); }}
  64 |       />
  65 |       
  66 |       <MenuContainer style={{ top, left }}>
  67 |         <MenuItem onClick={() => onExtractGroup(node)}>
  68 |           <VscGitPullRequestCreate /> Extract to New Group
  69 |         </MenuItem>
  70 |         
  71 |         {/* You can add more options here later! */}
  72 |         <Divider />
  73 |         <MenuItem onClick={onClose}>
  74 |           <VscSplitHorizontal /> Close Menu
  75 |         </MenuItem>
  76 |       </MenuContainer>
  77 |     </>
  78 |   );
  79 | });
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/CreateWorkspaceCard/CreateWorkspaceCard.tsx">
   1 | import { useState } from 'react';
   2 | import styled from 'styled-components';
   3 | import { Surface } from '@components/ui/Surface';
   4 | import { Heading } from '@components/ui/Typography';
   5 | import { VscFolder, VscRocket } from 'react-icons/vsc';
   6 | import { useToggle } from '@app/hooks';
   7 | import { useFileSystem } from '@features/axon/useFileSystem';
   8 | import { FileSelectorModal } from '@components/FileSelector/FileSelectorModal';
   9 | import { useNavigate } from 'react-router-dom';
  10 | import { useLibrary } from '@features/workspace/useLibrary';
  11 | 
  12 | const Form = styled.div`
  13 |   display: flex;
  14 |   flex-direction: column;
  15 |   gap: 16px;
  16 |   width: 100%;
  17 | `;
  18 | 
  19 | const FormGroup = styled.div`
  20 |   display: flex;
  21 |   flex-direction: column;
  22 |   gap: 6px;
  23 |   
  24 |   label {
  25 |     font-size: 12px;
  26 |     color: ${({ theme }) => theme.colors.text.muted};
  27 |     text-transform: uppercase;
  28 |     font-weight: 600;
  29 |   }
  30 | `;
  31 | 
  32 | const Input = styled.input`
  33 |   background: ${({ theme }) => theme.colors.bg.input};
  34 |   border: 1px solid ${({ theme }) => theme.colors.border};
  35 |   color: ${({ theme }) => theme.colors.text.primary};
  36 |   padding: 10px;
  37 |   border-radius: 4px;
  38 |   font-size: 14px;
  39 | 
  40 |   &:focus {
  41 |     outline: none;
  42 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  43 |   }
  44 | `;
  45 | 
  46 | const PathInputGroup = styled.div`
  47 |   display: flex;
  48 |   gap: 8px;
  49 | `;
  50 | 
  51 | const Button = styled.button`
  52 |   background: ${({ theme }) => theme.colors.palette.primary};
  53 |   color: white;
  54 |   border: none;
  55 |   padding: 12px;
  56 |   border-radius: 6px;
  57 |   font-weight: 600;
  58 |   cursor: pointer;
  59 |   display: flex;
  60 |   align-items: center;
  61 |   justify-content: center;
  62 |   gap: 8px;
  63 |   margin-top: 10px;
  64 | 
  65 |   &:hover { background: ${({ theme }) => theme.colors.palette.secondary}; }
  66 |   &:disabled { opacity: 0.5; cursor: not-allowed; }
  67 | `;
  68 | 
  69 | export const CreateWorkspaceCard = () => {
  70 |     const navigate = useNavigate()
  71 |   const { create } = useLibrary();
  72 |   
  73 |   const [name, setName] = useState("My Axon Project");
  74 |   const [rootPath, setRootPath] = useState("");
  75 | 
  76 |   const { isOpen, open, close } = useToggle();
  77 |   const fs = useFileSystem("/"); 
  78 | 
  79 |   const handleBrowse = () => {
  80 |     fs.refresh(); 
  81 |     open();
  82 |   };
  83 | 
  84 |   const handleSubmit = () => {
  85 |     if (!name || !rootPath) return;
  86 |     create(name, rootPath); 
  87 |     navigate("/workspace")
  88 |   };
  89 | 
  90 |   return (
  91 |     <Surface $padding={6} style={{ width: '450px' }}>
  92 |       <Heading style={{textAlign: 'center', marginBottom: '30px'}}>
  93 |         Initialize Workspace
  94 |       </Heading>
  95 |       
  96 |       <Form>
  97 |         <FormGroup>
  98 |           <label>Workspace Name</label>
  99 |           <Input 
 100 |             value={name} 
 101 |             onChange={e => setName(e.target.value)} 
 102 |             placeholder="e.g. Gamify Client"
 103 |           />
 104 |         </FormGroup>
 105 | 
 106 |         <FormGroup>
 107 |           <label>Project Root</label>
 108 |           <PathInputGroup>
 109 |             <Input 
 110 |               value={rootPath} 
 111 |               readOnly 
 112 |               placeholder="Select a folder..." 
 113 |               style={{ flex: 1, cursor: 'default' }}
 114 |               onClick={handleBrowse} 
 115 |             />
 116 |             <button 
 117 |                onClick={handleBrowse}
 118 |                style={{
 119 |                  background: '#333', border: '1px solid #444', 
 120 |                  color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '0 12px'
 121 |                }}
 122 |             >
 123 |               <VscFolder />
 124 |             </button>
 125 |           </PathInputGroup>
 126 |         </FormGroup>
 127 | 
 128 |         <Button onClick={handleSubmit} disabled={!rootPath}>
 129 |           <VscRocket /> Launch Axon
 130 |         </Button>
 131 |       </Form>
 132 | 
 133 |       <FileSelectorModal 
 134 |         isOpen={isOpen} 
 135 |         toggle={close} 
 136 |         fs={fs}
 137 |         mode="directory" 
 138 |         onSelect={(path) => setRootPath(path)}
 139 |       />
 140 |     </Surface>
 141 |   );
 142 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Explorer/FileTree.tsx">
   1 | import styled from 'styled-components';
   2 | import { VscFile, VscFolder } from 'react-icons/vsc';
   3 | 
   4 | const List = styled.div`
   5 |   display: flex; 
   6 |   flex-direction: column; 
   7 |   gap: 2px;
   8 | `;
   9 | 
  10 | const Item = styled.div`
  11 |   display: flex; 
  12 |   align-items: center; 
  13 |   gap: 8px;
  14 |   padding: 6px 8px;
  15 |   cursor: pointer;
  16 |   border-radius: 4px;
  17 |   font-size: 13px;
  18 |   color: ${({theme}) => theme.colors.text.secondary};
  19 | 
  20 |   &:hover {
  21 |     background: ${({theme}) => theme.colors.bg.overlay};
  22 |     color: ${({theme}) => theme.colors.text.primary};
  23 |   }
  24 | `;
  25 | 
  26 | interface FileTreeProps {
  27 |   files: any[];
  28 |   onFileClick: (file: any) => void;
  29 |   onDirClick: (dir: any) => void;
  30 | }
  31 | 
  32 | export const FileTree = ({ files, onFileClick, onDirClick }: FileTreeProps) => {
  33 |   return (
  34 |     <List>
  35 |       {files.map((file) => (
  36 |         <Item 
  37 |           key={file.path} 
  38 |           onClick={() => file.is_dir ? onDirClick(file) : onFileClick(file)}
  39 |         >
  40 |           {file.is_dir ? <VscFolder color="#dcb67a" /> : <VscFile />}
  41 |           {file.name}
  42 |         </Item>
  43 |       ))}
  44 |     </List>
  45 |   );
  46 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/FileSelector/FileSelectorModal.tsx">
   1 | import styled from 'styled-components';
   2 | import { Modal } from '@components/ui/Modal';
   3 | import { FileTree } from '@components/Explorer/FileTree';
   4 | import type { useFileSystem } from '@features/axon/useFileSystem';
   5 | 
   6 | interface FileSelectorModalProps {
   7 |   isOpen: boolean;
   8 |   toggle: () => void;
   9 |   fs: ReturnType<typeof useFileSystem>; 
  10 |   mode?: 'file' | 'directory'; 
  11 |   onSelect: (path: string) => void;
  12 | }
  13 | 
  14 | const Footer = styled.div`
  15 |   display: flex;
  16 |   justify-content: flex-end;
  17 |   gap: 10px;
  18 |   margin-top: 15px;
  19 |   padding-top: 15px;
  20 |   border-top: 1px solid ${({ theme }) => theme.colors.border};
  21 | `;
  22 | 
  23 | const Button = styled.button<{ $primary?: boolean }>`
  24 |   background: ${({ theme, $primary }) => $primary ? theme.colors.palette.primary : 'transparent'};
  25 |   color: ${({ theme, $primary }) => $primary ? '#fff' : theme.colors.text.secondary};
  26 |   border: 1px solid ${({ theme, $primary }) => $primary ? theme.colors.palette.primary : theme.colors.border};
  27 |   padding: 6px 12px;
  28 |   border-radius: 4px;
  29 |   cursor: pointer;
  30 |   font-size: 13px;
  31 | 
  32 |   &:hover {
  33 |     background: ${({ theme, $primary }) => $primary ? theme.colors.palette.secondary : theme.colors.bg.overlay};
  34 |   }
  35 | `;
  36 | 
  37 | export const FileSelectorModal = ({ 
  38 |   isOpen, 
  39 |   toggle, 
  40 |   fs, 
  41 |   mode = 'file', 
  42 |   onSelect 
  43 | }: FileSelectorModalProps) => {
  44 | 
  45 |   const handleConfirmDirectory = () => {
  46 |     if (fs.currentPath) {
  47 |       onSelect(fs.currentPath);
  48 |       toggle();
  49 |     }
  50 |   };
  51 | 
  52 |   return (
  53 |     <Modal 
  54 |       isOpen={isOpen} 
  55 |       onClose={toggle} 
  56 |       title={mode === 'directory' ? "Select Root Folder" : "Select File"}
  57 |     >
  58 |       <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
  59 |          <button onClick={fs.navigateUp} disabled={!fs.currentPath}>
  60 |             ⬅ Up Level
  61 |          </button>
  62 |          <div style={{opacity: 0.5, fontSize: '12px', alignSelf: 'center'}}>
  63 |            {fs.currentPath}
  64 |          </div>
  65 |       </div>
  66 | 
  67 |       <FileTree
  68 |         files={fs.files}
  69 |         onDirClick={(dir) => fs.cd(dir.path)}
  70 |         onFileClick={(file) => {
  71 |           if (mode === 'file') {
  72 |              onSelect(file.path);
  73 |              toggle();
  74 |           }
  75 |         }}
  76 |       />
  77 | 
  78 |       {/* Show Footer ONLY for Directory Mode */}
  79 |       {mode === 'directory' && (
  80 |         <Footer>
  81 |           <Button onClick={toggle}>Cancel</Button>
  82 |           <Button $primary onClick={handleConfirmDirectory}>
  83 |             Select Current Folder
  84 |           </Button>
  85 |         </Footer>
  86 |       )}
  87 |     </Modal>
  88 |   );
  89 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/FileViewer/FileViewer.tsx">
   1 | import { useEffect, useState } from 'react';
   2 | import styled from 'styled-components';
   3 | import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
   4 | import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
   5 | import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
   6 | import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // VS Code Dark Theme
   7 | import { useAxonCore } from '@features/axon/useAxonCore';
   8 | import { VscLoading } from 'react-icons/vsc';
   9 | 
  10 | SyntaxHighlighter.registerLanguage('typescript', ts);
  11 | SyntaxHighlighter.registerLanguage('rust', rust);
  12 | 
  13 | const Container = styled.div`
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   height: 100%;
  17 |   overflow: hidden;
  18 |   background: #1e1e1e;
  19 | `;
  20 | 
  21 | const ScrollArea = styled.div`
  22 |   flex: 1;
  23 |   overflow: auto;
  24 |   font-size: 12px;
  25 |   
  26 |   /* Custom scrollbar for code */
  27 |   &::-webkit-scrollbar { width: 10px; height: 10px; }
  28 |   &::-webkit-scrollbar-thumb { background: #444; border-radius: 0; }
  29 | `;
  30 | 
  31 | const MetaBar = styled.div`
  32 |   padding: 8px;
  33 |   background: ${({ theme }) => theme.colors.bg.surface};
  34 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  35 |   font-size: 11px;
  36 |   color: ${({ theme }) => theme.colors.text.muted};
  37 |   display: flex;
  38 |   gap: 12px;
  39 | `;
  40 | 
  41 | interface FileViewerProps {
  42 |   path: string;
  43 | }
  44 | 
  45 | export const FileViewer = ({ path }: FileViewerProps) => {
  46 |   const { readFile } = useAxonCore();
  47 |   const [content, setContent] = useState<string>('');
  48 |   const [loading, setLoading] = useState(false);
  49 |   const [error, setError] = useState<string | null>(null);
  50 | 
  51 |   useEffect(() => {
  52 |     let active = true;
  53 |     
  54 |     const load = async () => {
  55 |       setLoading(true);
  56 |       setError(null);
  57 |       setContent(''); // Clear previous content immediately
  58 |       
  59 |       try {
  60 |         const text = await readFile(path);
  61 |         if (active) setContent(text);
  62 |       } catch (err) {
  63 |         if (active) setError("Could not read file content.");
  64 |       } finally {
  65 |         if (active) setLoading(false);
  66 |       }
  67 |     };
  68 | 
  69 |     if (path) load();
  70 |     return () => { active = false; };
  71 |   }, [path, readFile]);
  72 | 
  73 |   if (loading) return <div style={{padding: 20, textAlign: 'center'}}><VscLoading className="spin" /> Loading...</div>;
  74 |   if (error) return <div style={{padding: 20, color: 'salmon'}}>{error}</div>;
  75 | 
  76 |   return (
  77 |     <Container>
  78 |       <MetaBar>
  79 |         <span>PATH: {path}</span>
  80 |         <span>LINES: {content.split('\n').length}</span>
  81 |       </MetaBar>
  82 |       <ScrollArea>
  83 |         <SyntaxHighlighter 
  84 |           language="typescript" // You can auto-detect ext later
  85 |           style={vs2015}
  86 |           showLineNumbers={true}
  87 |           customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
  88 |           lineNumberStyle={{ opacity: 0.3, minWidth: '30px' }}
  89 |         >
  90 |           {content}
  91 |         </SyntaxHighlighter>
  92 |       </ScrollArea>
  93 |     </Container>
  94 |   );
  95 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/GroupConfigView.tsx">
   1 | import { useState, useEffect } from 'react';
   2 | import styled from 'styled-components';
   3 | import { useWorkspace } from '@features/workspace/useWorkspace';
   4 | import { Heading } from '@components/ui/Typography';
   5 | import { type AxonGroup } from '@axon-types/workspaceTypes';
   6 | import { VscFolderOpened } from 'react-icons/vsc';
   7 | 
   8 | const Container = styled.div`
   9 |   padding: 20px;
  10 |   display: flex;
  11 |   flex-direction: column;
  12 |   gap: 20px;
  13 | `;
  14 | 
  15 | const FormGroup = styled.div`
  16 |   display: flex;
  17 |   flex-direction: column;
  18 |   gap: 8px;
  19 | `;
  20 | 
  21 | const Label = styled.label`
  22 |   font-size: 11px;
  23 |   font-weight: 700;
  24 |   text-transform: uppercase;
  25 |   color: ${({ theme }) => theme.colors.text.muted};
  26 | `;
  27 | 
  28 | const Input = styled.input`
  29 |   background: ${({ theme }) => theme.colors.bg.input};
  30 |   border: 1px solid ${({ theme }) => theme.colors.border};
  31 |   color: ${({ theme }) => theme.colors.text.primary};
  32 |   padding: 8px;
  33 |   border-radius: 4px;
  34 |   &:focus { border-color: ${({ theme }) => theme.colors.palette.primary}; outline: none; }
  35 | `;
  36 | 
  37 | const CheckboxLabel = styled.label`
  38 |   display: flex;
  39 |   align-items: center;
  40 |   gap: 10px;
  41 |   cursor: pointer;
  42 |   font-size: 13px;
  43 |   user-select: none;
  44 | `;
  45 | 
  46 | export const GroupConfigView = ({ group }: { group: AxonGroup }) => {
  47 |   const { modifyGroup } = useWorkspace();
  48 |   
  49 |   const [depth, setDepth] = useState(group.depth || 3);
  50 |   const [entryPoint, setEntryPoint] = useState(group.entryPoint || '');
  51 | 
  52 |   useEffect(() => {
  53 |     setDepth(group.depth || 3);
  54 |     setEntryPoint(group.entryPoint || '');
  55 |   }, [group.id]);
  56 | 
  57 |   const handleBlur = () => {
  58 |     modifyGroup(group.id, { 
  59 |       depth, 
  60 |       entryPoint 
  61 |     });
  62 |   };
  63 | 
  64 |   return (
  65 |     <Container>
  66 |       <Heading><VscFolderOpened /> {group.name}</Heading>
  67 |       
  68 |       <FormGroup>
  69 |         <Label>Entry Point</Label>
  70 |         <Input 
  71 |           value={entryPoint}
  72 |           onChange={(e) => setEntryPoint(e.target.value)}
  73 |           onBlur={handleBlur}
  74 |           placeholder="src/main.rs"
  75 |         />
  76 |       </FormGroup>
  77 | 
  78 |       <FormGroup>
  79 |         <Label>Scan Depth</Label>
  80 |         <Input 
  81 |           type="number"
  82 |           min="1" max="10"
  83 |           value={depth}
  84 |           onChange={(e) => setDepth(Number(e.target.value))}
  85 |           onBlur={handleBlur}
  86 |         />
  87 |       </FormGroup>
  88 | 
  89 |       <FormGroup>
  90 |         <Label>Options</Label>
  91 |         <CheckboxLabel>
  92 |           <input 
  93 |             type="checkbox" 
  94 |             checked={group.flatten}
  95 |             onChange={(e) => modifyGroup(group.id, { flatten: e.target.checked })}
  96 |           />
  97 |           Flatten Directory Structure
  98 |         </CheckboxLabel>
  99 |         
 100 |         <CheckboxLabel>
 101 |           <input 
 102 |             type="checkbox" 
 103 |             checked={group.isActive}
 104 |             onChange={(e) => modifyGroup(group.id, { isActive: e.target.checked })}
 105 |           />
 106 |           Include in Bundle
 107 |         </CheckboxLabel>
 108 |       </FormGroup>
 109 |     </Container>
 110 |   );
 111 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/InspectorPanel.tsx">
   1 | import styled from 'styled-components';
   2 | import { useAppSelector } from '@app/hooks';
   3 | import { selectSelectedNodeId, selectActiveGroups } from '@features/workspace/workspacesSlice';
   4 | import { Surface } from '@components/ui/Surface';
   5 | 
   6 | import { VscFileCode } from 'react-icons/vsc';
   7 | import { Heading } from '@components/ui/Typography';
   8 | import { RootConfigView } from './RootConfigView';
   9 | import { GroupConfigView } from './GroupConfigView';
  10 | import { FileViewer } from '@components/FileViewer';
  11 | 
  12 | const PanelContainer = styled(Surface)`
  13 |   height: 100%;
  14 |   border-left: 1px solid ${({ theme }) => theme.colors.border};
  15 |   display: flex;
  16 |   flex-direction: column;
  17 |   z-index: 5;
  18 | `;
  19 | 
  20 | const Header = styled.div`
  21 |   padding: 12px 16px;
  22 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  23 |   background: ${({ theme }) => theme.colors.bg.surface};
  24 | `;
  25 | 
  26 | export const InspectorPanel = () => {
  27 |   const selectedId = useAppSelector(selectSelectedNodeId);
  28 |   const groups = useAppSelector(selectActiveGroups);
  29 |   
  30 |   const selectedGroup = groups.find(g => g.id === selectedId);
  31 |   
  32 |   const renderContent = () => {
  33 |     if (!selectedId) {
  34 |       return <RootConfigView />;
  35 |     }
  36 | 
  37 |     if (selectedGroup) {
  38 |       return <GroupConfigView group={selectedGroup} />;
  39 |     }
  40 | 
  41 |     return (
  42 |       <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
  43 |         <Header>
  44 |           <Heading style={{fontSize: '13px', marginBottom: 0}}>
  45 |              <VscFileCode style={{marginRight: 8}}/> 
  46 |              Source Viewer
  47 |           </Heading>
  48 |         </Header>
  49 |         <FileViewer path={selectedId} />
  50 |       </div>
  51 |     );
  52 |   };
  53 | 
  54 |   return (
  55 |     <PanelContainer $padding={0} $radius="none" $variant="surface">
  56 |       {renderContent()}
  57 |     </PanelContainer>
  58 |   );
  59 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/RootConfigView.tsx">
   1 | import styled from 'styled-components';
   2 | import { useWorkspace } from '@features/workspace/useWorkspace';
   3 | import { Heading, Subtext } from '@components/ui/Typography';
   4 | import { VscSettingsGear, VscSymbolStructure } from 'react-icons/vsc';
   5 | 
   6 | const Container = styled.div`
   7 |   padding: 20px;
   8 |   display: flex;
   9 |   flex-direction: column;
  10 |   gap: 24px;
  11 | `;
  12 | 
  13 | const Section = styled.div`
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   gap: 12px;
  17 | `;
  18 | 
  19 | const Label = styled.label`
  20 |   font-size: 11px;
  21 |   font-weight: 700;
  22 |   text-transform: uppercase;
  23 |   color: ${({ theme }) => theme.colors.text.muted};
  24 | `;
  25 | 
  26 | const Select = styled.select`
  27 |   width: 100%;
  28 |   padding: 8px;
  29 |   background: ${({ theme }) => theme.colors.bg.input};
  30 |   border: 1px solid ${({ theme }) => theme.colors.border};
  31 |   color: ${({ theme }) => theme.colors.text.primary};
  32 |   border-radius: 4px;
  33 |   cursor: pointer;
  34 | 
  35 |   &:focus { outline: none; border-color: ${({ theme }) => theme.colors.palette.primary}; }
  36 | `;
  37 | 
  38 | const InfoBox = styled.div`
  39 |   padding: 12px;
  40 |   background: ${({ theme }) => theme.colors.bg.overlay};
  41 |   border-radius: 6px;
  42 |   font-size: 12px;
  43 |   color: ${({ theme }) => theme.colors.text.secondary};
  44 |   line-height: 1.5;
  45 | `;
  46 | 
  47 | export const RootConfigView = () => {
  48 |   const { config, setOptions, projectRoot } = useWorkspace();
  49 | 
  50 |   if (!config) return null;
  51 | 
  52 |   return (
  53 |     <Container>
  54 |       <div>
  55 |         <Heading><VscSettingsGear /> Global Settings</Heading>
  56 |         <Subtext>Configuration applied to all groups.</Subtext>
  57 |       </div>
  58 | 
  59 |       <Section>
  60 |         <Label>Project Root</Label>
  61 |         <InfoBox style={{fontFamily: 'monospace', wordBreak: 'break-all'}}>
  62 |            {projectRoot}
  63 |         </InfoBox>
  64 |       </Section>
  65 | 
  66 |       <Section>
  67 |         <Label>Skeleton Strategy</Label>
  68 |         <Select 
  69 |           value={config.skeletonMode}
  70 |           onChange={(e) => setOptions({ skeletonMode: e.target.value as any })}
  71 |         >
  72 |           <option value="all">Signatures</option>
  73 |           <option value="StripOnly">Strip Only  (Implementation & Signatures)</option>
  74 |           <option value="KeepOnly">Keep Essential Only</option>
  75 |         </Select>
  76 |         <Subtext style={{marginTop: 4}}>
  77 |            Controls how much code detail is included in the final LLM prompt.
  78 |         </Subtext>
  79 |       </Section>
  80 | 
  81 |       {/* Placeholder for Redactions (Global Excludes) */}
  82 |       <Section>
  83 |         <Label>Global Excludes (Redactions)</Label>
  84 |         <InfoBox>
  85 |            <VscSymbolStructure style={{marginRight: 6}}/>
  86 |            node_modules, .git, target, dist
  87 |         </InfoBox>
  88 |       </Section>
  89 |     </Container>
  90 |   );
  91 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/LibraryHub/WorkspaceCommandPalette.tsx">
   1 | import { useEffect, useMemo, useRef, useState } from "react";
   2 | import styled from "styled-components";
   3 | import { Modal } from "@components/ui/Modal";
   4 | import { Surface } from "@components/ui/Surface";
   5 | import { Subtext } from "@components/ui/Typography";
   6 | import { VscTrash, VscFolderOpened, VscGoToFile } from "react-icons/vsc";
   7 | import type { WorkspaceData } from "@features/workspace/workspacesSlice";
   8 | 
   9 | const Wrap = styled.div`
  10 |   display: flex;
  11 |   flex-direction: column;
  12 |   gap: 10px;
  13 | `;
  14 | 
  15 | const SearchRow = styled.div`
  16 |   display: flex;
  17 |   gap: 10px;
  18 |   align-items: center;
  19 | `;
  20 | 
  21 | const Input = styled.input`
  22 |   width: 100%;
  23 |   background: ${({ theme }) => theme.colors.bg.input};
  24 |   border: 1px solid ${({ theme }) => theme.colors.border};
  25 |   color: ${({ theme }) => theme.colors.text.primary};
  26 |   padding: 10px 12px;
  27 |   border-radius: 6px;
  28 |   font-size: 14px;
  29 | 
  30 |   &:focus {
  31 |     outline: none;
  32 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  33 |   }
  34 | `;
  35 | 
  36 | const HintBar = styled(Subtext)`
  37 |   display: flex;
  38 |   justify-content: space-between;
  39 |   font-size: 12px;
  40 | `;
  41 | 
  42 | const Kbd = styled.span`
  43 |   font-size: 11px;
  44 |   padding: 2px 6px;
  45 |   border-radius: 4px;
  46 |   border: 1px solid ${({ theme }) => theme.colors.border};
  47 |   background: ${({ theme }) => theme.colors.bg.overlay};
  48 |   color: ${({ theme }) => theme.colors.text.secondary};
  49 | `;
  50 | 
  51 | const Results = styled(Surface)`
  52 |   border: 1px solid ${({ theme }) => theme.colors.border};
  53 |   padding: 6px;
  54 |   display: flex;
  55 |   flex-direction: column;
  56 |   gap: 2px;
  57 |   max-height: 360px;
  58 |   overflow: auto;
  59 | `;
  60 | 
  61 | const Row = styled.button<{ $active?: boolean; $selected?: boolean }>`
  62 |   width: 100%;
  63 |   border: 1px solid transparent;
  64 |   background: ${({ theme, $selected }) => ($selected ? theme.colors.bg.overlay : "transparent")};
  65 |   color: ${({ theme }) => theme.colors.text.primary};
  66 |   cursor: pointer;
  67 |   display: grid;
  68 |   grid-template-columns: 18px 1fr auto;
  69 |   gap: 10px;
  70 |   align-items: center;
  71 |   padding: 10px 10px;
  72 |   border-radius: 6px;
  73 |   text-align: left;
  74 | 
  75 |   &:hover {
  76 |     background: ${({ theme }) => theme.colors.bg.overlay};
  77 |   }
  78 | 
  79 |   ${({ theme, $selected }) =>
  80 |     $selected
  81 |       ? `border-color: ${theme.colors.palette.primary};`
  82 |       : ""}
  83 | `;
  84 | 
  85 | const Name = styled.div`
  86 |   font-size: 13px;
  87 |   font-weight: 700;
  88 | `;
  89 | 
  90 | const Meta = styled(Subtext)`
  91 |   font-size: 12px;
  92 | `;
  93 | 
  94 | const Right = styled.div`
  95 |   display: inline-flex;
  96 |   align-items: center;
  97 |   gap: 10px;
  98 |   color: ${({ theme }) => theme.colors.text.muted};
  99 | `;
 100 | 
 101 | const MiniBtn = styled.button`
 102 |   background: transparent;
 103 |   border: 1px solid ${({ theme }) => theme.colors.border};
 104 |   color: ${({ theme }) => theme.colors.text.secondary};
 105 |   padding: 6px 8px;
 106 |   border-radius: 6px;
 107 |   cursor: pointer;
 108 |   display: inline-flex;
 109 |   align-items: center;
 110 |   gap: 6px;
 111 | 
 112 |   &:hover {
 113 |     background: ${({ theme }) => theme.colors.bg.overlay};
 114 |     color: ${({ theme }) => theme.colors.text.primary};
 115 |   }
 116 | `;
 117 | 
 118 | const score = (q: string, ws: WorkspaceData) => {
 119 |   const query = q.trim().toLowerCase();
 120 |   if (!query) return 1;
 121 | 
 122 |   const name = ws.name.toLowerCase();
 123 |   const root = ws.projectRoot.toLowerCase();
 124 | 
 125 |   if (name.startsWith(query)) return 1000;
 126 |   if (name.includes(query)) return 700;
 127 | 
 128 |   if (root.startsWith(query)) return 400;
 129 |   if (root.includes(query)) return 250;
 130 | 
 131 |   let i = 0;
 132 |   for (const ch of name) {
 133 |     if (ch === query[i]) i += 1;
 134 |     if (i >= query.length) return 120;
 135 |   }
 136 | 
 137 |   return 0;
 138 | };
 139 | 
 140 | interface Props {
 141 |   isOpen: boolean;
 142 |   onClose: () => void;
 143 |   workspaces: WorkspaceData[];
 144 |   activeId: string | null;
 145 |   onOpen: (id: string) => void;
 146 |   onDelete: (ws: WorkspaceData) => void;
 147 | }
 148 | 
 149 | export const WorkspaceCommandPalette = ({
 150 |   isOpen,
 151 |   onClose,
 152 |   workspaces,
 153 |   activeId,
 154 |   onOpen,
 155 |   onDelete,
 156 | }: Props) => {
 157 |   const inputRef = useRef<HTMLInputElement | null>(null);
 158 |   const [q, setQ] = useState("");
 159 |   const [cursor, setCursor] = useState(0);
 160 | 
 161 |   const results = useMemo(() => {
 162 |     const scored = workspaces
 163 |       .map((ws) => ({ ws, s: score(q, ws) }))
 164 |       .filter((x) => x.s > 0)
 165 |       .sort((a, b) => b.s - a.s);
 166 | 
 167 |     return scored.map((x) => x.ws);
 168 |   }, [q, workspaces]);
 169 | 
 170 |   useEffect(() => {
 171 |     if (!isOpen) return;
 172 |     setQ("");
 173 |     setCursor(0);
 174 |     setTimeout(() => inputRef.current?.focus(), 0);
 175 |   }, [isOpen]);
 176 | 
 177 |   useEffect(() => {
 178 |     if (cursor < 0) setCursor(0);
 179 |     if (cursor > results.length - 1) setCursor(Math.max(0, results.length - 1));
 180 |   }, [cursor, results.length]);
 181 | 
 182 |   const onKeyDown = (e: React.KeyboardEvent) => {
 183 |     if (e.key === "ArrowDown") {
 184 |       e.preventDefault();
 185 |       setCursor((c) => Math.min(results.length - 1, c + 1));
 186 |     }
 187 |     if (e.key === "ArrowUp") {
 188 |       e.preventDefault();
 189 |       setCursor((c) => Math.max(0, c - 1));
 190 |     }
 191 |     if (e.key === "Enter") {
 192 |       e.preventDefault();
 193 |       const ws = results[cursor];
 194 |       if (ws) onOpen(ws.id);
 195 |     }
 196 |   };
 197 | 
 198 |   return (
 199 |     <Modal isOpen={isOpen} onClose={onClose} title="Command Palette">
 200 |       <Wrap>
 201 |         <SearchRow>
 202 |           <Input
 203 |             ref={inputRef}
 204 |             value={q}
 205 |             onChange={(e) => setQ(e.target.value)}
 206 |             onKeyDown={onKeyDown}
 207 |             placeholder="Search workspaces…"
 208 |             aria-label="Search workspaces"
 209 |           />
 210 |         </SearchRow>
 211 | 
 212 |         <HintBar>
 213 |           <span>
 214 |             <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate · <Kbd>Enter</Kbd> to open
 215 |           </span>
 216 |           <span>
 217 |             <Kbd>Esc</Kbd> to close
 218 |           </span>
 219 |         </HintBar>
 220 | 
 221 |         <Results $variant="surface" $radius="md" $padding={2}>
 222 |           {results.length === 0 ? (
 223 |             <Subtext style={{ padding: 10 }}>
 224 |               No matches. Try typing part of a workspace name or path.
 225 |             </Subtext>
 226 |           ) : (
 227 |             results.map((ws, idx) => {
 228 |               const selected = idx === cursor;
 229 |               const isActive = ws.id === activeId;
 230 | 
 231 |               return (
 232 |                 <Row
 233 |                   key={ws.id}
 234 |                   $selected={selected}
 235 |                   $active={isActive}
 236 |                   onMouseEnter={() => setCursor(idx)}
 237 |                   onClick={() => onOpen(ws.id)}
 238 |                 >
 239 |                   <VscFolderOpened />
 240 |                   <div>
 241 |                     <Name>
 242 |                       {ws.name}{" "}
 243 |                       {isActive ? (
 244 |                         <Subtext style={{ marginLeft: 8 }}>(active)</Subtext>
 245 |                       ) : null}
 246 |                     </Name>
 247 |                     <Meta>{ws.projectRoot}</Meta>
 248 |                   </div>
 249 | 
 250 |                   <Right>
 251 |                     <span title="Enter to open">
 252 |                       <VscGoToFile />
 253 |                     </span>
 254 |                     <MiniBtn
 255 |                       title="Delete workspace"
 256 |                       onClick={(e) => {
 257 |                         e.preventDefault();
 258 |                         e.stopPropagation();
 259 |                         onDelete(ws);
 260 |                       }}
 261 |                     >
 262 |                       <VscTrash />
 263 |                       <span style={{ fontSize: 12 }}>Delete</span>
 264 |                     </MiniBtn>
 265 |                   </Right>
 266 |                 </Row>
 267 |               );
 268 |             })
 269 |           )}
 270 |         </Results>
 271 |       </Wrap>
 272 |     </Modal>
 273 |   );
 274 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/LibraryHub/WorkspaceGrid.tsx">
   1 | import styled from "styled-components";
   2 | import { Surface } from "@components/ui/Surface";
   3 | import { Subtext } from "@components/ui/Typography";
   4 | import { VscTrash, VscPlay } from "react-icons/vsc";
   5 | import type { WorkspaceData } from "@features/workspace/workspacesSlice";
   6 | 
   7 | const Grid = styled.div`
   8 |   display: grid;
   9 |   grid-template-columns: repeat(2, minmax(240px, 1fr));
  10 |   gap: 12px;
  11 | 
  12 |   @media (max-width: 900px) {
  13 |     grid-template-columns: 1fr;
  14 |   }
  15 | `;
  16 | 
  17 | const Card = styled(Surface)<{ $active?: boolean }>`
  18 |   border: 1px solid ${({ theme, $active }) =>
  19 |     $active ? theme.colors.palette.primary : theme.colors.border};
  20 |   display: flex;
  21 |   flex-direction: column;
  22 |   gap: 8px;
  23 | `;
  24 | 
  25 | const Top = styled.div`
  26 |   display: flex;
  27 |   justify-content: space-between;
  28 |   gap: 10px;
  29 | `;
  30 | 
  31 | const Name = styled.div`
  32 |   font-size: 14px;
  33 |   font-weight: 800;
  34 |   color: ${({ theme }) => theme.colors.text.primary};
  35 | `;
  36 | 
  37 | const Path = styled(Subtext)`
  38 |   font-size: 12px;
  39 |   word-break: break-all;
  40 | `;
  41 | 
  42 | const Badge = styled.span`
  43 |   font-size: 11px;
  44 |   font-weight: 700;
  45 |   padding: 3px 8px;
  46 |   border-radius: 999px;
  47 |   border: 1px solid ${({ theme }) => theme.colors.border};
  48 |   background: ${({ theme }) => theme.colors.bg.overlay};
  49 |   color: ${({ theme }) => theme.colors.text.secondary};
  50 |   height: fit-content;
  51 | `;
  52 | 
  53 | const Actions = styled.div`
  54 |   display: flex;
  55 |   gap: 8px;
  56 |   margin-top: 6px;
  57 | `;
  58 | 
  59 | const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  60 |   flex: 1;
  61 |   background: ${({ theme, $primary, $danger }) =>
  62 |     $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : "transparent"};
  63 |   color: ${({ theme, $primary, $danger }) =>
  64 |     $danger || $primary ? "white" : theme.colors.text.secondary};
  65 |   border: 1px solid
  66 |     ${({ theme, $primary, $danger }) =>
  67 |       $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.border};
  68 |   padding: 8px 10px;
  69 |   border-radius: 6px;
  70 |   cursor: pointer;
  71 |   font-size: 12px;
  72 |   font-weight: 700;
  73 |   display: inline-flex;
  74 |   gap: 8px;
  75 |   align-items: center;
  76 |   justify-content: center;
  77 | 
  78 |   &:hover {
  79 |     filter: brightness(1.05);
  80 |     background: ${({ theme, $primary, $danger }) =>
  81 |       $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.bg.overlay};
  82 |     color: ${({ theme, $primary, $danger }) =>
  83 |       $danger || $primary ? "white" : theme.colors.text.primary};
  84 |   }
  85 | `;
  86 | 
  87 | interface Props {
  88 |   workspaces: WorkspaceData[];
  89 |   activeId: string | null;
  90 |   onOpen: (id: string) => void;
  91 |   onDelete: (ws: WorkspaceData) => void;
  92 | }
  93 | 
  94 | export const WorkspaceGrid = ({ workspaces, activeId, onOpen, onDelete }: Props) => {
  95 |   if (!workspaces.length) {
  96 |     return (
  97 |       <Subtext>
  98 |         No workspaces yet — create one on the right to get started.
  99 |       </Subtext>
 100 |     );
 101 |   }
 102 | 
 103 |   const sorted = [...workspaces].sort((a, b) => {
 104 |     const aActive = a.id === activeId ? 1 : 0;
 105 |     const bActive = b.id === activeId ? 1 : 0;
 106 |     if (aActive !== bActive) return bActive - aActive;
 107 | 
 108 |     const ad = +new Date(a.lastOpened);
 109 |     const bd = +new Date(b.lastOpened);
 110 |     return bd - ad;
 111 |   });
 112 | 
 113 |   return (
 114 |     <Grid>
 115 |       {sorted.map((ws) => {
 116 |         const isActive = ws.id === activeId;
 117 | 
 118 |         return (
 119 |           <Card key={ws.id} $active={isActive} $variant="surface" $padding={3} $radius="md">
 120 |             <Top>
 121 |               <div>
 122 |                 <Name>{ws.name}</Name>
 123 |                 <Path>{ws.projectRoot}</Path>
 124 |               </div>
 125 |               {isActive ? <Badge>Active</Badge> : null}
 126 |             </Top>
 127 | 
 128 |             <Actions>
 129 |               <Btn $primary onClick={() => onOpen(ws.id)}>
 130 |                 <VscPlay />
 131 |                 Open
 132 |               </Btn>
 133 |               <Btn
 134 |                 $danger
 135 |                 onClick={() => onDelete(ws)}
 136 |                 title="Remove from Axon library"
 137 |               >
 138 |                 <VscTrash />
 139 |                 Delete
 140 |               </Btn>
 141 |             </Actions>
 142 |           </Card>
 143 |         );
 144 |       })}
 145 |     </Grid>
 146 |   );
 147 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Sidebar/Sidebar.tsx">
   1 | import styled from 'styled-components';
   2 | import { useLocation, useNavigate } from 'react-router-dom';
   3 | import { useLibrary } from '@features/workspace/useLibrary';
   4 | import { VscAdd, VscSymbolStructure } from 'react-icons/vsc';
   5 | 
   6 | 
   7 | const Container = styled.div`
   8 |   display: flex;
   9 |   flex-direction: column;
  10 |   align-items: center;
  11 |   gap: 12px;
  12 |   padding-top: 16px;
  13 |   width: 100%;
  14 |   height: 100%;
  15 | `;
  16 | 
  17 | const Separator = styled.div`
  18 |   width: 32px;
  19 |   height: 2px;
  20 |   background-color: ${({ theme }) => theme.colors.bg.overlay};
  21 |   border-radius: 1px;
  22 | `;
  23 | 
  24 | const WorkspaceIcon = styled.div<{ $active?: boolean }>`
  25 |   width: 42px;
  26 |   height: 42px;
  27 |   border-radius: ${({ $active }) => ($active ? '12px' : '50%')}; /* Morph shape */
  28 |   background-color: ${({ theme, $active }) => 
  29 |     $active ? theme.colors.palette.primary : theme.colors.bg.overlay};
  30 |   color: ${({ theme, $active }) => 
  31 |     $active ? '#fff' : theme.colors.text.secondary};
  32 |   display: flex;
  33 |   align-items: center;
  34 |   justify-content: center;
  35 |   font-weight: 700;
  36 |   font-size: 14px;
  37 |   cursor: pointer;
  38 |   transition: all 0.2s ease;
  39 |   position: relative;
  40 |   user-select: none;
  41 | 
  42 |   &:hover {
  43 |     border-radius: 12px;
  44 |     background-color: ${({ theme, $active }) => 
  45 |       $active ? theme.colors.palette.primary : theme.colors.palette.secondary};
  46 |     color: white;
  47 |   }
  48 | `;
  49 | 
  50 | const ActivePill = styled.div`
  51 |   position: absolute;
  52 |   left: -10px;
  53 |   width: 4px;
  54 |   height: 24px;
  55 |   background-color: ${({ theme }) => theme.colors.text.primary};
  56 |   border-radius: 0 4px 4px 0;
  57 | `;
  58 | 
  59 | 
  60 | export const Sidebar = () => {
  61 |   const navigate = useNavigate();
  62 |   const location = useLocation();
  63 |   const { workspaces, activeId, open } = useLibrary();
  64 | 
  65 |   const hubActive = location.pathname.startsWith("/hub");
  66 | 
  67 |   return (
  68 |     <Container>
  69 |       {/* NEW: Hub */}
  70 |       <WorkspaceIcon
  71 |         $active={hubActive}
  72 |         title="Library Hub (Ctrl+K)"
  73 |         onClick={() => navigate("/hub")}
  74 |       >
  75 |         {hubActive ? <ActivePill /> : null}
  76 |         <VscSymbolStructure />
  77 |       </WorkspaceIcon>
  78 | 
  79 |       <Separator />
  80 | 
  81 |       {/* existing workspace icons */}
  82 |       {workspaces.map((ws: any) => {
  83 |         const isActive = ws.id === activeId;
  84 |         return (
  85 |           <WorkspaceIcon
  86 |             key={ws.id}
  87 |             $active={isActive}
  88 |             onClick={() => {
  89 |               open(ws.id);
  90 |               navigate("/workspace");
  91 |             }}
  92 |             title={ws.name}
  93 |           >
  94 |             {isActive ? <ActivePill /> : null}
  95 |             {/* your existing initials function */}
  96 |             {/* getInitials(ws.name) */}
  97 |           </WorkspaceIcon>
  98 |         );
  99 |       })}
 100 | 
 101 |       <Separator />
 102 | 
 103 |       {/* existing add button */}
 104 |       <WorkspaceIcon
 105 |         title="Create workspace"
 106 |         onClick={() => navigate("/")}
 107 |       >
 108 |         <VscAdd />
 109 |       </WorkspaceIcon>
 110 |     </Container>
 111 |   );
 112 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Modal.tsx">
   1 | import React from 'react';
   2 | import styled from 'styled-components';
   3 | import { createPortal } from 'react-dom';
   4 | import { Surface } from './Surface';
   5 | import { VscClose } from 'react-icons/vsc';
   6 | 
   7 | const Backdrop = styled.div`
   8 |   position: fixed;
   9 |   top: 0; left: 0; right: 0; bottom: 0;
  10 |   background-color: rgba(0, 0, 0, 0.6); /* Dimmed background */
  11 |   backdrop-filter: blur(2px); /* Glassmorphism effect */
  12 |   display: flex;
  13 |   align-items: center;
  14 |   justify-content: center;
  15 |   z-index: 9999;
  16 |   animation: fadeIn 0.2s ease-out;
  17 | 
  18 |   @keyframes fadeIn {
  19 |     from { opacity: 0; }
  20 |     to { opacity: 1; }
  21 |   }
  22 | `;
  23 | 
  24 | const ModalContainer = styled(Surface)`
  25 |   min-width: 500px;
  26 |   max-width: 80vw;
  27 |   max-height: 85vh;
  28 |   display: flex;
  29 |   flex-direction: column;
  30 |   box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  31 |   animation: slideUp 0.2s ease-out;
  32 | 
  33 |   @keyframes slideUp {
  34 |     from { transform: translateY(20px); opacity: 0; }
  35 |     to { transform: translateY(0); opacity: 1; }
  36 |   }
  37 | `;
  38 | 
  39 | const Header = styled.div`
  40 |   display: flex;
  41 |   justify-content: space-between;
  42 |   align-items: center;
  43 |   padding-bottom: ${({ theme }) => theme.spacing(3)};
  44 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  45 |   margin-bottom: ${({ theme }) => theme.spacing(3)};
  46 | `;
  47 | 
  48 | const Title = styled.h3`
  49 |   margin: 0;
  50 |   font-size: ${({ theme }) => theme.typography.sizes.lg};
  51 |   color: ${({ theme }) => theme.colors.text.primary};
  52 | `;
  53 | 
  54 | const CloseButton = styled.button`
  55 |   background: transparent;
  56 |   border: none;
  57 |   color: ${({ theme }) => theme.colors.text.secondary};
  58 |   cursor: pointer;
  59 |   font-size: 20px;
  60 |   display: flex;
  61 |   align-items: center;
  62 |   
  63 |   &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
  64 | `;
  65 | 
  66 | const Body = styled.div`
  67 |   flex: 1;
  68 |   overflow-y: auto; /* Scroll internally if content is long */
  69 | `;
  70 | 
  71 | 
  72 | interface ModalProps {
  73 |   isOpen: boolean;
  74 |   onClose: () => void;
  75 |   title?: string;
  76 |   children: React.ReactNode;
  77 | }
  78 | 
  79 | export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  80 |   if (!isOpen) return null;
  81 | 
  82 |   return createPortal(
  83 |     <Backdrop onClick={onClose}>
  84 |       <ModalContainer 
  85 |         $variant="surface" 
  86 |         $padding={4} 
  87 |         onClick={(e) => e.stopPropagation()} // Don't close when clicking inside
  88 |       >
  89 |         <Header>
  90 |           <Title>{title}</Title>
  91 |           <CloseButton onClick={onClose}>
  92 |             <VscClose />
  93 |           </CloseButton>
  94 |         </Header>
  95 |         <Body>
  96 |           {children}
  97 |         </Body>
  98 |       </ModalContainer>
  99 |     </Backdrop>,
 100 |     document.body
 101 |   );
 102 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Surface.tsx">
   1 | import styled from 'styled-components';
   2 | 
   3 | interface SurfaceProps {
   4 |   $variant?: 'main' | 'surface' | 'overlay';
   5 |   $padding?: number;
   6 |   $radius?: 'sm' | 'md' | 'lg' | 'none';
   7 |   $border?: boolean;
   8 | }
   9 | 
  10 | export const Surface = styled.div<SurfaceProps>`
  11 |   background-color: ${({ theme, $variant = 'surface' }) => theme.colors.bg[$variant]};
  12 |   padding: ${({ theme, $padding = 2 }) => theme.spacing($padding)};
  13 |   border-radius: ${({ theme, $radius = 'md' }) => 
  14 |     $radius === 'none' ? '0' : theme.borderRadius[$radius]};
  15 |   border: ${({ theme, $border }) => 
  16 |     $border ? `1px solid ${theme.colors.border}` : 'none'};
  17 |   
  18 |   color: ${({ theme }) => theme.colors.text.primary};
  19 |   transition: background-color 0.2s ease, border-color 0.2s ease;
  20 | `;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Typography.tsx">
   1 | import styled from 'styled-components';
   2 | 
   3 | export const Heading = styled.h2`
   4 |   color: ${({ theme }) => theme.colors.text.primary};
   5 |   font-size: ${({ theme }) => theme.typography.sizes.xl};
   6 |   font-weight: 600;
   7 |   margin-bottom: ${({ theme }) => theme.spacing(2)};
   8 | `;
   9 | 
  10 | export const Subtext = styled.span`
  11 |   color: ${({ theme }) => theme.colors.text.muted};
  12 |   font-size: ${({ theme }) => theme.typography.sizes.sm};
  13 | `;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useAxonCore.ts">
   1 | import { useCallback } from 'react';
   2 | import { invoke } from '@tauri-apps/api/core';
   3 | import type { 
   4 |   PromptOptions, 
   5 |   ScanParams, 
   6 |   ScanResponse, 
   7 |   GroupRequest 
   8 | } from '@axon-types/axonTypes'; // Adjust path if you named the file axonCore.ts
   9 | 
  10 | 
  11 | interface PromptParams {
  12 |   projectRoot: string;
  13 |   entryPoint: string;
  14 |   depth: number;
  15 |   options: PromptOptions;
  16 | }
  17 | 
  18 | interface CombinedPromptParams {
  19 |   projectRoot: string;
  20 |   groups: GroupRequest[]; // 👈 Matches the Rust "Vec<GroupRequest>" exactly
  21 |   options: PromptOptions;
  22 | }
  23 | 
  24 | export const useAxonCore = () => {
  25 | 
  26 |   const scanGroup = useCallback(async (params: ScanParams): Promise<ScanResponse> => {
  27 |     try {
  28 |       return await invoke<ScanResponse>('scan_workspace_group', {
  29 |         groupId: params.groupId,
  30 |         projectRoot: params.projectRoot,
  31 |         entryPoint: params.entryPoint,
  32 |         depth: params.depth,
  33 |         flatten: params.flatten, // ⚠️ Rust command arg is 'flatten'
  34 |       });
  35 |     } catch (error) {
  36 |       console.error(`[AxonCore] Scan Failed for ${params.groupId}:`, error);
  37 |       throw error;
  38 |     }
  39 |   }, []);
  40 | 
  41 |   const listFiles = useCallback(async (path: string) => {
  42 |     return await invoke<any[]>('list_files', { path });
  43 |   }, []);
  44 | 
  45 |   const readFile = useCallback(async (path: string) => {
  46 |     return await invoke<string>('read_file_content', { path });
  47 |   }, []);
  48 | 
  49 |   const generateGroupPrompt = useCallback(async (params: PromptParams) => {
  50 |     return await invoke<string>('generate_group_prompt', {
  51 |       projectRoot: params.projectRoot,
  52 |       entryPoint: params.entryPoint,
  53 |       depth: params.depth,
  54 |       options: params.options,
  55 |     });
  56 |   }, []);
  57 | 
  58 |   const generateCombinedPrompt = useCallback(async (params: CombinedPromptParams) => {
  59 |     return await invoke<string>('generate_combined_prompt', {
  60 |       projectRoot: params.projectRoot,
  61 |       groups: params.groups, 
  62 |       options: params.options,
  63 |     });
  64 |   }, []);
  65 | 
  66 |   return {
  67 |     scanGroup,
  68 |     listFiles,
  69 |     readFile,
  70 |     generateGroupPrompt,
  71 |     generateCombinedPrompt
  72 |   };
  73 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useFileSystem.ts">
   1 | import { useState, useCallback, useRef } from 'react';
   2 | import { useAxonCore } from './useAxonCore';
   3 | 
   4 | interface FileSystemState {
   5 |   currentPath: string | null;
   6 |   files: any[];
   7 |   isLoading: boolean;
   8 |   error: string | null;
   9 | }
  10 | 
  11 | export const useFileSystem = (initialPath: string | null) => {
  12 |   const { listFiles } = useAxonCore();
  13 |   
  14 |   const [state, setState] = useState<FileSystemState>({
  15 |     currentPath: initialPath, 
  16 |     files: [],
  17 |     isLoading: false,
  18 |     error: null
  19 |   });
  20 | 
  21 |   const activeRequest = useRef<string | null>(null);
  22 | 
  23 |   const cd = useCallback(async (targetPath: string) => {
  24 |     setState(prev => ({ 
  25 |       ...prev, 
  26 |       currentPath: targetPath, 
  27 |       isLoading: true, 
  28 |       error: null 
  29 |     }));
  30 | 
  31 |     activeRequest.current = targetPath;
  32 | 
  33 |     try {
  34 |       const result = await listFiles(targetPath);
  35 |     
  36 |       if (activeRequest.current !== targetPath) return;
  37 | 
  38 |       const sorted = result.sort((a: any, b: any) => 
  39 |          Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name)
  40 |       );
  41 | 
  42 |       setState(prev => ({ 
  43 |         ...prev, 
  44 |         files: sorted, 
  45 |         isLoading: false 
  46 |       }));
  47 | 
  48 |     } catch (err) {
  49 |       if (activeRequest.current !== targetPath) return;
  50 |       
  51 |       console.error("FS Error", err);
  52 |       setState(prev => ({ 
  53 |         ...prev, 
  54 |         isLoading: false, 
  55 |         error: "Failed to load directory" 
  56 |       }));
  57 |     }
  58 |   }, [listFiles]);
  59 | 
  60 |   const navigateUp = useCallback(() => {
  61 |     if (!state.currentPath) return;
  62 |     const parent = state.currentPath.split(/[/\\]/).slice(0, -1).join('/');
  63 |     cd(parent || state.currentPath); 
  64 |   }, [state.currentPath, cd]);
  65 | 
  66 |   const refresh = useCallback(() => {
  67 |     if (state.currentPath) cd(state.currentPath);
  68 |   }, [state.currentPath, cd]);
  69 | 
  70 |   return {
  71 |     ...state, 
  72 |     cd,      
  73 |     navigateUp,
  74 |     refresh
  75 |   };
  76 | };
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/useTheme.ts">
   1 | import { useCallback } from 'react';
   2 | import { useAppDispatch, useAppSelector } from '@app/hooks';
   3 | import { toggleTheme, setThemeMode, selectThemeMode } from './themeSlice';
   4 | 
   5 | export const useTheme = () => {
   6 |   const dispatch = useAppDispatch();
   7 |   const mode = useAppSelector(selectThemeMode);
   8 |   
   9 |   const isDark = mode === 'dark';
  10 | 
  11 |   const toggle = useCallback(() => {
  12 |     dispatch(toggleTheme());
  13 |   }, [dispatch]);
  14 | 
  15 |   const setMode = useCallback((newMode: 'light' | 'dark') => {
  16 |     dispatch(setThemeMode(newMode));
  17 |   }, [dispatch]);
  18 | 
  19 |   return {
  20 |     mode,
  21 |     isDark,
  22 |     toggle,
  23 |     setMode
  24 |   };
  25 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/visualizer/useGraphLayout.ts">
   1 | import { useState, useCallback, useEffect } from 'react';
   2 | import { useNodesState, useEdgesState } from '@xyflow/react';
   3 | import { useWorkspace } from '@features/workspace/useWorkspace';
   4 | import { useAxonCore } from '@features/axon/useAxonCore';
   5 | import type { AxonNode, AxonEdge } from '@axon-types/axonTypes';
   6 | 
   7 | export const useGraphLayout = () => {
   8 |   const { groups, projectRoot, workspaceId } = useWorkspace();
   9 |   const { scanGroup } = useAxonCore();
  10 | 
  11 |   const [nodes, setNodes, onNodesChange] = useNodesState<AxonNode>([]);
  12 |   const [edges, setEdges, onEdgesChange] = useEdgesState<AxonEdge>([]);
  13 |   const [isScanning, setIsScanning] = useState(false);
  14 | 
  15 |   useEffect(() => {
  16 |     setNodes([]);
  17 |     setEdges([]);
  18 |   }, [workspaceId, setNodes, setEdges]);
  19 | 
  20 |   const refreshGraph = useCallback(async () => {
  21 |     if (!projectRoot || groups.length === 0) return;
  22 |     
  23 |     setIsScanning(true);
  24 |     let newNodes: AxonNode[] = [];
  25 |     let newEdges: AxonEdge[] = [];
  26 |     let xOffset = 0;
  27 | 
  28 |     for (const group of groups) {
  29 |       let width = 280;
  30 |       let height = 200;
  31 |       let children: AxonNode[] = [];
  32 |       let groupEdges: AxonEdge[] = [];
  33 | 
  34 |       if (group.entryPoint) {
  35 |         try {
  36 |           const result = await scanGroup({
  37 |             groupId: group.id,
  38 |             projectRoot,
  39 |             entryPoint: group.entryPoint,
  40 |             depth: group.depth || 3,
  41 |             flatten: !!group.flatten, // Ensure boolean
  42 |           });
  43 | 
  44 |           if (result.nodes.length > 0) {
  45 |             const xs = result.nodes.map(n => n.position.x);
  46 |             const ys = result.nodes.map(n => n.position.y);
  47 |             const minX = Math.min(...xs);
  48 |             const maxX = Math.max(...xs);
  49 |             const minY = Math.min(...ys);
  50 |             const maxY = Math.max(...ys);
  51 | 
  52 |             const padding = 40;
  53 |             const headerHeight = 60;
  54 |             
  55 |             width = (maxX - minX) + (padding * 2);
  56 |             height = (maxY - minY) + (padding * 2) + headerHeight;
  57 | 
  58 |             children = result.nodes.map(n => ({
  59 |               ...n,
  60 |               parentId: group.id,
  61 |               extent: 'parent', // Trap inside group
  62 |               position: {
  63 |                 x: n.position.x - minX + padding,
  64 |                 y: n.position.y - minY + headerHeight
  65 |               },
  66 |               data: { ...n.data } // Ensure data reference is fresh
  67 |             }));
  68 |             
  69 |             groupEdges = result.edges;
  70 |           }
  71 |         } catch (err) {
  72 |           console.warn(`[Layout] Skipped group ${group.name}:`, err);
  73 |         }
  74 |       }
  75 | 
  76 |       const groupNode: AxonNode = {
  77 |         id: group.id,
  78 |         type: 'groupNode',
  79 |         position: { x: xOffset, y: 0 },
  80 |         data: {
  81 |           label: group.name,
  82 |           entryPoint: group.entryPoint || null,
  83 |           depth: group.depth || 3
  84 |         },
  85 |         style: { width, height },
  86 |         selected: false, // selection handled by React Flow
  87 |       };
  88 | 
  89 |       newNodes.push(groupNode, ...children);
  90 |       newEdges.push(...groupEdges);
  91 |       
  92 |       xOffset += width + 100; 
  93 |     }
  94 | 
  95 |     setNodes(newNodes);
  96 |     setEdges(newEdges);
  97 |     setIsScanning(false);
  98 |   }, [groups, projectRoot, scanGroup, setNodes, setEdges]);
  99 | 
 100 |   useEffect(() => {
 101 |     refreshGraph();
 102 |   }, [refreshGraph]);
 103 | 
 104 |   return {
 105 |     nodes,
 106 |     edges,
 107 |     onNodesChange,
 108 |     onEdgesChange,
 109 |     isScanning,
 110 |     setEdges, // Exposed for manual connections if needed
 111 |   };
 112 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/useLibrary.ts">
   1 | import { useCallback } from 'react';
   2 | import { useAppDispatch, useAppSelector } from '@app/hooks';
   3 | import { 
   4 |   selectAllWorkspaces, 
   5 |   createWorkspace, 
   6 |   deleteWorkspace, 
   7 |   setActiveWorkspace,
   8 |   selectActiveId 
   9 | } from './workspacesSlice';
  10 | 
  11 | export const useLibrary = () => {
  12 |   const dispatch = useAppDispatch();
  13 |   const workspaces = useAppSelector(selectAllWorkspaces);
  14 |   const activeId = useAppSelector(selectActiveId);
  15 | 
  16 |   const create = useCallback((name: string, root: string) => {
  17 |     dispatch(createWorkspace(name, root));
  18 |   }, [dispatch]);
  19 | 
  20 |   const open = useCallback((id: string) => {
  21 |     dispatch(setActiveWorkspace(id));
  22 |   }, [dispatch]);
  23 | 
  24 |   const remove = useCallback((id: string) => {
  25 |     dispatch(deleteWorkspace(id));
  26 |   }, [dispatch]);
  27 | 
  28 |   return {
  29 |     workspaces,
  30 |     activeId,
  31 |     create,
  32 |     open,
  33 |     remove
  34 |   };
  35 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/useWorkspace.ts">
   1 | import { useCallback } from "react";
   2 | import { useAppDispatch, useAppSelector } from "@app/hooks";
   3 | import {
   4 |   selectActiveRoot,
   5 |   selectActiveGroups,
   6 |   selectActiveWorkspace,
   7 |   addActiveGroup,
   8 |   updateActiveGroup,
   9 |   updateGlobalOptions,
  10 |   type WorkspaceData,
  11 | } from "./workspacesSlice";
  12 | import { type AxonGroup } from "@axon-types/workspaceTypes";
  13 | 
  14 | export const useWorkspace = () => {
  15 |   const dispatch = useAppDispatch();
  16 | 
  17 |   const projectRoot = useAppSelector(selectActiveRoot);
  18 |   const groups = useAppSelector(selectActiveGroups);
  19 |   const fullConfig = useAppSelector(selectActiveWorkspace);
  20 | 
  21 |   const createGroup = useCallback(
  22 |     (group: AxonGroup) => {
  23 |       dispatch(addActiveGroup(group));
  24 |     },
  25 |     [dispatch],
  26 |   );
  27 | 
  28 |   const modifyGroup = useCallback(
  29 |     (id: string, changes: Partial<AxonGroup>) => {
  30 |       dispatch(updateActiveGroup({ id, changes }));
  31 |     },
  32 |     [dispatch],
  33 |   );
  34 | 
  35 |   const setOptions = useCallback(
  36 |     (options: Partial<WorkspaceData["globalOptions"]>) => {
  37 |       dispatch(updateGlobalOptions(options));
  38 |     },
  39 |     [dispatch],
  40 |   );
  41 | 
  42 |   const workspaceId = fullConfig?.id;
  43 | 
  44 |   return {
  45 |     isActive: !!projectRoot,
  46 |     workspaceId,
  47 |     projectRoot,
  48 |     groups,
  49 |     config: fullConfig?.globalOptions,
  50 | 
  51 |     createGroup,
  52 |     modifyGroup,
  53 |     setOptions,
  54 |   };
  55 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/workspacesSlice.ts">
   1 | import { 
   2 |   createSlice, 
   3 |   createEntityAdapter, 
   4 |   type PayloadAction, 
   5 |   nanoid 
   6 | } from '@reduxjs/toolkit';
   7 | import { type RootState } from '@app/store';
   8 | import { type AxonGroup} from '@axon-types/workspaceTypes';
   9 | import type { PromptOptions } from '@axon-types/axonTypes';
  10 | 
  11 | export interface WorkspaceData {
  12 |   id: string;
  13 |   name: string;
  14 |   projectRoot: string;
  15 |   lastOpened: string; 
  16 |   groups: AxonGroup[];
  17 |   globalOptions: PromptOptions;
  18 |   selectedNodeId: string | null;
  19 | }
  20 | 
  21 | const workspacesAdapter = createEntityAdapter<WorkspaceData>({
  22 |   sortComparer: (a, b) => b.lastOpened.localeCompare(a.lastOpened),
  23 | });
  24 | 
  25 | const initialState = workspacesAdapter.getInitialState({
  26 |   activeId: null as string | null,
  27 | });
  28 | 
  29 | const workspacesSlice = createSlice({
  30 |   name: 'workspaces',
  31 |   initialState,
  32 |   reducers: {
  33 |     createWorkspace: {
  34 |       reducer: (state, action: PayloadAction<WorkspaceData>) => {
  35 |         workspacesAdapter.addOne(state, action.payload);
  36 |         state.activeId = action.payload.id;
  37 |       },
  38 |       prepare: (name: string, root: string) => {
  39 |         const id = nanoid();
  40 |         return {
  41 |           payload: {
  42 |             id,
  43 |             name,
  44 |             projectRoot: root,
  45 |             lastOpened: new Date().toISOString(),
  46 |             groups: [],
  47 |             globalOptions: { skeletonMode: 'stripOnly', redactions: [], removeComments: true, showLineNumbers: true, skeletonTargets: [] },
  48 |             selectedNodeId: null,
  49 |           } as WorkspaceData
  50 |         };
  51 |       }
  52 |     },
  53 | 
  54 |     setSelectedNode: (state, action: PayloadAction<string | null>) => {
  55 |       if (state.activeId && state.entities[state.activeId]) {
  56 |         state.entities[state.activeId].selectedNodeId = action.payload;
  57 |       }
  58 |     },
  59 |     
  60 |     deleteWorkspace: (state, action: PayloadAction<string>) => {
  61 |       workspacesAdapter.removeOne(state, action.payload);
  62 |       if (state.activeId === action.payload) {
  63 |         state.activeId = null;
  64 |       }
  65 |     },
  66 | 
  67 |     setActiveWorkspace: (state, action: PayloadAction<string>) => {
  68 |       workspacesAdapter.updateOne(state, {
  69 |         id: action.payload,
  70 |         changes: { lastOpened: new Date().toISOString() }
  71 |       });
  72 |       state.activeId = action.payload;
  73 |     },
  74 | 
  75 |     
  76 |     addActiveGroup: (state, action: PayloadAction<AxonGroup>) => {
  77 |       if (state.activeId) {
  78 |         const ws = state.entities[state.activeId];
  79 |         if (ws) ws.groups.push(action.payload);
  80 |       }
  81 |     },
  82 | 
  83 | 
  84 |     updateActiveGroup: (state, action: PayloadAction<{ id: string; changes: Partial<AxonGroup> }>) => {
  85 |       if (!state.activeId) return;
  86 |       
  87 |       const workspace = state.entities[state.activeId];
  88 |       if (!workspace) return;
  89 | 
  90 |       const groupIndex = workspace.groups.findIndex(g => g.id === action.payload.id);
  91 |       
  92 |       if (groupIndex !== -1) {
  93 |         workspace.groups[groupIndex] = {
  94 |           ...workspace.groups[groupIndex],
  95 |           ...action.payload.changes
  96 |         };
  97 |       }
  98 |     },
  99 | 
 100 |     updateGlobalOptions: (state, action: PayloadAction<Partial<WorkspaceData['globalOptions']>>) => {
 101 |       if (state.activeId && state.entities[state.activeId]) {
 102 |         const ws = state.entities[state.activeId];
 103 |         ws.globalOptions = { ...ws.globalOptions, ...action.payload };
 104 |       }
 105 |     },
 106 |   },
 107 | });
 108 | 
 109 | export const { 
 110 |   createWorkspace, 
 111 |   deleteWorkspace, 
 112 |   setActiveWorkspace,
 113 |   addActiveGroup,
 114 |   updateActiveGroup,
 115 |   setSelectedNode,
 116 |   updateGlobalOptions,
 117 | } = workspacesSlice.actions;
 118 | 
 119 | export default workspacesSlice.reducer;
 120 | 
 121 | 
 122 | export const {
 123 |   selectAll: selectAllWorkspaces,
 124 |   selectById: selectWorkspaceById,
 125 | } = workspacesAdapter.getSelectors<RootState>(state => state.workspaces);
 126 | 
 127 | export const selectActiveId = (state: RootState) => state.workspaces.activeId;
 128 | 
 129 | export const selectActiveWorkspace = (state: RootState) => {
 130 |   const id = state.workspaces.activeId;
 131 |   return id ? state.workspaces.entities[id] : null;
 132 | };
 133 | 
 134 | export const selectActiveGroups = (state: RootState) => 
 135 |   selectActiveWorkspace(state)?.groups ?? [];
 136 | 
 137 | export const selectActiveRoot = (state: RootState) => 
 138 |   selectActiveWorkspace(state)?.projectRoot ?? null;
 139 | 
 140 | export const selectSelectedNodeId = (state: RootState) => 
 141 |   selectActiveWorkspace(state)?.selectedNodeId ?? null;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/pages/LibraryHubPage.tsx">
   1 | import { useEffect, useMemo, useState } from "react";
   2 | import styled from "styled-components";
   3 | import { useNavigate } from "react-router-dom";
   4 | 
   5 | import { Surface } from "@components/ui/Surface";
   6 | import { Heading, Subtext } from "@components/ui/Typography";
   7 | import { Modal } from "@components/ui/Modal";
   8 | import { CreateWorkspaceCard } from "@components/CreateWorkspaceCard";
   9 | 
  10 | import { useLibrary } from "@features/workspace/useLibrary";
  11 | import { useTheme } from "@features/theme/useTheme";
  12 | import { useToggle } from "@app/hooks";
  13 | 
  14 | import { VscColorMode, VscSearch, VscTrash, VscChevronRight } from "react-icons/vsc";
  15 | import type { WorkspaceData } from "@features/workspace/workspacesSlice";
  16 | import { WorkspaceCommandPalette, WorkspaceGrid} from "@components/LibraryHub";
  17 | 
  18 | const Page = styled.div`
  19 |   height: 100%;
  20 |   width: 100%;
  21 |   padding: 24px;
  22 |   overflow: auto;
  23 | `;
  24 | 
  25 | const TopBar = styled.div`
  26 |   display: flex;
  27 |   align-items: flex-start;
  28 |   justify-content: space-between;
  29 |   gap: 16px;
  30 |   margin-bottom: 18px;
  31 | `;
  32 | 
  33 | const TitleBlock = styled.div`
  34 |   display: flex;
  35 |   flex-direction: column;
  36 |   gap: 6px;
  37 | `;
  38 | 
  39 | const Actions = styled.div`
  40 |   display: flex;
  41 |   gap: 10px;
  42 |   align-items: center;
  43 | `;
  44 | 
  45 | const IconButton = styled.button`
  46 |   background: transparent;
  47 |   border: 1px solid ${({ theme }) => theme.colors.border};
  48 |   color: ${({ theme }) => theme.colors.text.secondary};
  49 |   padding: 8px;
  50 |   border-radius: 4px;
  51 |   cursor: pointer;
  52 |   display: inline-flex;
  53 |   align-items: center;
  54 |   justify-content: center;
  55 |   transition: all 0.2s;
  56 | 
  57 |   &:hover {
  58 |     background: ${({ theme }) => theme.colors.bg.overlay};
  59 |     color: ${({ theme }) => theme.colors.text.primary};
  60 |   }
  61 | `;
  62 | 
  63 | const Hint = styled(Subtext)`
  64 |   display: inline-flex;
  65 |   align-items: center;
  66 |   gap: 8px;
  67 |   user-select: none;
  68 | `;
  69 | 
  70 | const Kbd = styled.span`
  71 |   font-family: ${({ theme }) => theme.typography.fontFamily};
  72 |   font-size: 11px;
  73 |   padding: 2px 6px;
  74 |   border-radius: 4px;
  75 |   border: 1px solid ${({ theme }) => theme.colors.border};
  76 |   background: ${({ theme }) => theme.colors.bg.overlay};
  77 |   color: ${({ theme }) => theme.colors.text.secondary};
  78 | `;
  79 | 
  80 | const ContentGrid = styled.div`
  81 |   display: grid;
  82 |   grid-template-columns: 1.3fr 0.9fr;
  83 |   gap: 16px;
  84 | 
  85 |   @media (max-width: 1100px) {
  86 |     grid-template-columns: 1fr;
  87 |   }
  88 | `;
  89 | 
  90 | const Panel = styled(Surface)`
  91 |   border: 1px solid ${({ theme }) => theme.colors.border};
  92 | `;
  93 | 
  94 | const StatRow = styled.div`
  95 |   display: grid;
  96 |   grid-template-columns: repeat(4, 1fr);
  97 |   gap: 10px;
  98 |   margin-bottom: 14px;
  99 | 
 100 |   @media (max-width: 1100px) {
 101 |     grid-template-columns: repeat(2, 1fr);
 102 |   }
 103 | `;
 104 | 
 105 | const StatCard = styled(Surface)`
 106 |   border: 1px solid ${({ theme }) => theme.colors.border};
 107 |   display: flex;
 108 |   flex-direction: column;
 109 |   gap: 6px;
 110 |   min-height: 74px;
 111 | `;
 112 | 
 113 | const StatLabel = styled(Subtext)`
 114 |   font-size: 11px;
 115 |   text-transform: uppercase;
 116 |   letter-spacing: 0.08em;
 117 | `;
 118 | 
 119 | const StatValue = styled.div`
 120 |   font-size: 18px;
 121 |   font-weight: 700;
 122 |   color: ${({ theme }) => theme.colors.text.primary};
 123 |   display: flex;
 124 |   align-items: center;
 125 |   gap: 8px;
 126 | `;
 127 | 
 128 | const StatMeta = styled(Subtext)`
 129 |   font-size: 12px;
 130 | `;
 131 | 
 132 | const Divider = styled.div`
 133 |   height: 1px;
 134 |   background: ${({ theme }) => theme.colors.border};
 135 |   margin: 12px 0;
 136 | `;
 137 | 
 138 | const ConfirmBody = styled.div`
 139 |   display: flex;
 140 |   flex-direction: column;
 141 |   gap: 10px;
 142 | `;
 143 | 
 144 | const ConfirmTitle = styled.div`
 145 |   font-size: 14px;
 146 |   font-weight: 700;
 147 |   color: ${({ theme }) => theme.colors.text.primary};
 148 | `;
 149 | 
 150 | const ConfirmActions = styled.div`
 151 |   display: flex;
 152 |   justify-content: flex-end;
 153 |   gap: 10px;
 154 |   margin-top: 10px;
 155 | `;
 156 | 
 157 | const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
 158 |   background: ${({ theme, $primary, $danger }) =>
 159 |     $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : "transparent"};
 160 |   color: ${({ theme, $primary, $danger }) =>
 161 |     $danger || $primary ? "white" : theme.colors.text.secondary};
 162 |   border: 1px solid
 163 |     ${({ theme, $primary, $danger }) =>
 164 |       $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.border};
 165 |   padding: 8px 12px;
 166 |   border-radius: 4px;
 167 |   cursor: pointer;
 168 |   font-size: 13px;
 169 |   font-weight: 600;
 170 |   display: inline-flex;
 171 |   gap: 8px;
 172 |   align-items: center;
 173 | 
 174 |   &:hover {
 175 |     filter: brightness(1.05);
 176 |     background: ${({ theme, $primary, $danger }) =>
 177 |       $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.bg.overlay};
 178 |     color: ${({ theme, $primary, $danger }) =>
 179 |       $danger || $primary ? "white" : theme.colors.text.primary};
 180 |   }
 181 | `;
 182 | 
 183 | const fmtDateTime = (value?: string) => {
 184 |   if (!value) return "—";
 185 |   const d = new Date(value);
 186 |   if (Number.isNaN(d.getTime())) return "—";
 187 |   return new Intl.DateTimeFormat(undefined, {
 188 |     year: "numeric",
 189 |     month: "short",
 190 |     day: "2-digit",
 191 |     hour: "2-digit",
 192 |     minute: "2-digit",
 193 |   }).format(d);
 194 | };
 195 | 
 196 | export const LibraryHubPage = () => {
 197 |   const navigate = useNavigate();
 198 |   const { workspaces, activeId, open, remove } = useLibrary();
 199 |   const { toggle: toggleTheme } = useTheme();
 200 | 
 201 |   const palette = useToggle();
 202 |   const [pendingDelete, setPendingDelete] = useState<WorkspaceData | null>(null);
 203 | 
 204 |   useEffect(() => {
 205 |     const onKeyDown = (e: KeyboardEvent) => {
 206 |       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
 207 |         e.preventDefault();
 208 |         palette.open();
 209 |       }
 210 |       if (e.key === "Escape") {
 211 |         palette.close();
 212 |       }
 213 |     };
 214 |     window.addEventListener("keydown", onKeyDown);
 215 |     return () => window.removeEventListener("keydown", onKeyDown);
 216 |   }, [palette]);
 217 | 
 218 |   const activeWorkspace = useMemo(
 219 |     () => workspaces.find((w: WorkspaceData) => w.id === activeId) ?? null,
 220 |     [workspaces, activeId]
 221 |   );
 222 | 
 223 |   const stats = useMemo(() => {
 224 |     const total = workspaces.length;
 225 |     const groups = workspaces.reduce((acc: number, w: WorkspaceData) => acc + (w.groups?.length ?? 0), 0);
 226 | 
 227 |     const mostRecent = [...workspaces]
 228 |       .filter((w: WorkspaceData) => Boolean(w.lastOpened))
 229 |       .sort((a: WorkspaceData, b: WorkspaceData) => +new Date(b.lastOpened) - +new Date(a.lastOpened))[0];
 230 | 
 231 |     return {
 232 |       total,
 233 |       groups,
 234 |       activeName: activeWorkspace?.name ?? "None",
 235 |       recent: mostRecent?.lastOpened ? fmtDateTime(mostRecent.lastOpened) : "—",
 236 |     };
 237 |   }, [workspaces, activeWorkspace]);
 238 | 
 239 |   const openWorkspace = (id: string) => {
 240 |     open(id);
 241 |     navigate("/workspace");
 242 |   };
 243 | 
 244 |   const requestDelete = (ws: WorkspaceData) => setPendingDelete(ws);
 245 | 
 246 |   const confirmDelete = () => {
 247 |     if (!pendingDelete) return;
 248 |     remove(pendingDelete.id);
 249 |     setPendingDelete(null);
 250 |   };
 251 | 
 252 |   return (
 253 |     <Page>
 254 |       <TopBar>
 255 |         <TitleBlock>
 256 |           <Heading style={{ marginBottom: 0 }}>Library Hub</Heading>
 257 |           <Subtext>
 258 |             Jump between workspaces, see what’s “hot”, and fly with <strong>Ctrl</strong>+<strong>K</strong>.
 259 |           </Subtext>
 260 |         </TitleBlock>
 261 | 
 262 |         <Actions>
 263 |           <Hint>
 264 |             <Kbd>Ctrl</Kbd> <span>+</span> <Kbd>K</Kbd>
 265 |           </Hint>
 266 | 
 267 |           <IconButton title="Search workspaces (Ctrl+K)" onClick={palette.open}>
 268 |             <VscSearch />
 269 |           </IconButton>
 270 | 
 271 |           <IconButton title="Toggle theme" onClick={toggleTheme}>
 272 |             <VscColorMode />
 273 |           </IconButton>
 274 |         </Actions>
 275 |       </TopBar>
 276 | 
 277 |       <StatRow>
 278 |         <StatCard $variant="surface" $padding={3} $radius="md">
 279 |           <StatLabel>Workspaces</StatLabel>
 280 |           <StatValue>{stats.total}</StatValue>
 281 |           <StatMeta>All saved projects</StatMeta>
 282 |         </StatCard>
 283 | 
 284 |         <StatCard $variant="surface" $padding={3} $radius="md">
 285 |           <StatLabel>Total Groups</StatLabel>
 286 |           <StatValue>{stats.groups}</StatValue>
 287 |           <StatMeta>Across your library</StatMeta>
 288 |         </StatCard>
 289 | 
 290 |         <StatCard $variant="surface" $padding={3} $radius="md">
 291 |           <StatLabel>Active</StatLabel>
 292 |           <StatValue>{stats.activeName}</StatValue>
 293 |           <StatMeta>Currently selected</StatMeta>
 294 |         </StatCard>
 295 | 
 296 |         <StatCard $variant="surface" $padding={3} $radius="md">
 297 |           <StatLabel>Most Recent</StatLabel>
 298 |           <StatValue>{stats.recent}</StatValue>
 299 |           <StatMeta>Latest open time</StatMeta>
 300 |         </StatCard>
 301 |       </StatRow>
 302 | 
 303 |       <ContentGrid>
 304 |         <Panel $variant="surface" $padding={3} $radius="md">
 305 |           <Heading style={{ marginBottom: 6 }}>Your Workspaces</Heading>
 306 |           <Subtext>Open, delete, or use the palette to teleport.</Subtext>
 307 | 
 308 |           <Divider />
 309 | 
 310 |           <WorkspaceGrid
 311 |             workspaces={workspaces}
 312 |             activeId={activeId}
 313 |             onOpen={openWorkspace}
 314 |             onDelete={requestDelete}
 315 |           />
 316 |         </Panel>
 317 | 
 318 |         <Panel $variant="surface" $padding={3} $radius="md">
 319 |           <Heading style={{ marginBottom: 6 }}>Create</Heading>
 320 |           <Subtext>Spin up a new workspace in seconds.</Subtext>
 321 | 
 322 |           <Divider />
 323 | 
 324 |           <CreateWorkspaceCard />
 325 |         </Panel>
 326 |       </ContentGrid>
 327 | 
 328 |       <WorkspaceCommandPalette
 329 |         isOpen={palette.isOpen}
 330 |         onClose={palette.close}
 331 |         workspaces={workspaces}
 332 |         activeId={activeId}
 333 |         onOpen={(id) => {
 334 |           palette.close();
 335 |           openWorkspace(id);
 336 |         }}
 337 |         onDelete={(ws) => {
 338 |           palette.close();
 339 |           requestDelete(ws);
 340 |         }}
 341 |       />
 342 | 
 343 |       <Modal
 344 |         isOpen={Boolean(pendingDelete)}
 345 |         onClose={() => setPendingDelete(null)}
 346 |         title="Delete workspace?"
 347 |       >
 348 |         <ConfirmBody>
 349 |           <ConfirmTitle>
 350 |             Delete <span style={{ color: "inherit" }}>{pendingDelete?.name ?? "this workspace"}</span>?
 351 |           </ConfirmTitle>
 352 |           <Subtext>
 353 |             This removes it from your saved library. (Your files on disk are untouched.)
 354 |           </Subtext>
 355 | 
 356 |           <ConfirmActions>
 357 |             <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
 358 |             <Button $danger onClick={confirmDelete}>
 359 |               <VscTrash />
 360 |               Delete
 361 |               <VscChevronRight />
 362 |             </Button>
 363 |           </ConfirmActions>
 364 |         </ConfirmBody>
 365 |       </Modal>
 366 |     </Page>
 367 |   );
 368 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/pages/WelcomePage.tsx">
   1 | import styled from "styled-components";
   2 | import { useTheme } from "@features/theme/useTheme";
   3 | import { CreateWorkspaceCard } from "@components/CreateWorkspaceCard";
   4 | 
   5 | const Container = styled.div`
   6 |   height: 100%;
   7 |   display: flex;
   8 |   align-items: center;
   9 |   justify-content: center;
  10 | `;
  11 | 
  12 | 
  13 | const IconButton = styled.button`
  14 |   background: transparent;
  15 |   border: 1px solid ${({ theme }) => theme.colors.border};
  16 |   color: ${({ theme }) => theme.colors.text.secondary};
  17 |   padding: 8px;
  18 |   border-radius: 4px;
  19 |   cursor: pointer;
  20 |   display: flex;
  21 |   align-items: center;
  22 |   justify-content: center;
  23 |   transition: all 0.2s;
  24 | 
  25 |   &:hover {
  26 |     background: ${({ theme }) => theme.colors.bg.overlay};
  27 |     color: ${({ theme }) => theme.colors.text.primary};
  28 |   }
  29 | `;
  30 | 
  31 | const TopRight = styled.div`
  32 |   position: absolute;
  33 |   top: 20px;
  34 |   right: 20px;
  35 | `;
  36 | 
  37 | export const WelcomePage = () => {
  38 |   const { toggle: toggleTheme, isDark } = useTheme();
  39 | 
  40 |   return (
  41 |     <Container>
  42 |       <TopRight>
  43 |         <IconButton onClick={toggleTheme} title="Toggle Theme">
  44 |           {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
  45 |         </IconButton>
  46 |       </TopRight>
  47 |         <CreateWorkspaceCard/>
  48 |     </Container>
  49 |   );
  50 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/pages/WorkspacePage.tsx">
   1 | import { GraphCanvas } from '@components/AxonGraph/GraphCanvas';
   2 | import { InspectorPanel } from '@components/Inspector/InspectorPanel';
   3 | import React, { useState, useCallback, useEffect, useRef } from 'react';
   4 | import styled from 'styled-components';
   5 | 
   6 | const PageContainer = styled.div`
   7 |   display: flex;
   8 |   width: 100vw;
   9 |   height: 100vh;
  10 |   overflow: hidden;
  11 | `;
  12 | 
  13 | const CanvasArea = styled.div`
  14 |   flex: 1;
  15 |   position: relative;
  16 |   min-width: 0; /* Prevents flex items from overflowing */
  17 | `;
  18 | 
  19 | const InspectorArea = styled.div<{ $width: number }>`
  20 |   width: ${({ $width }) => $width}px;
  21 |   min-width: 250px;
  22 |   max-width: 800px;
  23 |   position: relative;
  24 |   display: flex;
  25 |   flex-direction: column;
  26 | `;
  27 | 
  28 | const ResizerHandle = styled.div<{ $isResizing: boolean }>`
  29 |   width: 4px; /* The clickable area width */
  30 |   cursor: col-resize;
  31 |   background-color: ${({ theme, $isResizing }) => 
  32 |     $isResizing ? theme.colors.palette.primary : 'transparent'};
  33 |   border-left: 1px solid ${({ theme }) => theme.colors.border};
  34 |   transition: background-color 0.2s;
  35 |   z-index: 10;
  36 |   
  37 |   /* Hover effect to show it's draggable */
  38 |   &:hover {
  39 |     background-color: ${({ theme }) => theme.colors.palette.primary};
  40 |   }
  41 | `;
  42 | 
  43 | export const WorkspacePage = () => {
  44 |   const [width, setWidth] = useState(() => {
  45 |     const saved = localStorage.getItem('axon_inspector_width');
  46 |     return saved ? parseInt(saved, 10) : 400;
  47 |   });
  48 |   
  49 |   const [isResizing, setIsResizing] = useState(false);
  50 |   const sidebarRef = useRef<HTMLDivElement>(null);
  51 | 
  52 |   const startResizing = useCallback((e: React.MouseEvent) => {
  53 |     e.preventDefault(); // Prevent text selection
  54 |     setIsResizing(true);
  55 |   }, []);
  56 | 
  57 |   useEffect(() => {
  58 |     if (!isResizing) return;
  59 | 
  60 |     const handleMouseMove = (e: MouseEvent) => {
  61 |       const newWidth = document.body.clientWidth - e.clientX;
  62 |       
  63 |       if (newWidth > 250 && newWidth < 800) {
  64 |         setWidth(newWidth);
  65 |       }
  66 |     };
  67 | 
  68 |     const handleMouseUp = () => {
  69 |       setIsResizing(false);
  70 |       localStorage.setItem('axon_inspector_width', width.toString());
  71 |     };
  72 | 
  73 |     window.addEventListener('mousemove', handleMouseMove);
  74 |     window.addEventListener('mouseup', handleMouseUp);
  75 | 
  76 |     return () => {
  77 |       window.removeEventListener('mousemove', handleMouseMove);
  78 |       window.removeEventListener('mouseup', handleMouseUp);
  79 |     };
  80 |   }, [isResizing, width]);
  81 | 
  82 |   return (
  83 |     <PageContainer>
  84 |       <CanvasArea>
  85 |         <GraphCanvas />
  86 |       </CanvasArea>
  87 | 
  88 |       <ResizerHandle 
  89 |         onMouseDown={startResizing} 
  90 |         $isResizing={isResizing}
  91 |       />
  92 |       
  93 |       <InspectorArea ref={sidebarRef} $width={width}>
  94 |         <InspectorPanel />
  95 |       </InspectorArea>
  96 |     </PageContainer>
  97 |   );
  98 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/theme/GlobalStyles.ts">
   1 | import { createGlobalStyle } from 'styled-components';
   2 | import type { AxonTheme } from '../types/themeTypes';
   3 | 
   4 | export const GlobalStyles = createGlobalStyle<{ theme: AxonTheme }>`
   5 |   * {
   6 |     box-sizing: border-box;
   7 |     margin: 0;
   8 |     padding: 0;
   9 |   }
  10 | 
  11 |   html, body, #root {
  12 |     width: 100%;
  13 |     height: 100%;
  14 |     overflow: hidden; /* Important for a canvas-based app! */
  15 |   }
  16 | 
  17 |   body {
  18 |     background-color: ${({ theme }) => theme.colors.bg.main};
  19 |     color: ${({ theme }) => theme.colors.text.primary};
  20 |     font-family: ${({ theme }) => theme.typography.fontFamily};
  21 |     font-size: ${({ theme }) => theme.typography.sizes.md};
  22 |     -webkit-font-smoothing: antialiased;
  23 |   }
  24 | 
  25 |   /* Custom Scrollbar */
  26 |   ::-webkit-scrollbar {
  27 |     width: 8px;
  28 |     height: 8px;
  29 |   }
  30 |   ::-webkit-scrollbar-track {
  31 |     background: transparent;
  32 |   }
  33 |   ::-webkit-scrollbar-thumb {
  34 |     background: ${({ theme }) => theme.colors.border};
  35 |     border-radius: 4px;
  36 |   }
  37 |   ::-webkit-scrollbar-thumb:hover {
  38 |     background: ${({ theme }) => theme.colors.text.muted};
  39 |   }
  40 | `;
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
   1 | 
   2 | import type { Node } from "@xyflow/react";
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
  22 |  * Data associated with a Group Node.
  23 |  * This is mostly frontend-specific (Config Mode vs View Mode).
  24 |  */
  25 | export interface GroupNodeData {
  26 |   label: string;
  27 |   entryPoint: string | null;
  28 |   depth: number;
  29 |   [key: string]: any;
  30 | }
  31 | 
  32 | 
  33 | export type AxonNode = Node<FileNodeData | GroupNodeData, 'fileNode' | 'groupNode'>;
  34 | 
  35 | export interface AxonEdge {
  36 |   id: string;
  37 |   source: string;
  38 |   target: string;
  39 |   
  40 |   label?: string;
  41 |   animated?: boolean;
  42 |   style?: React.CSSProperties;
  43 |   type?: string; // 'default', 'straight', 'step', 'smoothstep'
  44 | }
  45 | 
  46 | 
  47 | /**
  48 |  * Matches the `PromptOptions` struct in Rust.
  49 |  * Used for generate_group_prompt and generate_combined_prompt.
  50 |  */
  51 | export interface PromptOptions {
  52 |   showLineNumbers: boolean;
  53 |   removeComments: boolean;
  54 |   redactions: string[];
  55 |   
  56 |   skeletonMode: string; 
  57 |   skeletonTargets: string[];
  58 | }
  59 | 
  60 | /**
  61 |  * Request payload for scanning a single group
  62 |  */
  63 | export interface ScanParams {
  64 |   groupId: string;
  65 |   projectRoot: string;
  66 |   entryPoint: string;
  67 |   depth: number;
  68 |   flatten: boolean;
  69 | }
  70 | 
  71 | /**
  72 |  * Request payload for combining multiple groups
  73 |  */
  74 | export interface GroupRequest {
  75 |   entryPoint: string;
  76 |   depth: number;
  77 |   flatten: boolean;
  78 | }
  79 | 
  80 | /**
  81 |  * The raw response from the Rust `scan_workspace_group` command
  82 |  */
  83 | export interface ScanResponse {
  84 |   nodes: AxonNode[];
  85 |   edges: AxonEdge[];
  86 | }
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
   1 | export type SkeletonMode = 'all' | 'keepOnly' | 'stripOnly';
   2 | 
   3 | export interface AxonGroup {
   4 |   id: string;        
   5 |   name: string;
   6 |   entryPoint: string;
   7 |   depth: number;
   8 |   flatten: boolean; 
   9 |   isActive: boolean;      
  10 | }
  11 | 
  12 | export interface WorkspaceState {
  13 |   id: string;
  14 |   name: string;
  15 |   projectRoot: string; 
  16 |   tsConfigPath: string | null;
  17 |   selectedGroupId: string | null;
  18 |   
  19 |   skeletonMode: SkeletonMode;
  20 |   redactions: string[]; 
  21 |   skeletonTargets: string[];
  22 |   
  23 |   showLineNumbers: boolean;
  24 |   removeComments: boolean;
  25 | }
</file>

