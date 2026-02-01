# Context Map
- G:/Lesgo Coding Projects/axon/client-axon/src/App.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/AppRoutes.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/layouts/MainLayout.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/index.css
- G:/Lesgo Coding Projects/axon/client-axon/src/main.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useToggle.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/BiColorEdge.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/FileNode.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphCanvas.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphToolbar.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GroupNode.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/CreateWorkspaceCard/CreateWorkspaceCard.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Explorer/FileTree.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/FileSelector/FileSelectorModal.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/FileViewer/FileViewer.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/InspectorPanel.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/PromptRuleEditor.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/RootConfigView.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/LibraryHub/WorkspaceCommandPalette.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/LibraryHub/WorkspaceGrid.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Sidebar/Sidebar.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Modal.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Surface.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Toast.tsx
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
   1 | import { BrowserRouter } from "react-router-dom";
   2 | import { ThemeProvider } from "styled-components";
   3 | import { useAppSelector } from "./app/hooks";
   4 | import { selectCurrentTheme } from "@features/theme/themeSlice";
   5 | import { GlobalStyles } from "@theme/GlobalStyles";
   6 | import { AppRoutes } from "./app/AppRoutes";
   7 | import { ToastProvider } from "@components/ui/Toast";
   8 | 
   9 | function App() {
  10 |   const theme = useAppSelector(selectCurrentTheme);
  11 | 
  12 |   return (
  13 |     <ThemeProvider theme={theme}>
  14 |       <GlobalStyles theme={theme} />
  15 |       <ToastProvider>
  16 |         <BrowserRouter>
  17 |           <AppRoutes />
  18 |         </BrowserRouter>
  19 |       </ToastProvider>
  20 |     </ThemeProvider>
  21 |   );
  22 | }
  23 | 
  24 | export default App;
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/index.css">
   1 | :root {
   2 |   font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
   3 |   line-height: 1.5;
   4 |   font-weight: 400;
   5 | 
   6 |   color-scheme: light dark;
   7 |   color: rgba(255, 255, 255, 0.87);
   8 |   background-color: #242424;
   9 | 
  10 |   font-synthesis: none;
  11 |   text-rendering: optimizeLegibility;
  12 |   -webkit-font-smoothing: antialiased;
  13 |   -moz-osx-font-smoothing: grayscale;
  14 | }
  15 | 
  16 | a {
  17 |   font-weight: 500;
  18 |   color: #646cff;
  19 |   text-decoration: inherit;
  20 | }
  21 | a:hover {
  22 |   color: #535bf2;
  23 | }
  24 | 
  25 | body {
  26 |   margin: 0;
  27 |   display: flex;
  28 |   place-items: center;
  29 |   min-width: 320px;
  30 |   min-height: 100vh;
  31 | }
  32 | 
  33 | h1 {
  34 |   font-size: 3.2em;
  35 |   line-height: 1.1;
  36 | }
  37 | 
  38 | button {
  39 |   border-radius: 8px;
  40 |   border: 1px solid transparent;
  41 |   padding: 0.6em 1.2em;
  42 |   font-size: 1em;
  43 |   font-weight: 500;
  44 |   font-family: inherit;
  45 |   background-color: #1a1a1a;
  46 |   cursor: pointer;
  47 |   transition: border-color 0.25s;
  48 | }
  49 | button:hover {
  50 |   border-color: #646cff;
  51 | }
  52 | button:focus,
  53 | button:focus-visible {
  54 |   outline: 4px auto -webkit-focus-ring-color;
  55 | }
  56 | 
  57 | @media (prefers-color-scheme: light) {
  58 |   :root {
  59 |     color: #213547;
  60 |     background-color: #ffffff;
  61 |   }
  62 |   a:hover {
  63 |     color: #747bff;
  64 |   }
  65 |   button {
  66 |     background-color: #f9f9f9;
  67 |   }
  68 | }
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/main.tsx">
   1 | import { StrictMode } from "react";
   2 | import { createRoot } from "react-dom/client";
   3 | import { Provider } from "react-redux";
   4 | import { persistor, store } from "@app/store";
   5 | import App from "./App";
   6 | import "./index.css";
   7 | import { PersistGate } from "redux-persist/integration/react";
   8 | 
   9 | createRoot(document.getElementById("root")!).render(
  10 |   <StrictMode>
  11 |     <Provider store={store}>
  12 |       <PersistGate loading={null} persistor={persistor}>
  13 |       <App />
  14 |       </PersistGate>
  15 |     </Provider>
  16 |   </StrictMode>,
  17 | );
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/BiColorEdge.tsx">
   1 | import { memo } from "react";
   2 | import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
   3 | import { useTheme } from "styled-components";
   4 | 
   5 | export const BiColorEdge = memo((props: EdgeProps) => {
   6 |   const theme = useTheme();
   7 | 
   8 |   const {
   9 |     id,
  10 |     sourceX,
  11 |     sourceY,
  12 |     targetX,
  13 |     targetY,
  14 |     sourcePosition,
  15 |     targetPosition,
  16 |     style,
  17 |     markerEnd,
  18 |     markerStart,
  19 |   } = props;
  20 | 
  21 |   const [path] = getBezierPath({
  22 |     sourceX,
  23 |     sourceY,
  24 |     targetX,
  25 |     targetY,
  26 |     sourcePosition,
  27 |     targetPosition,
  28 |   });
  29 | 
  30 |   const start = theme.colors.palette.primary;
  31 |   const end = theme.colors.palette.success;
  32 | 
  33 |   const gradId = `axon-grad-${id}`;
  34 | 
  35 |   return (
  36 |     <>
  37 |       <defs>
  38 |         <linearGradient
  39 |           id={gradId}
  40 |           gradientUnits="userSpaceOnUse"
  41 |           x1={sourceX}
  42 |           y1={sourceY}
  43 |           x2={targetX}
  44 |           y2={targetY}
  45 |         >
  46 |           <stop offset="0%" stopColor={start} stopOpacity={1} />
  47 |           <stop offset="100%" stopColor={end} stopOpacity={1} />
  48 |         </linearGradient>
  49 |       </defs>
  50 | 
  51 |       <BaseEdge
  52 |         path={path}
  53 |         markerEnd={markerEnd}
  54 |         markerStart={markerStart}
  55 |         style={{
  56 |           ...(style ?? {}),
  57 |           stroke: `url(#${gradId})`,
  58 |         }}
  59 |       />
  60 |     </>
  61 |   );
  62 | });
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/FileNode.tsx">
   1 | import { memo, useMemo, useState } from "react";
   2 | import { Handle, Position, type NodeProps } from "@xyflow/react";
   3 | import styled from "styled-components";
   4 | import { VscCode, VscSymbolMethod, VscSymbolVariable } from "react-icons/vsc";
   5 | import type { AxonNode } from "@axon-types/axonTypes";
   6 | import { useWorkspace } from "@features/workspace/useWorkspace";
   7 | 
   8 | const NodeContainer = styled.div<{ $selected?: boolean }>`
   9 |   position: relative;
  10 |   background: #252526;
  11 |   border: 1px solid ${(props) => (props.$selected ? "#007acc" : "#454545")};
  12 |   border-radius: 4px;
  13 |   padding: 12px;
  14 |   color: #cccccc;
  15 |   min-width: 230px;
  16 |   font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  17 |   box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  18 |   transition: border-color 0.2s ease;
  19 | `;
  20 | 
  21 | const NodeHeader = styled.div`
  22 |   display: flex;
  23 |   align-items: center;
  24 |   gap: 8px;
  25 |   border-bottom: 1px solid #333;
  26 |   padding-bottom: 8px;
  27 |   margin-bottom: 8px;
  28 |   font-weight: 600;
  29 |   font-size: 13px;
  30 |   color: #e1e1e1;
  31 | `;
  32 | 
  33 | const RuleBadges = styled.div`
  34 |   margin-left: auto;
  35 |   display: flex;
  36 |   gap: 6px;
  37 |   align-items: center;
  38 |   font-size: 10px;
  39 |   opacity: 0.85;
  40 | `;
  41 | 
  42 | const Badge = styled.div<{ $tone: "target" | "redact" }>`
  43 |   padding: 2px 6px;
  44 |   border-radius: 999px;
  45 |   border: 1px solid ${({ $tone }) => ($tone === "redact" ? "#d13438" : "#b08800")};
  46 |   color: ${({ $tone }) => ($tone === "redact" ? "#d13438" : "#b08800")};
  47 | `;
  48 | 
  49 | const SymbolList = styled.div`
  50 |   display: flex;
  51 |   flex-direction: column;
  52 |   gap: 4px;
  53 | `;
  54 | 
  55 | const SectionLabel = styled.div`
  56 |   font-size: 9px;
  57 |   text-transform: uppercase;
  58 |   color: #666;
  59 |   margin: 4px 0;
  60 |   font-weight: bold;
  61 | `;
  62 | 
  63 | const SymbolRow = styled.div<{ $state: "normal" | "target" | "redact" }>`
  64 |   display: flex;
  65 |   align-items: center;
  66 |   justify-content: space-between;
  67 |   gap: 8px;
  68 | 
  69 |   background: #1e1e1e;
  70 |   border: 1px solid #333;
  71 |   padding: 2px 6px;
  72 |   border-radius: 3px;
  73 |   font-size: 11px;
  74 | 
  75 |   color: ${({ $state }) =>
  76 |     $state === "redact" ? "#d13438" : $state === "target" ? "#d7ba7d" : "#4fc1ff"};
  77 | 
  78 |   ${({ $state }) =>
  79 |     $state === "redact"
  80 |       ? "border-color: #d13438;"
  81 |       : $state === "target"
  82 |         ? "border-color: #b08800;"
  83 |         : ""}
  84 | 
  85 |   svg {
  86 |     flex-shrink: 0;
  87 |     color: #b4a7d6;
  88 |   }
  89 | `;
  90 | 
  91 | const RowLeft = styled.div`
  92 |   display: inline-flex;
  93 |   align-items: center;
  94 |   gap: 6px;
  95 |   min-width: 0;
  96 | `;
  97 | 
  98 | const SymbolName = styled.span`
  99 |   overflow: hidden;
 100 |   text-overflow: ellipsis;
 101 |   white-space: nowrap;
 102 | `;
 103 | 
 104 | const Actions = styled.div`
 105 |   display: inline-flex;
 106 |   gap: 6px;
 107 |   align-items: center;
 108 |   flex-shrink: 0;
 109 | `;
 110 | 
 111 | const MiniBtn = styled.button<{ $active?: boolean; $tone?: "target" | "redact" }>`
 112 |   border-radius: 999px;
 113 |   padding: 2px 8px;
 114 |   font-size: 10px;
 115 |   cursor: pointer;
 116 | 
 117 |   border: 1px solid
 118 |     ${({ $tone, $active }) =>
 119 |       $tone === "redact"
 120 |         ? $active
 121 |           ? "#d13438"
 122 |           : "#5a2a2c"
 123 |         : $active
 124 |           ? "#b08800"
 125 |           : "#4a3b16"};
 126 | 
 127 |   color: ${({ $tone, $active }) =>
 128 |     $tone === "redact"
 129 |       ? $active
 130 |         ? "#d13438"
 131 |         : "#c58f92"
 132 |       : $active
 133 |         ? "#d7ba7d"
 134 |         : "#cbbf9b"};
 135 | 
 136 |   background: transparent;
 137 | 
 138 |   opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
 139 |   pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
 140 | 
 141 |   &:hover {
 142 |     filter: brightness(1.15);
 143 |   }
 144 | `;
 145 | 
 146 | const MoreLink = styled.button`
 147 |   background: transparent;
 148 |   border: none;
 149 |   padding: 2px 0;
 150 |   text-align: left;
 151 |   cursor: pointer;
 152 |   font-size: 10px;
 153 |   color: #9cdcfe;
 154 |   opacity: 0.9;
 155 | 
 156 |   &:hover {
 157 |     opacity: 1;
 158 |     text-decoration: underline;
 159 |   }
 160 | `;
 161 | 
 162 | function toggle(list: string[], item: string) {
 163 |   return list.includes(item) ? list.filter((x) => x !== item) : [...list, item].sort();
 164 | }
 165 | 
 166 | function basename(p: string) {
 167 |   const parts = p.split(/[\\/]/g);
 168 |   return parts[parts.length - 1] || p;
 169 | }
 170 | 
 171 | const handleCommonStyle: React.CSSProperties = {
 172 |   width: 10,
 173 |   height: 10,
 174 |   borderRadius: 3,
 175 |   background: "#2d2d2d",
 176 |   border: "1px solid #777",
 177 | };
 178 | 
 179 | export const FileNode = memo(({ data, selected }: NodeProps<AxonNode>) => {
 180 |   const { config, setOptions } = useWorkspace();
 181 |   const [showAllDefs, setShowAllDefs] = useState(false);
 182 |   const [showAllCalls, setShowAllCalls] = useState(false);
 183 | 
 184 |   const fileName = useMemo(() => {
 185 |     const label = (data as any)?.label as string | undefined;
 186 |     const path = (data as any)?.path as string | undefined;
 187 |     return label?.trim() || (path ? basename(path) : "UnknownFile");
 188 |   }, [data]);
 189 | 
 190 |   const redactions = config?.redactions ?? [];
 191 |   const skeletonTargets = config?.skeletonTargets ?? [];
 192 |   const skeletonMode = config?.skeletonMode ?? "stripOnly";
 193 | 
 194 |   const canTargetImpl = skeletonMode !== "all";
 195 |   const implVerb = skeletonMode === "keepOnly" ? "Keep" : "Strip";
 196 | 
 197 |   const fileTargetCount = useMemo(
 198 |     () => skeletonTargets.filter((t) => t.startsWith(`${fileName}:`)).length,
 199 |     [skeletonTargets, fileName]
 200 |   );
 201 | 
 202 |   const fileRedactCount = useMemo(
 203 |     () => redactions.filter((r) => r.startsWith(`${fileName}:`)).length,
 204 |     [redactions, fileName]
 205 |   );
 206 | 
 207 |   const makeToken = (symbol: string) => `${fileName}:${symbol}`;
 208 | 
 209 |   const toggleImpl = (token: string) => {
 210 |     if (!config) return;
 211 | 
 212 |     const nextTargets = toggle(skeletonTargets, token);
 213 |     const nextRedactions = redactions.includes(token)
 214 |       ? redactions.filter((r) => r !== token)
 215 |       : redactions;
 216 | 
 217 |     setOptions({ skeletonTargets: nextTargets, redactions: nextRedactions });
 218 |   };
 219 | 
 220 |   const toggleRedact = (token: string) => {
 221 |     if (!config) return;
 222 | 
 223 |     const nextRedactions = toggle(redactions, token);
 224 |     const nextTargets = skeletonTargets.includes(token)
 225 |       ? skeletonTargets.filter((t) => t !== token)
 226 |       : skeletonTargets;
 227 | 
 228 |     setOptions({ redactions: nextRedactions, skeletonTargets: nextTargets });
 229 |   };
 230 | 
 231 |   const defs = ((data as any)?.definitions as string[]) ?? [];
 232 |   const calls = ((data as any)?.calls as string[]) ?? [];
 233 | 
 234 |   const defSlice = showAllDefs ? defs : defs.slice(0, 3);
 235 |   const callSlice = showAllCalls ? calls : calls.slice(0, 2);
 236 | 
 237 |   const renderSymbol = (symbol: string, kind: "def" | "call") => {
 238 |     const token = makeToken(symbol);
 239 |     const isRedact = redactions.includes(token);
 240 |     const isTarget = skeletonTargets.includes(token);
 241 | 
 242 |     const state: "normal" | "target" | "redact" = isRedact
 243 |       ? "redact"
 244 |       : isTarget
 245 |         ? "target"
 246 |         : "normal";
 247 | 
 248 |     return (
 249 |       <SymbolRow key={`${kind}:${symbol}`} $state={state}>
 250 |         <RowLeft>
 251 |           {kind === "def" ? <VscSymbolMethod size={12} /> : <VscSymbolVariable size={12} />}
 252 |           <SymbolName title={token}>{symbol}</SymbolName>
 253 |         </RowLeft>
 254 | 
 255 |         <Actions>
 256 |           <MiniBtn
 257 |             $tone="target"
 258 |             $active={isTarget}
 259 |             disabled={!canTargetImpl}
 260 |             onClick={(e) => {
 261 |               e.stopPropagation();
 262 |               toggleImpl(token);
 263 |             }}
 264 |             title={
 265 |               !canTargetImpl
 266 |                 ? "Targets are ignored in “all” mode"
 267 |                 : `${implVerb} implementation for ${token}`
 268 |             }
 269 |           >
 270 |             {implVerb}
 271 |           </MiniBtn>
 272 | 
 273 |           <MiniBtn
 274 |             $tone="redact"
 275 |             $active={isRedact}
 276 |             onClick={(e) => {
 277 |               e.stopPropagation();
 278 |               toggleRedact(token);
 279 |             }}
 280 |             title={`Redact ${token}`}
 281 |           >
 282 |             Redact
 283 |           </MiniBtn>
 284 |         </Actions>
 285 |       </SymbolRow>
 286 |     );
 287 |   };
 288 | 
 289 |   return (
 290 |     <NodeContainer $selected={selected}>
 291 |       {/* incoming (top) */}
 292 |       <Handle
 293 |         id="in"
 294 |         type="target"
 295 |         position={Position.Top}
 296 |         isConnectable={false}
 297 |         style={{
 298 |           ...handleCommonStyle,
 299 |           top: -6,
 300 |         }}
 301 |       />
 302 | 
 303 |       <NodeHeader>
 304 |         <VscCode size={16} color="#519aba" />
 305 |         <span
 306 |           style={{
 307 |             overflow: "hidden",
 308 |             textOverflow: "ellipsis",
 309 |             whiteSpace: "nowrap",
 310 |           }}
 311 |           title={(data as any)?.path ?? fileName}
 312 |         >
 313 |           {fileName}
 314 |         </span>
 315 | 
 316 |         {(fileTargetCount > 0 || fileRedactCount > 0) && (
 317 |           <RuleBadges>
 318 |             {fileTargetCount > 0 && <Badge $tone="target">{fileTargetCount} impl</Badge>}
 319 |             {fileRedactCount > 0 && <Badge $tone="redact">{fileRedactCount} red</Badge>}
 320 |           </RuleBadges>
 321 |         )}
 322 |       </NodeHeader>
 323 | 
 324 |       {defs.length > 0 && (
 325 |         <>
 326 |           <SectionLabel>Exports/Definitions</SectionLabel>
 327 |           <SymbolList>
 328 |             {defSlice.map((d) => renderSymbol(d, "def"))}
 329 |             {defs.length > 3 && (
 330 |               <MoreLink
 331 |                 onClick={(e) => {
 332 |                   e.stopPropagation();
 333 |                   setShowAllDefs((v) => !v);
 334 |                 }}
 335 |               >
 336 |                 {showAllDefs ? "Show less" : `+ ${defs.length - 3} more`}
 337 |               </MoreLink>
 338 |             )}
 339 |           </SymbolList>
 340 |         </>
 341 |       )}
 342 | 
 343 |       {calls.length > 0 && (
 344 |         <>
 345 |           <SectionLabel>Key Dependencies</SectionLabel>
 346 |           <SymbolList>
 347 |             {callSlice.map((c) => renderSymbol(c, "call"))}
 348 |             {calls.length > 2 && (
 349 |               <MoreLink
 350 |                 onClick={(e) => {
 351 |                   e.stopPropagation();
 352 |                   setShowAllCalls((v) => !v);
 353 |                 }}
 354 |               >
 355 |                 {showAllCalls ? "Show less" : `+ ${calls.length - 2} more`}
 356 |               </MoreLink>
 357 |             )}
 358 |           </SymbolList>
 359 |         </>
 360 |       )}
 361 | 
 362 |       {/* outgoing (bottom) */}
 363 |       <Handle
 364 |         id="out"
 365 |         type="source"
 366 |         position={Position.Bottom}
 367 |         isConnectable={false}
 368 |         style={{
 369 |           ...handleCommonStyle,
 370 |           bottom: -6,
 371 |         }}
 372 |       />
 373 |     </NodeContainer>
 374 |   );
 375 | });
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphCanvas.tsx">
   1 | import { useCallback, useMemo, useState, useEffect } from "react";
   2 | import {
   3 |   ReactFlow,
   4 |   MiniMap,
   5 |   Controls,
   6 |   Background,
   7 |   BackgroundVariant,
   8 |   addEdge,
   9 |   type Connection,
  10 |   type Node,
  11 |   type Edge,
  12 |   Panel,
  13 | } from "@xyflow/react";
  14 | import "@xyflow/react/dist/style.css";
  15 | import styled, { useTheme } from "styled-components";
  16 | 
  17 | import { FileNode } from "./FileNode";
  18 | import { GroupNode } from "./GroupNode";
  19 | import { GraphToolbar } from "./GraphToolbar";
  20 | import { BiColorEdge } from "./BiColorEdge";
  21 | 
  22 | import { useWorkspace } from "@features/workspace/useWorkspace";
  23 | import { useGraphLayout } from "@features/visualizer/useGraphLayout";
  24 | import { useAppDispatch } from "@app/hooks";
  25 | import { setSelectedNode } from "@features/workspace/workspacesSlice";
  26 | 
  27 | import { Surface } from "@components/ui/Surface";
  28 | import { Subtext } from "@components/ui/Typography";
  29 | import { FileSelectorModal } from "@components/FileSelector/FileSelectorModal";
  30 | import { useFileSystem } from "@features/axon/useFileSystem";
  31 | import { useToggle } from "@app/hooks";
  32 | import { VscFolderOpened, VscPlay } from "react-icons/vsc";
  33 | 
  34 | const CanvasContainer = styled.div`
  35 |   width: 100%;
  36 |   height: 100%;
  37 |   background-color: ${({ theme }) => theme.colors.bg.main};
  38 | 
  39 |   .react-flow__node {
  40 |     font-family: ${({ theme }) => theme.typography.fontFamily};
  41 |     transition: opacity 140ms ease, filter 140ms ease;
  42 |   }
  43 | 
  44 |   .react-flow__edge-path {
  45 |     transition: opacity 140ms ease, stroke-width 140ms ease;
  46 |   }
  47 | 
  48 |   .react-flow__node.axon-dim {
  49 |     opacity: 0.12;
  50 |     filter: grayscale(0.15);
  51 |   }
  52 | 
  53 |   .react-flow__node.axon-highlight {
  54 |     opacity: 1;
  55 |   }
  56 | 
  57 |   .react-flow__node.axon-focus {
  58 |     opacity: 1;
  59 |     filter: drop-shadow(0 0 10px rgba(0, 122, 204, 0.35));
  60 |   }
  61 | `;
  62 | 
  63 | const FocusCard = styled(Surface)`
  64 |   width: 310px;
  65 |   display: flex;
  66 |   flex-direction: column;
  67 |   gap: ${({ theme }) => theme.spacing(1.5)};
  68 | `;
  69 | 
  70 | const Row = styled.div`
  71 |   display: flex;
  72 |   gap: 10px;
  73 |   align-items: center;
  74 | `;
  75 | 
  76 | const Slider = styled.input`
  77 |   width: 100%;
  78 |   accent-color: ${({ theme }) => theme.colors.palette.primary};
  79 | `;
  80 | 
  81 | const Pill = styled.div`
  82 |   border: 1px solid ${({ theme }) => theme.colors.border};
  83 |   background: ${({ theme }) => theme.colors.bg.overlay};
  84 |   color: ${({ theme }) => theme.colors.text.secondary};
  85 |   border-radius: 999px;
  86 |   padding: 4px 8px;
  87 |   font-size: 12px;
  88 | `;
  89 | 
  90 | const SetupOverlay = styled.div`
  91 |   position: absolute;
  92 |   inset: 0;
  93 |   display: grid;
  94 |   place-items: center;
  95 |   pointer-events: none;
  96 |   z-index: 5;
  97 | `;
  98 | 
  99 | const SetupCard = styled(Surface)`
 100 |   width: min(720px, calc(100vw - 80px));
 101 |   pointer-events: auto;
 102 | `;
 103 | 
 104 | const SetupTitle = styled.div`
 105 |   font-size: 16px;
 106 |   font-weight: 900;
 107 |   color: ${({ theme }) => theme.colors.text.primary};
 108 |   margin-bottom: 6px;
 109 | `;
 110 | 
 111 | const SetupGrid = styled.div`
 112 |   display: grid;
 113 |   grid-template-columns: 1fr 120px;
 114 |   gap: 10px;
 115 |   margin-top: 12px;
 116 | 
 117 |   @media (max-width: 720px) {
 118 |     grid-template-columns: 1fr;
 119 |   }
 120 | `;
 121 | 
 122 | const Input = styled.input`
 123 |   width: 100%;
 124 |   border: 1px solid ${({ theme }) => theme.colors.border};
 125 |   border-radius: 6px;
 126 |   padding: 10px 10px;
 127 |   background: ${({ theme }) => theme.colors.bg.main};
 128 |   color: ${({ theme }) => theme.colors.text.primary};
 129 | `;
 130 | 
 131 | const Button = styled.button<{ $primary?: boolean }>`
 132 |   border: 1px solid ${({ theme, $primary }) =>
 133 |     $primary ? "transparent" : theme.colors.border};
 134 |   background: ${({ theme, $primary }) =>
 135 |     $primary ? theme.colors.palette.primary : "transparent"};
 136 |   color: ${({ theme, $primary }) => ($primary ? "#fff" : theme.colors.text.primary)};
 137 |   border-radius: 6px;
 138 |   padding: 10px 12px;
 139 |   cursor: pointer;
 140 |   display: inline-flex;
 141 |   gap: 8px;
 142 |   align-items: center;
 143 |   justify-content: center;
 144 |   font-weight: 800;
 145 | 
 146 |   &:disabled {
 147 |     opacity: 0.6;
 148 |     cursor: not-allowed;
 149 |   }
 150 | 
 151 |   &:hover:enabled {
 152 |     filter: brightness(1.06);
 153 |   }
 154 | `;
 155 | 
 156 | const Inline = styled.div`
 157 |   display: flex;
 158 |   gap: 10px;
 159 |   align-items: center;
 160 | `;
 161 | 
 162 | const Label = styled.div`
 163 |   font-size: 12px;
 164 |   color: ${({ theme }) => theme.colors.text.muted};
 165 |   font-weight: 700;
 166 |   text-transform: uppercase;
 167 | `;
 168 | 
 169 | function collectAncestors(startId: string, parentById: Map<string, string | undefined>) {
 170 |   const out = new Set<string>();
 171 |   let cur: string | undefined = startId;
 172 |   while (cur) {
 173 |     const p = parentById.get(cur);
 174 |     if (!p) break;
 175 |     out.add(p);
 176 |     cur = p;
 177 |   }
 178 |   return out;
 179 | }
 180 | 
 181 | function computeHighlight(
 182 |   focusId: string,
 183 |   nodes: Node[],
 184 |   edges: Edge[],
 185 |   depth: number
 186 | ) {
 187 |   const byId = new Map<string, any>();
 188 |   const parentById = new Map<string, string | undefined>();
 189 |   const childrenByParent = new Map<string, string[]>();
 190 | 
 191 |   for (const n of nodes as any[]) {
 192 |     byId.set(n.id, n);
 193 |     parentById.set(n.id, n.parentId);
 194 |     if (n.parentId) {
 195 |       if (!childrenByParent.has(n.parentId)) childrenByParent.set(n.parentId, []);
 196 |       childrenByParent.get(n.parentId)!.push(n.id);
 197 |     }
 198 |   }
 199 | 
 200 |   const focus = byId.get(focusId);
 201 |   if (!focus) return null;
 202 | 
 203 |   const highlightedNodeIds = new Set<string>();
 204 |   const highlightedEdgeIds = new Set<string>();
 205 |   const relatedGroupIds = new Set<string>();
 206 | 
 207 |   if (focus.type === "groupNode") {
 208 |     const q: string[] = [focusId];
 209 |     highlightedNodeIds.add(focusId);
 210 |     relatedGroupIds.add(focusId);
 211 | 
 212 |     while (q.length) {
 213 |       const cur = q.shift()!;
 214 |       const kids = childrenByParent.get(cur) ?? [];
 215 |       for (const k of kids) {
 216 |         highlightedNodeIds.add(k);
 217 |         q.push(k);
 218 |       }
 219 |     }
 220 | 
 221 |     for (const a of collectAncestors(focusId, parentById)) relatedGroupIds.add(a);
 222 | 
 223 |     for (const e of edges as any[]) {
 224 |       if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
 225 |         highlightedEdgeIds.add(e.id);
 226 |       }
 227 |     }
 228 | 
 229 |     return { highlightedNodeIds, highlightedEdgeIds, relatedGroupIds };
 230 |   }
 231 | 
 232 |   const adj = new Map<string, string[]>();
 233 |   const add = (a: string, b: string) => {
 234 |     if (!adj.has(a)) adj.set(a, []);
 235 |     adj.get(a)!.push(b);
 236 |   };
 237 | 
 238 |   for (const e of edges as any[]) {
 239 |     if (!byId.has(e.source) || !byId.has(e.target)) continue;
 240 |     const s = byId.get(e.source);
 241 |     const t = byId.get(e.target);
 242 |     if (s?.type === "groupNode" || t?.type === "groupNode") continue;
 243 | 
 244 |     add(e.source, e.target);
 245 |     add(e.target, e.source);
 246 |   }
 247 | 
 248 |   const dist = new Map<string, number>();
 249 |   const q: string[] = [focusId];
 250 |   dist.set(focusId, 0);
 251 |   highlightedNodeIds.add(focusId);
 252 | 
 253 |   while (q.length) {
 254 |     const cur = q.shift()!;
 255 |     const d = dist.get(cur)!;
 256 |     if (d >= depth) continue;
 257 | 
 258 |     for (const nxt of adj.get(cur) ?? []) {
 259 |       if (dist.has(nxt)) continue;
 260 |       dist.set(nxt, d + 1);
 261 |       highlightedNodeIds.add(nxt);
 262 |       q.push(nxt);
 263 |     }
 264 |   }
 265 | 
 266 |   for (const e of edges as any[]) {
 267 |     if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
 268 |       highlightedEdgeIds.add(e.id);
 269 |     }
 270 |   }
 271 | 
 272 |   for (const nId of highlightedNodeIds) {
 273 |     for (const a of collectAncestors(nId, parentById)) relatedGroupIds.add(a);
 274 |     const p = parentById.get(nId);
 275 |     if (p) relatedGroupIds.add(p);
 276 |   }
 277 | 
 278 |   return { highlightedNodeIds, highlightedEdgeIds, relatedGroupIds };
 279 | }
 280 | 
 281 | export const GraphCanvas = () => {
 282 |   const theme = useTheme();
 283 |   const dispatch = useAppDispatch();
 284 | 
 285 |   const { projectRoot, scanConfig, setScan } = useWorkspace();
 286 |   const { nodes, edges, onNodesChange, onEdgesChange, setEdges, isScanning, refreshGraph } =
 287 |     useGraphLayout();
 288 | 
 289 |   const [focusId, setFocusId] = useState<string | null>(null);
 290 |   const [highlightDepth, setHighlightDepth] = useState<number>(2);
 291 | 
 292 |   const [entryDraft, setEntryDraft] = useState(scanConfig?.entryPoint ?? "");
 293 |   const [depthDraft, setDepthDraft] = useState<number>(scanConfig?.depth ?? 3);
 294 |   const [flattenDraft, setFlattenDraft] = useState<boolean>(!!scanConfig?.flatten);
 295 | 
 296 |   useEffect(() => {
 297 |     setEntryDraft(scanConfig?.entryPoint ?? "");
 298 |     setDepthDraft(scanConfig?.depth ?? 3);
 299 |     setFlattenDraft(!!scanConfig?.flatten);
 300 |   }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);
 301 | 
 302 |   const filePicker = useToggle();
 303 |   const fs = useFileSystem(projectRoot ?? null);
 304 | 
 305 |   const openPicker = useCallback(() => {
 306 |     if (projectRoot) fs.cd(projectRoot);
 307 |     filePicker.open();
 308 |   }, [projectRoot, fs, filePicker]);
 309 | 
 310 |   const nodeTypes = useMemo(
 311 |     () => ({
 312 |       fileNode: FileNode,
 313 |       groupNode: GroupNode,
 314 |     }),
 315 |     []
 316 |   );
 317 | 
 318 |   const edgeTypes = useMemo(
 319 |     () => ({
 320 |       axonBiColor: BiColorEdge,
 321 |     }),
 322 |     []
 323 |   );
 324 | 
 325 |   const onConnect = useCallback(
 326 |     (params: Connection) => setEdges((eds) => addEdge(params, eds)),
 327 |     [setEdges]
 328 |   );
 329 | 
 330 |   const handleNodeClick = useCallback(
 331 |     (_: any, node: any) => {
 332 |       setFocusId(node?.id ?? null);
 333 | 
 334 |       const fileId = node?.type === "fileNode" ? node.id : null;
 335 |       dispatch(setSelectedNode(fileId));
 336 |     },
 337 |     [dispatch]
 338 |   );
 339 | 
 340 |   const clearFocus = useCallback(() => {
 341 |     setFocusId(null);
 342 |     dispatch(setSelectedNode(null));
 343 |   }, [dispatch]);
 344 | 
 345 |   const highlight = useMemo(() => {
 346 |     if (!focusId) return null;
 347 |     return computeHighlight(focusId, nodes as any, edges as any, highlightDepth);
 348 |   }, [focusId, nodes, edges, highlightDepth]);
 349 | 
 350 |   const displayNodes = useMemo(() => {
 351 |     if (!highlight || !focusId) return nodes;
 352 | 
 353 |     const { highlightedNodeIds, relatedGroupIds } = highlight;
 354 | 
 355 |     return (nodes as any[]).map((n) => {
 356 |       const isFocus = n.id === focusId;
 357 |       const isGroup = n.type === "groupNode";
 358 | 
 359 |       const isHot =
 360 |         highlightedNodeIds.has(n.id) || (isGroup && relatedGroupIds.has(n.id));
 361 | 
 362 |       let className = "";
 363 |       if (!isHot) className = "axon-dim";
 364 |       else className = "axon-highlight";
 365 |       if (isFocus) className = "axon-focus";
 366 | 
 367 |       return { ...n, className };
 368 |     });
 369 |   }, [nodes, highlight, focusId]);
 370 | 
 371 |   const displayEdges = useMemo(() => {
 372 |     if (!highlight || !focusId) {
 373 |       return (edges as any[]).map((e) => ({
 374 |         ...e,
 375 |         animated: false,
 376 |         style: {
 377 |           ...(e.style ?? {}),
 378 |           strokeWidth: 1.2,
 379 |           opacity: 0.55,
 380 |         },
 381 |       }));
 382 |     }
 383 | 
 384 |     const hotIds = highlight.highlightedEdgeIds;
 385 | 
 386 |     return (edges as any[]).map((e) => {
 387 |       const hot = hotIds.has(e.id);
 388 |       return {
 389 |         ...e,
 390 |         animated: hot,
 391 |         style: {
 392 |           ...(e.style ?? {}),
 393 |           strokeWidth: hot ? 2.4 : 1.1,
 394 |           opacity: hot ? 0.95 : 0.06,
 395 |         },
 396 |       };
 397 |     });
 398 |   }, [edges, highlight, focusId]);
 399 | 
 400 |   const runFirstScan = useCallback(async () => {
 401 |     if (!projectRoot) return;
 402 |     if (!entryDraft.trim()) return;
 403 | 
 404 |     setScan({
 405 |       entryPoint: entryDraft.trim(),
 406 |       depth: depthDraft,
 407 |       flatten: flattenDraft,
 408 |     });
 409 | 
 410 |     await refreshGraph({
 411 |       entryPoint: entryDraft.trim(),
 412 |       depth: depthDraft,
 413 |       flatten: flattenDraft,
 414 |     } as any);
 415 |   }, [projectRoot, entryDraft, depthDraft, flattenDraft, setScan, refreshGraph]);
 416 | 
 417 |   return (
 418 |     <CanvasContainer>
 419 |       {/* First scan overlay if entrypoint not set */}
 420 |       {projectRoot && !scanConfig?.entryPoint ? (
 421 |         <SetupOverlay>
 422 |           <SetupCard $variant="overlay" $padding={3} $radius="md" $border>
 423 |             <SetupTitle>Run your first scan</SetupTitle>
 424 |             <Subtext>
 425 |               Choose an entrypoint file + depth. The graph will populate and folders will group automatically.
 426 |             </Subtext>
 427 | 
 428 |             <SetupGrid>
 429 |               <div>
 430 |                 <Label style={{ marginBottom: 6 }}>Entrypoint</Label>
 431 |                 <Input
 432 |                   value={entryDraft}
 433 |                   onChange={(e) => setEntryDraft(e.target.value)}
 434 |                   placeholder="src/main.ts"
 435 |                 />
 436 |               </div>
 437 | 
 438 |               <div>
 439 |                 <Label style={{ marginBottom: 6 }}>Browse</Label>
 440 |                 <Button onClick={openPicker}>
 441 |                   <VscFolderOpened />
 442 |                   Choose
 443 |                 </Button>
 444 |               </div>
 445 | 
 446 |               <div>
 447 |                 <Label style={{ marginBottom: 6 }}>Depth</Label>
 448 |                 <Input
 449 |                   type="number"
 450 |                   min={1}
 451 |                   max={25}
 452 |                   value={depthDraft}
 453 |                   onChange={(e) => setDepthDraft(Math.max(1, Number(e.target.value) || 1))}
 454 |                 />
 455 |               </div>
 456 | 
 457 |               <div>
 458 |                 <Label style={{ marginBottom: 6 }}>Flatten</Label>
 459 |                 <Inline style={{ height: 42 }}>
 460 |                   <input
 461 |                     type="checkbox"
 462 |                     checked={flattenDraft}
 463 |                     onChange={(e) => setFlattenDraft(e.target.checked)}
 464 |                   />
 465 |                   <Subtext>Optional</Subtext>
 466 |                 </Inline>
 467 |               </div>
 468 |             </SetupGrid>
 469 | 
 470 |             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
 471 |               <Button
 472 |                 $primary
 473 |                 onClick={runFirstScan}
 474 |                 disabled={!entryDraft.trim() || isScanning}
 475 |               >
 476 |                 <VscPlay />
 477 |                 {isScanning ? "Scanning…" : "Scan"}
 478 |               </Button>
 479 |             </div>
 480 |           </SetupCard>
 481 | 
 482 |           <FileSelectorModal
 483 |             isOpen={filePicker.isOpen}
 484 |             toggle={filePicker.toggle}
 485 |             fs={fs}
 486 |             mode="file"
 487 |             onSelect={(path) => setEntryDraft(path)}
 488 |           />
 489 |         </SetupOverlay>
 490 |       ) : null}
 491 | 
 492 |       <ReactFlow
 493 |         nodes={displayNodes as any}
 494 |         edges={displayEdges as any}
 495 |         onNodesChange={onNodesChange}
 496 |         onEdgesChange={onEdgesChange}
 497 |         onConnect={onConnect}
 498 |         onNodeClick={handleNodeClick}
 499 |         onPaneClick={clearFocus}
 500 |         nodeTypes={nodeTypes}
 501 |         edgeTypes={edgeTypes}
 502 |         fitView
 503 |         minZoom={0.1}
 504 |         proOptions={{ hideAttribution: true }}
 505 |       >
 506 |         <GraphToolbar onRescan={() => refreshGraph()} isScanning={isScanning} />
 507 | 
 508 |         <Panel position="top-left">
 509 |           <FocusCard $variant="overlay" $padding={2} $radius="md" $border>
 510 |             <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
 511 |               <div
 512 |                 style={{
 513 |                   fontSize: 13,
 514 |                   fontWeight: 900,
 515 |                   color: theme.colors.text.primary,
 516 |                 }}
 517 |               >
 518 |                 Focus
 519 |               </div>
 520 |               <Subtext>
 521 |                 Click a file or folder to highlight. Click empty space to clear.
 522 |               </Subtext>
 523 |               {focusId ? (
 524 |                 <Subtext style={{ margin: 0, opacity: 0.85 }}>
 525 |                   Focused: <span style={{ fontFamily: "monospace" }}>{focusId}</span>
 526 |                 </Subtext>
 527 |               ) : null}
 528 |             </div>
 529 | 
 530 |             <div>
 531 |               <Subtext>Highlight depth</Subtext>
 532 |               <Row style={{ marginTop: 6 }}>
 533 |                 <Slider
 534 |                   type="range"
 535 |                   min={1}
 536 |                   max={6}
 537 |                   value={highlightDepth}
 538 |                   onChange={(e) => setHighlightDepth(Number(e.target.value))}
 539 |                   disabled={!focusId}
 540 |                 />
 541 |                 <Pill>{highlightDepth}</Pill>
 542 |               </Row>
 543 |             </div>
 544 | 
 545 |             <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}>
 546 |               <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
 547 |                 <div
 548 |                   style={{
 549 |                     width: 18,
 550 |                     height: 3,
 551 |                     background: theme.colors.palette.primary,
 552 |                     borderRadius: 2,
 553 |                   }}
 554 |                 />
 555 |                 <Subtext>bottom (outgoing)</Subtext>
 556 |               </div>
 557 |               <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
 558 |                 <div
 559 |                   style={{
 560 |                     width: 18,
 561 |                     height: 3,
 562 |                     background: theme.colors.palette.success,
 563 |                     borderRadius: 2,
 564 |                   }}
 565 |                 />
 566 |                 <Subtext>top (incoming)</Subtext>
 567 |               </div>
 568 |             </div>
 569 |           </FocusCard>
 570 |         </Panel>
 571 | 
 572 |         <Controls style={{ background: "#2d2d2d", fill: "#fff", border: "none" }} />
 573 |         <MiniMap
 574 |           zoomable
 575 |           pannable
 576 |           style={{ background: "#252526", border: "1px solid #454545" }}
 577 |           nodeColor={(n) => (n.type === "groupNode" ? "#2d2d2d" : "#007acc")}
 578 |         />
 579 |         <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#444" />
 580 |       </ReactFlow>
 581 |     </CanvasContainer>
 582 |   );
 583 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GraphToolbar.tsx">
   1 | import { useState } from "react";
   2 | import styled from "styled-components";
   3 | import { Panel } from "@xyflow/react";
   4 | import { VscExport, VscLoading, VscSync } from "react-icons/vsc";
   5 | import { useWorkspace } from "@features/workspace/useWorkspace";
   6 | import { useAxonCore } from "@features/axon/useAxonCore";
   7 | import { useToast } from "@components/ui/Toast";
   8 | import { Modal } from "@components/ui/Modal";
   9 | 
  10 | const ToolbarContainer = styled.div`
  11 |   display: flex;
  12 |   gap: 8px;
  13 | `;
  14 | 
  15 | const ToolButton = styled.button<{ $primary?: boolean }>`
  16 |   background: ${({ theme, $primary }) =>
  17 |     $primary ? theme.colors.palette.primary : theme.colors.bg.surface};
  18 |   color: ${({ theme, $primary }) => ($primary ? "#fff" : theme.colors.text.primary)};
  19 |   border: 1px solid ${({ theme, $primary }) => ($primary ? "transparent" : theme.colors.border)};
  20 |   padding: 8px 12px;
  21 |   border-radius: 4px;
  22 |   cursor: pointer;
  23 |   display: flex;
  24 |   align-items: center;
  25 |   gap: 8px;
  26 |   font-size: 13px;
  27 |   font-weight: 600;
  28 |   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  29 |   transition: all 0.2s;
  30 | 
  31 |   &:hover:enabled {
  32 |     transform: translateY(-1px);
  33 |     filter: brightness(1.1);
  34 |   }
  35 | 
  36 |   &:disabled {
  37 |     opacity: 0.65;
  38 |     cursor: not-allowed;
  39 |     transform: none;
  40 |     filter: none;
  41 |   }
  42 | `;
  43 | 
  44 | const PreviewActions = styled.div`
  45 |   display: flex;
  46 |   justify-content: space-between;
  47 |   align-items: center;
  48 |   gap: 12px;
  49 |   margin-bottom: 10px;
  50 | `;
  51 | 
  52 | const CopyButton = styled.button`
  53 |   background: ${({ theme }) => theme.colors.bg.overlay};
  54 |   border: 1px solid ${({ theme }) => theme.colors.border};
  55 |   color: ${({ theme }) => theme.colors.text.primary};
  56 |   padding: 8px 10px;
  57 |   border-radius: 4px;
  58 |   cursor: pointer;
  59 |   display: inline-flex;
  60 |   align-items: center;
  61 |   gap: 8px;
  62 |   font-weight: 800;
  63 |   font-size: 12px;
  64 | 
  65 |   &:hover {
  66 |     filter: brightness(1.08);
  67 |   }
  68 | `;
  69 | 
  70 | const PreviewBox = styled.pre`
  71 |   margin: 0;
  72 |   background: ${({ theme }) => theme.colors.bg.main};
  73 |   border: 1px solid ${({ theme }) => theme.colors.border};
  74 |   border-radius: 6px;
  75 |   padding: ${({ theme }) => theme.spacing(3)};
  76 |   color: ${({ theme }) => theme.colors.text.primary};
  77 |   font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
  78 |     "Courier New", monospace;
  79 |   font-size: 12px;
  80 |   line-height: 1.45;
  81 |   max-height: 55vh;
  82 |   overflow: auto;
  83 |   white-space: pre-wrap;
  84 | `;
  85 | 
  86 | export const GraphToolbar = ({
  87 |   onRescan,
  88 |   isScanning,
  89 | }: {
  90 |   onRescan: () => void;
  91 |   isScanning: boolean;
  92 | }) => {
  93 |   const { projectRoot, config, scanConfig } = useWorkspace();
  94 |   const { generateCombinedPrompt } = useAxonCore();
  95 |   const toast = useToast();
  96 | 
  97 |   const [isBundling, setIsBundling] = useState(false);
  98 |   const [previewOpen, setPreviewOpen] = useState(false);
  99 |   const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);
 100 | 
 101 |   const canBundle =
 102 |     !!projectRoot && !!config && !!scanConfig?.entryPoint && (scanConfig?.depth ?? 0) > 0;
 103 | 
 104 |   const handleBundle = async () => {
 105 |     if (!projectRoot) {
 106 |       toast.warning("No workspace loaded", "Open or create a workspace first.");
 107 |       return;
 108 |     }
 109 |     if (!scanConfig?.entryPoint) {
 110 |       toast.warning("No entrypoint", "Choose an entry file to scan first.");
 111 |       return;
 112 |     }
 113 |     if (!config) {
 114 |       toast.danger("Missing config", "Root config is unavailable; try reloading the app.");
 115 |       return;
 116 |     }
 117 | 
 118 |     setIsBundling(true);
 119 |     const loadingId = toast.loading(
 120 |       "Bundling prompt…",
 121 |       `Generating markdown from ${scanConfig.entryPoint} (depth ${scanConfig.depth ?? 3})…`
 122 |     );
 123 | 
 124 |     try {
 125 |       const markdown = await generateCombinedPrompt({
 126 |         projectRoot,
 127 |         groups: [
 128 |           {
 129 |             entryPoint: scanConfig.entryPoint,
 130 |             depth: scanConfig.depth ?? 3,
 131 |             flatten: !!scanConfig.flatten,
 132 |           },
 133 |         ],
 134 |         options: config,
 135 |       });
 136 | 
 137 |       await navigator.clipboard.writeText(markdown);
 138 |       setPreviewMarkdown(markdown);
 139 | 
 140 |       toast.dismiss(loadingId);
 141 |       toast.success("Copied to clipboard", "Your prompt markdown is ready.", {
 142 |         actionLabel: "Preview",
 143 |         onAction: () => setPreviewOpen(true),
 144 |         duration: 4500,
 145 |       });
 146 |     } catch (err) {
 147 |       console.error("Bundle failed", err);
 148 |       toast.dismiss(loadingId);
 149 |       toast.danger("Bundle failed", "Check the console for details and try again.", {
 150 |         duration: 6500,
 151 |       });
 152 |     } finally {
 153 |       setIsBundling(false);
 154 |     }
 155 |   };
 156 | 
 157 |   const handleCopyAgain = async () => {
 158 |     if (!previewMarkdown) return;
 159 |     await navigator.clipboard.writeText(previewMarkdown);
 160 |     toast.success("Copied again", "Bundle text is back in your clipboard.");
 161 |   };
 162 | 
 163 |   return (
 164 |     <>
 165 |       <Panel position="top-right">
 166 |         <ToolbarContainer>
 167 |           <ToolButton onClick={onRescan} disabled={isScanning || !scanConfig?.entryPoint}>
 168 |             <VscSync />
 169 |             {isScanning ? "Scanning…" : "Rescan"}
 170 |           </ToolButton>
 171 | 
 172 |           <ToolButton $primary onClick={handleBundle} disabled={isBundling || !canBundle}>
 173 |             {isBundling ? <VscLoading className="spin" /> : <VscExport />}
 174 |             {isBundling ? "Bundling…" : "Bundle & Copy"}
 175 |           </ToolButton>
 176 |         </ToolbarContainer>
 177 |       </Panel>
 178 | 
 179 |       <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Bundled Prompt Preview">
 180 |         <PreviewActions>
 181 |           <CopyButton onClick={handleCopyAgain}>Copy</CopyButton>
 182 |           <span style={{ opacity: 0.8, fontSize: 12 }}>
 183 |             This is exactly what was copied to your clipboard.
 184 |           </span>
 185 |         </PreviewActions>
 186 | 
 187 |         <PreviewBox>{previewMarkdown ?? ""}</PreviewBox>
 188 |       </Modal>
 189 |     </>
 190 |   );
 191 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/AxonGraph/GroupNode.tsx">
   1 | import { memo } from "react";
   2 | import { NodeResizer, type NodeProps } from "@xyflow/react";
   3 | import styled from "styled-components";
   4 | import { VscFolderOpened } from "react-icons/vsc";
   5 | import type { AxonNode } from "@axon-types/axonTypes";
   6 | 
   7 | const Container = styled.div<{ $selected?: boolean }>`
   8 |   width: 100%;
   9 |   height: 100%;
  10 |   box-sizing: border-box;
  11 | 
  12 |   background: rgba(30, 30, 30, 0.28);
  13 |   border: 1px solid ${({ theme }) => theme.colors.border};
  14 |   border-radius: 10px;
  15 | 
  16 |   ${({ $selected, theme }) =>
  17 |     $selected
  18 |       ? `
  19 |     border-color: ${theme.colors.palette.primary};
  20 |     box-shadow: 0 0 0 2px ${theme.colors.palette.primary}33;
  21 |   `
  22 |       : ""}
  23 | 
  24 |   overflow: hidden;
  25 | `;
  26 | 
  27 | const Header = styled.div`
  28 |   height: 46px;
  29 |   display: flex;
  30 |   align-items: center;
  31 |   gap: 10px;
  32 |   padding: 10px 12px;
  33 | 
  34 |   background: rgba(20, 20, 20, 0.35);
  35 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  36 | 
  37 |   color: ${({ theme }) => theme.colors.text.primary};
  38 |   font-weight: 800;
  39 |   font-size: 13px;
  40 | `;
  41 | 
  42 | const Path = styled.div`
  43 |   padding: 10px 12px;
  44 |   color: ${({ theme }) => theme.colors.text.muted};
  45 |   font-size: 12px;
  46 |   word-break: break-all;
  47 | `;
  48 | 
  49 | const Badge = styled.div`
  50 |   margin-left: auto;
  51 |   border: 1px solid ${({ theme }) => theme.colors.border};
  52 |   background: ${({ theme }) => theme.colors.bg.overlay};
  53 |   color: ${({ theme }) => theme.colors.text.secondary};
  54 |   border-radius: 999px;
  55 |   padding: 3px 8px;
  56 |   font-size: 11px;
  57 |   font-weight: 700;
  58 | `;
  59 | 
  60 | export const GroupNode = memo(({ data, selected }: NodeProps<AxonNode>) => {
  61 |   const label = (data as any)?.label ?? "Folder";
  62 |   const folderPath = (data as any)?.folderPath ?? "";
  63 |   const fileCount = (data as any)?.fileCount ?? 0;
  64 | 
  65 |   return (
  66 |     <Container $selected={selected}>
  67 |       {/* Resizable group */}
  68 |       <NodeResizer
  69 |         isVisible={!!selected}
  70 |         minWidth={240}
  71 |         minHeight={140}
  72 |       />
  73 | 
  74 |       <Header>
  75 |         <VscFolderOpened size={16} />
  76 |         <span title={folderPath || label}>{label}</span>
  77 |         <Badge title="Descendant file count">{fileCount}</Badge>
  78 |       </Header>
  79 | 
  80 |       {folderPath ? <Path>{folderPath}</Path> : null}
  81 |     </Container>
  82 |   );
  83 | });
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/InspectorPanel.tsx">
   1 | import styled from "styled-components";
   2 | import { useAppSelector } from "@app/hooks";
   3 | import { selectSelectedNodeId } from "@features/workspace/workspacesSlice";
   4 | import { Surface } from "@components/ui/Surface";
   5 | 
   6 | import { VscFileCode } from "react-icons/vsc";
   7 | import { Heading } from "@components/ui/Typography";
   8 | import { RootConfigView } from "./RootConfigView";
   9 | import { FileViewer } from "@components/FileViewer";
  10 | 
  11 | const PanelContainer = styled(Surface)`
  12 |   height: 100%;
  13 |   border-left: 1px solid ${({ theme }) => theme.colors.border};
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   z-index: 5;
  17 | `;
  18 | 
  19 | const Header = styled.div`
  20 |   padding: 12px 16px;
  21 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  22 |   background: ${({ theme }) => theme.colors.bg.surface};
  23 | `;
  24 | 
  25 | export const InspectorPanel = () => {
  26 |   const selectedId = useAppSelector(selectSelectedNodeId);
  27 | 
  28 |   const renderContent = () => {
  29 |     if (!selectedId) {
  30 |       return <RootConfigView />;
  31 |     }
  32 | 
  33 |     return (
  34 |       <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
  35 |         <Header>
  36 |           <Heading style={{ fontSize: "13px", marginBottom: 0 }}>
  37 |             <VscFileCode style={{ marginRight: 8 }} />
  38 |             Source Viewer
  39 |           </Heading>
  40 |         </Header>
  41 |         <FileViewer path={selectedId} />
  42 |       </div>
  43 |     );
  44 |   };
  45 | 
  46 |   return (
  47 |     <PanelContainer $padding={0} $radius="none" $variant="surface">
  48 |       {renderContent()}
  49 |     </PanelContainer>
  50 |   );
  51 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/PromptRuleEditor.tsx">
   1 | import { useMemo, useState } from "react";
   2 | import styled from "styled-components";
   3 | import type { PromptOptions } from "@axon-types/axonTypes";
   4 | import { Subtext } from "@components/ui/Typography";
   5 | import { VscAdd, VscTrash } from "react-icons/vsc";
   6 | 
   7 | const Wrap = styled.div`
   8 |   display: flex;
   9 |   flex-direction: column;
  10 |   gap: 14px;
  11 | `;
  12 | 
  13 | const Section = styled.div`
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   gap: 10px;
  17 | `;
  18 | 
  19 | const LabelRow = styled.div`
  20 |   display: flex;
  21 |   justify-content: space-between;
  22 |   align-items: baseline;
  23 |   gap: 10px;
  24 | `;
  25 | 
  26 | const Label = styled.div`
  27 |   font-size: 11px;
  28 |   font-weight: 800;
  29 |   text-transform: uppercase;
  30 |   color: ${({ theme }) => theme.colors.text.muted};
  31 | `;
  32 | 
  33 | const SmallHint = styled(Subtext)`
  34 |   font-size: 11px;
  35 | `;
  36 | 
  37 | const Select = styled.select`
  38 |   width: 100%;
  39 |   padding: 8px;
  40 |   background: ${({ theme }) => theme.colors.bg.input};
  41 |   border: 1px solid ${({ theme }) => theme.colors.border};
  42 |   color: ${({ theme }) => theme.colors.text.primary};
  43 |   border-radius: 4px;
  44 |   cursor: pointer;
  45 | 
  46 |   &:focus {
  47 |     outline: none;
  48 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  49 |   }
  50 | `;
  51 | 
  52 | const Row = styled.div`
  53 |   display: flex;
  54 |   gap: 8px;
  55 |   align-items: center;
  56 | `;
  57 | 
  58 | const Input = styled.input`
  59 |   flex: 1;
  60 |   background: ${({ theme }) => theme.colors.bg.input};
  61 |   border: 1px solid ${({ theme }) => theme.colors.border};
  62 |   color: ${({ theme }) => theme.colors.text.primary};
  63 |   padding: 8px;
  64 |   border-radius: 4px;
  65 | 
  66 |   &:focus {
  67 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  68 |     outline: none;
  69 |   }
  70 | `;
  71 | 
  72 | const Button = styled.button<{ $tone?: "primary" | "danger" }>`
  73 |   display: inline-flex;
  74 |   align-items: center;
  75 |   gap: 6px;
  76 |   border-radius: 4px;
  77 |   padding: 8px 10px;
  78 |   cursor: pointer;
  79 |   font-size: 12px;
  80 |   border: 1px solid
  81 |     ${({ theme, $tone }) =>
  82 |       $tone === "danger" ? theme.colors.palette.danger : theme.colors.border};
  83 |   background: ${({ theme }) => theme.colors.bg.surface};
  84 |   color: ${({ theme, $tone }) =>
  85 |     $tone === "danger"
  86 |       ? theme.colors.palette.danger
  87 |       : theme.colors.text.primary};
  88 | 
  89 |   &:hover {
  90 |     border-color: ${({ theme, $tone }) =>
  91 |       $tone === "danger"
  92 |         ? theme.colors.palette.danger
  93 |         : theme.colors.palette.primary};
  94 |   }
  95 | `;
  96 | 
  97 | const ChipList = styled.div`
  98 |   display: flex;
  99 |   flex-wrap: wrap;
 100 |   gap: 8px;
 101 | `;
 102 | 
 103 | const Chip = styled.div<{ $tone?: "target" | "redact" }>`
 104 |   display: flex;
 105 |   align-items: center;
 106 |   gap: 8px;
 107 |   border-radius: 999px;
 108 |   padding: 6px 10px;
 109 |   border: 1px solid ${({ theme }) => theme.colors.border};
 110 |   background: ${({ theme }) => theme.colors.bg.overlay};
 111 | 
 112 |   ${({ $tone, theme }) =>
 113 |     $tone === "redact"
 114 |       ? `
 115 |     border-color: ${theme.colors.palette.danger};
 116 |   `
 117 |       : $tone === "target"
 118 |         ? `
 119 |     border-color: ${theme.colors.palette.accent};
 120 |   `
 121 |         : ""}
 122 | `;
 123 | 
 124 | const ChipText = styled.span`
 125 |   font-family:
 126 |     ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
 127 |     "Courier New", monospace;
 128 |   font-size: 12px;
 129 |   color: ${({ theme }) => theme.colors.text.primary};
 130 | `;
 131 | 
 132 | const ChipX = styled.button<{ $tone?: "target" | "redact" }>`
 133 |   width: 18px;
 134 |   height: 18px;
 135 |   border-radius: 999px;
 136 |   border: 1px solid ${({ theme }) => theme.colors.border};
 137 |   background: transparent;
 138 |   cursor: pointer;
 139 |   color: ${({ theme, $tone }) =>
 140 |     $tone === "redact"
 141 |       ? theme.colors.palette.danger
 142 |       : $tone === "target"
 143 |         ? theme.colors.palette.accent
 144 |         : theme.colors.text.secondary};
 145 | 
 146 |   &:hover {
 147 |     border-color: ${({ theme, $tone }) =>
 148 |       $tone === "redact"
 149 |         ? theme.colors.palette.danger
 150 |         : $tone === "target"
 151 |           ? theme.colors.palette.accent
 152 |           : theme.colors.palette.primary};
 153 |   }
 154 | `;
 155 | 
 156 | function normalizeMany(raw: string): string[] {
 157 |   return raw
 158 |     .split(/[\n,]+/g)
 159 |     .map((s) => s.trim())
 160 |     .filter(Boolean);
 161 | }
 162 | 
 163 | function upsertMany(existing: string[], toAdd: string[]) {
 164 |   const set = new Set(existing);
 165 |   for (const item of toAdd) set.add(item);
 166 |   return Array.from(set).sort((a, b) => a.localeCompare(b));
 167 | }
 168 | 
 169 | function removeOne(existing: string[], item: string) {
 170 |   return existing.filter((x) => x !== item);
 171 | }
 172 | 
 173 | export function PromptRuleEditor(props: {
 174 |   options: PromptOptions;
 175 |   setOptions: (patch: Partial<PromptOptions>) => void;
 176 |   hint?: string;
 177 | }) {
 178 |   const { options, setOptions, hint } = props;
 179 | 
 180 |   const [targetInput, setTargetInput] = useState("");
 181 |   const [redactInput, setRedactInput] = useState("");
 182 | 
 183 |   const targetLabel = useMemo(() => {
 184 |     if (options.skeletonMode === "keepOnly")
 185 |       return "Keep only (fileName:Target)";
 186 |     if (options.skeletonMode === "stripOnly")
 187 |       return "Strip only (fileName:Target)";
 188 |     return "Targets (fileName:Target)";
 189 |   }, [options.skeletonMode]);
 190 | 
 191 |   const targetToneHint = useMemo(() => {
 192 |     if (options.skeletonMode === "all") {
 193 |       return "In “Signatures” mode, everything is skeletonized; targets are effectively ignored.";
 194 |     }
 195 |     if (options.skeletonMode === "keepOnly") {
 196 |       return "Only these targets will keep implementation detail; everything else is skeletonized.";
 197 |     }
 198 |     return "Only these targets will be skeletonized; everything else stays intact.";
 199 |   }, [options.skeletonMode]);
 200 | 
 201 |   return (
 202 |     <Wrap>
 203 |       <Section>
 204 |         <LabelRow>
 205 |           <Label>Skeleton Strategy</Label>
 206 |           <SmallHint>{targetToneHint}</SmallHint>
 207 |         </LabelRow>
 208 | 
 209 |         <Select
 210 |           value={options.skeletonMode}
 211 |           onChange={(e) => setOptions({ skeletonMode: e.target.value })}
 212 |         >
 213 |           <option value="all">Signatures</option>
 214 |           <option value="stripOnly">
 215 |             Strip Only (Implementation & Signatures)
 216 |           </option>
 217 |           <option value="keepOnly">Keep Essential Only</option>
 218 |         </Select>
 219 | 
 220 |         {hint ? <SmallHint>{hint}</SmallHint> : null}
 221 |       </Section>
 222 | 
 223 |       <Section>
 224 |         <LabelRow>
 225 |           <Label>{targetLabel}</Label>
 226 |           <SmallHint>Example: inventorySlice.ts:addItem</SmallHint>
 227 |         </LabelRow>
 228 | 
 229 |         <Row>
 230 |           <Input
 231 |             value={targetInput}
 232 |             onChange={(e) => setTargetInput(e.target.value)}
 233 |             placeholder="App.tsx:App"
 234 |             onKeyDown={(e) => {
 235 |               if (e.key === "Enter") {
 236 |                 const next = upsertMany(
 237 |                   options.skeletonTargets,
 238 |                   normalizeMany(targetInput),
 239 |                 );
 240 |                 setOptions({ skeletonTargets: next });
 241 |                 setTargetInput("");
 242 |               }
 243 |             }}
 244 |           />
 245 |           <Button
 246 |             onClick={() => {
 247 |               const next = upsertMany(
 248 |                 options.skeletonTargets,
 249 |                 normalizeMany(targetInput),
 250 |               );
 251 |               setOptions({ skeletonTargets: next });
 252 |               setTargetInput("");
 253 |             }}
 254 |           >
 255 |             <VscAdd /> Add
 256 |           </Button>
 257 |           <Button
 258 |             $tone="danger"
 259 |             onClick={() => setOptions({ skeletonTargets: [] })}
 260 |             title="Clear skeleton targets"
 261 |           >
 262 |             <VscTrash /> Clear
 263 |           </Button>
 264 |         </Row>
 265 | 
 266 |         <ChipList>
 267 |           {options.skeletonTargets.map((t) => (
 268 |             <Chip key={t} $tone="target">
 269 |               <ChipText>{t}</ChipText>
 270 |               <ChipX
 271 |                 $tone="target"
 272 |                 aria-label={`remove ${t}`}
 273 |                 onClick={() =>
 274 |                   setOptions({
 275 |                     skeletonTargets: removeOne(options.skeletonTargets, t),
 276 |                   })
 277 |                 }
 278 |               >
 279 |                 ×
 280 |               </ChipX>
 281 |             </Chip>
 282 |           ))}
 283 |         </ChipList>
 284 |       </Section>
 285 | 
 286 |       <Section>
 287 |         <LabelRow>
 288 |           <Label>Redactions (fileName:Target)</Label>
 289 |           <SmallHint>Example: App.tsx:Hideme</SmallHint>
 290 |         </LabelRow>
 291 | 
 292 |         <Row>
 293 |           <Input
 294 |             value={redactInput}
 295 |             onChange={(e) => setRedactInput(e.target.value)}
 296 |             placeholder="inventorySlice.ts:name"
 297 |             onKeyDown={(e) => {
 298 |               if (e.key === "Enter") {
 299 |                 const next = upsertMany(
 300 |                   options.redactions,
 301 |                   normalizeMany(redactInput),
 302 |                 );
 303 |                 setOptions({ redactions: next });
 304 |                 setRedactInput("");
 305 |               }
 306 |             }}
 307 |           />
 308 |           <Button
 309 |             onClick={() => {
 310 |               const next = upsertMany(
 311 |                 options.redactions,
 312 |                 normalizeMany(redactInput),
 313 |               );
 314 |               setOptions({ redactions: next });
 315 |               setRedactInput("");
 316 |             }}
 317 |           >
 318 |             <VscAdd /> Add
 319 |           </Button>
 320 |           <Button
 321 |             $tone="danger"
 322 |             onClick={() => setOptions({ redactions: [] })}
 323 |             title="Clear redactions"
 324 |           >
 325 |             <VscTrash /> Clear
 326 |           </Button>
 327 |         </Row>
 328 | 
 329 |         <ChipList>
 330 |           {options.redactions.map((r) => (
 331 |             <Chip key={r} $tone="redact">
 332 |               <ChipText>{r}</ChipText>
 333 |               <ChipX
 334 |                 $tone="redact"
 335 |                 aria-label={`remove ${r}`}
 336 |                 onClick={() =>
 337 |                   setOptions({ redactions: removeOne(options.redactions, r) })
 338 |                 }
 339 |               >
 340 |                 ×
 341 |               </ChipX>
 342 |             </Chip>
 343 |           ))}
 344 |         </ChipList>
 345 | 
 346 |         <SmallHint>
 347 |           Tip: click a symbol chip inside a FileNode to auto-add{" "}
 348 |           <code>fileName:Target</code>.
 349 |         </SmallHint>
 350 |       </Section>
 351 |     </Wrap>
 352 |   );
 353 | }
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/RootConfigView.tsx">
   1 | import { useEffect, useMemo, useState } from "react";
   2 | import styled from "styled-components";
   3 | import { useWorkspace } from "@features/workspace/useWorkspace";
   4 | import { Heading, Subtext } from "@components/ui/Typography";
   5 | import { VscSearch, VscSettingsGear } from "react-icons/vsc";
   6 | import { PromptRuleEditor } from "./PromptRuleEditor";
   7 | import { useToggle } from "@app/hooks";
   8 | import { useFileSystem } from "@features/axon/useFileSystem";
   9 | import { FileSelectorModal } from "@components/FileSelector/FileSelectorModal";
  10 | 
  11 | const Container = styled.div`
  12 |   padding: 20px;
  13 |   display: flex;
  14 |   flex-direction: column;
  15 |   gap: 24px;
  16 | `;
  17 | 
  18 | const Section = styled.div`
  19 |   display: flex;
  20 |   flex-direction: column;
  21 |   gap: 12px;
  22 | `;
  23 | 
  24 | const Label = styled.label`
  25 |   font-size: 11px;
  26 |   font-weight: 700;
  27 |   text-transform: uppercase;
  28 |   color: ${({ theme }) => theme.colors.text.muted};
  29 | `;
  30 | 
  31 | const InfoBox = styled.div`
  32 |   padding: 12px;
  33 |   background: ${({ theme }) => theme.colors.bg.overlay};
  34 |   border-radius: 6px;
  35 |   font-size: 12px;
  36 |   color: ${({ theme }) => theme.colors.text.secondary};
  37 |   line-height: 1.5;
  38 | `;
  39 | 
  40 | const InputRow = styled.div`
  41 |   display: flex;
  42 |   gap: 10px;
  43 |   align-items: center;
  44 | `;
  45 | 
  46 | const Input = styled.input`
  47 |   flex: 1;
  48 |   background: ${({ theme }) => theme.colors.bg.input};
  49 |   border: 1px solid ${({ theme }) => theme.colors.border};
  50 |   color: ${({ theme }) => theme.colors.text.primary};
  51 |   padding: 8px 10px;
  52 |   border-radius: 6px;
  53 | 
  54 |   &:focus {
  55 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  56 |     outline: none;
  57 |   }
  58 | `;
  59 | 
  60 | const Button = styled.button`
  61 |   background: ${({ theme }) => theme.colors.bg.surface};
  62 |   border: 1px solid ${({ theme }) => theme.colors.border};
  63 |   color: ${({ theme }) => theme.colors.text.primary};
  64 |   padding: 8px 10px;
  65 |   border-radius: 6px;
  66 |   cursor: pointer;
  67 |   display: inline-flex;
  68 |   align-items: center;
  69 |   gap: 8px;
  70 |   font-size: 13px;
  71 |   font-weight: 700;
  72 | 
  73 |   &:hover {
  74 |     background: ${({ theme }) => theme.colors.bg.overlay};
  75 |   }
  76 | `;
  77 | 
  78 | const CheckboxLabel = styled.label`
  79 |   display: flex;
  80 |   align-items: center;
  81 |   gap: 10px;
  82 |   cursor: pointer;
  83 |   font-size: 13px;
  84 |   user-select: none;
  85 |   color: ${({ theme }) => theme.colors.text.secondary};
  86 | 
  87 |   input {
  88 |     transform: translateY(1px);
  89 |   }
  90 | `;
  91 | 
  92 | export const RootConfigView = () => {
  93 |   const { config, setOptions, projectRoot, scanConfig, setScan } =
  94 |     useWorkspace();
  95 | 
  96 |   const { isOpen, toggle, open } = useToggle();
  97 |   const fs = useFileSystem(projectRoot || null);
  98 | 
  99 |   const [entryPoint, setEntryPoint] = useState(scanConfig?.entryPoint ?? "");
 100 |   const [depth, setDepth] = useState<number>(scanConfig?.depth ?? 3);
 101 |   const [flatten, setFlatten] = useState<boolean>(scanConfig?.flatten ?? true);
 102 | 
 103 |   useEffect(() => {
 104 |     setEntryPoint(scanConfig?.entryPoint ?? "");
 105 |     setDepth(scanConfig?.depth ?? 3);
 106 |     setFlatten(scanConfig?.flatten ?? true);
 107 |   }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);
 108 | 
 109 |   const canBrowse = useMemo(() => Boolean(projectRoot), [projectRoot]);
 110 | 
 111 |   const commitScanSettings = () => {
 112 |     setScan({
 113 |       entryPoint: entryPoint.trim(),
 114 |       depth: Math.max(1, Number.isFinite(depth) ? depth : 3),
 115 |       flatten: !!flatten,
 116 |     });
 117 |   };
 118 | 
 119 |   if (!config) return null;
 120 | 
 121 |   return (
 122 |     <Container>
 123 |       <div>
 124 |         <Heading>
 125 |           <VscSettingsGear /> Global Settings
 126 |         </Heading>
 127 |         <Subtext>
 128 |           Single scan from an entrypoint. Groups in the graph are created
 129 |           automatically from folders.
 130 |         </Subtext>
 131 |       </div>
 132 | 
 133 |       <Section>
 134 |         <Label>Scan Settings</Label>
 135 | 
 136 |         <div>
 137 |           <Subtext style={{ marginBottom: 8 }}>Entry Point</Subtext>
 138 |           <InputRow>
 139 |             <Input
 140 |               value={entryPoint}
 141 |               onChange={(e) => setEntryPoint(e.target.value)}
 142 |               onBlur={commitScanSettings}
 143 |               placeholder="src/main.rs"
 144 |             />
 145 |             <Button
 146 |               onClick={() => {
 147 |                 if (!canBrowse) return;
 148 |                 fs.refresh();
 149 |                 open();
 150 |               }}
 151 |               disabled={!canBrowse}
 152 |               title={canBrowse ? "Browse files" : "Open a workspace first"}
 153 |             >
 154 |               <VscSearch />
 155 |               Browse
 156 |             </Button>
 157 |           </InputRow>
 158 |         </div>
 159 | 
 160 |         <div>
 161 |           <Subtext style={{ marginBottom: 8 }}>Depth</Subtext>
 162 |           <Input
 163 |             type="number"
 164 |             min={1}
 165 |             max={25}
 166 |             value={depth}
 167 |             onChange={(e) => setDepth(Number(e.target.value))}
 168 |             onBlur={commitScanSettings}
 169 |           />
 170 |         </div>
 171 | 
 172 |         <CheckboxLabel>
 173 |           <input
 174 |             type="checkbox"
 175 |             checked={flatten}
 176 |             onChange={(e) => {
 177 |               setFlatten(e.target.checked);
 178 |               setScan({ flatten: e.target.checked });
 179 |             }}
 180 |           />
 181 |           Flatten directory structure during scan
 182 |         </CheckboxLabel>
 183 |       </Section>
 184 | 
 185 |       <Section>
 186 |         <Label>Project Root</Label>
 187 |         <InfoBox style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
 188 |           {projectRoot}
 189 |         </InfoBox>
 190 |       </Section>
 191 | 
 192 |       <PromptRuleEditor
 193 |         options={config}
 194 |         setOptions={(patch) => setOptions(patch)}
 195 |         hint="Pro tip: you can author rules directly from the graph by clicking symbols on FileNodes."
 196 |       />
 197 | 
 198 |       <FileSelectorModal
 199 |         isOpen={isOpen}
 200 |         toggle={toggle}
 201 |         fs={fs}
 202 |         mode="file"
 203 |         onSelect={(path) => {
 204 |           setEntryPoint(path);
 205 |           setScan({ entryPoint: path });
 206 |         }}
 207 |       />
 208 |     </Container>
 209 |   );
 210 | };
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

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Toast.tsx">
   1 | import React, {
   2 |   createContext,
   3 |   useCallback,
   4 |   useContext,
   5 |   useEffect,
   6 |   useMemo,
   7 |   useRef,
   8 |   useState,
   9 | } from "react";
  10 | import styled, { keyframes } from "styled-components";
  11 | import { createPortal } from "react-dom";
  12 | import { nanoid } from "@reduxjs/toolkit";
  13 | import {
  14 |   VscCheck,
  15 |   VscClose,
  16 |   VscError,
  17 |   VscInfo,
  18 |   VscLoading,
  19 |   VscWarning,
  20 | } from "react-icons/vsc";
  21 | 
  22 | import { Surface } from "./Surface";
  23 | import { Subtext } from "./Typography";
  24 | 
  25 | export type ToastVariant = "info" | "success" | "warning" | "danger" | "loading";
  26 | 
  27 | export interface ToastItem {
  28 |   id: string;
  29 |   title: string;
  30 |   message?: string;
  31 |   variant?: ToastVariant;
  32 |   /** ms; set 0 to disable auto-dismiss */
  33 |   duration?: number;
  34 |   actionLabel?: string;
  35 |   onAction?: () => void;
  36 | }
  37 | 
  38 | type ToastInput = Omit<ToastItem, "id"> & { id?: string };
  39 | 
  40 | interface ToastApi {
  41 |   push: (toast: ToastInput) => string;
  42 |   update: (id: string, patch: Partial<Omit<ToastItem, "id">>) => void;
  43 |   dismiss: (id: string) => void;
  44 |   clear: () => void;
  45 | 
  46 |   info: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  47 |   success: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  48 |   warning: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  49 |   danger: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  50 |   loading: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  51 | }
  52 | 
  53 | const ToastContext = createContext<ToastApi | null>(null);
  54 | 
  55 | export const useToast = () => {
  56 |   const ctx = useContext(ToastContext);
  57 |   if (!ctx) throw new Error("useToast must be used within ToastProvider");
  58 |   return ctx;
  59 | };
  60 | 
  61 | const slideIn = keyframes`
  62 |   from { transform: translateX(14px); opacity: 0; }
  63 |   to   { transform: translateX(0); opacity: 1; }
  64 | `;
  65 | 
  66 | const Viewport = styled.div`
  67 |   position: fixed;
  68 |   right: 14px;
  69 |   bottom: 14px;
  70 |   display: flex;
  71 |   flex-direction: column;
  72 |   gap: 10px;
  73 |   z-index: 9998; /* keep below your Modal if it uses 9999 */
  74 |   pointer-events: none;
  75 | `;
  76 | 
  77 | const Card = styled(Surface)<{ $v: ToastVariant }>`
  78 |   width: 360px;
  79 |   max-width: calc(100vw - 28px);
  80 |   border: 1px solid ${({ theme }) => theme.colors.border};
  81 |   box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
  82 |   padding: ${({ theme }) => theme.spacing(3)};
  83 |   border-radius: ${({ theme }) => theme.borderRadius.md};
  84 |   background: ${({ theme }) => theme.colors.bg.surface};
  85 |   position: relative;
  86 |   overflow: hidden;
  87 |   animation: ${slideIn} 160ms ease-out;
  88 |   pointer-events: auto;
  89 | 
  90 |   display: grid;
  91 |   grid-template-columns: 18px 1fr auto;
  92 |   gap: 10px;
  93 |   align-items: start;
  94 | 
  95 |   &::before {
  96 |     content: "";
  97 |     position: absolute;
  98 |     left: 0;
  99 |     top: 0;
 100 |     bottom: 0;
 101 |     width: 4px;
 102 |     background: ${({ theme, $v }) => {
 103 |       const p = theme.colors.palette;
 104 |       if ($v === "success") return p.success;
 105 |       if ($v === "warning") return p.accent;
 106 |       if ($v === "danger") return p.danger;
 107 |       if ($v === "loading") return p.primary;
 108 |       return p.secondary;
 109 |     }};
 110 |   }
 111 | `;
 112 | 
 113 | const IconWrap = styled.div<{ $v: ToastVariant }>`
 114 |   margin-top: 2px;
 115 |   color: ${({ theme, $v }) => {
 116 |     const p = theme.colors.palette;
 117 |     if ($v === "success") return p.success;
 118 |     if ($v === "warning") return p.accent;
 119 |     if ($v === "danger") return p.danger;
 120 |     if ($v === "loading") return p.primary;
 121 |     return p.secondary;
 122 |   }};
 123 | `;
 124 | 
 125 | const Content = styled.div`
 126 |   display: flex;
 127 |   flex-direction: column;
 128 |   gap: 4px;
 129 |   min-width: 0;
 130 | `;
 131 | 
 132 | const Title = styled.div`
 133 |   font-size: ${({ theme }) => theme.typography.sizes.sm};
 134 |   font-weight: 700;
 135 |   color: ${({ theme }) => theme.colors.text.primary};
 136 |   line-height: 1.25;
 137 | `;
 138 | 
 139 | const Message = styled(Subtext)`
 140 |   font-size: ${({ theme }) => theme.typography.sizes.sm};
 141 |   line-height: 1.35;
 142 |   display: -webkit-box;
 143 |   -webkit-line-clamp: 3;
 144 |   -webkit-box-orient: vertical;
 145 |   overflow: hidden;
 146 | `;
 147 | 
 148 | const Actions = styled.div`
 149 |   display: flex;
 150 |   align-items: center;
 151 |   gap: 8px;
 152 | `;
 153 | 
 154 | const ActionButton = styled.button`
 155 |   background: ${({ theme }) => theme.colors.bg.overlay};
 156 |   border: 1px solid ${({ theme }) => theme.colors.border};
 157 |   color: ${({ theme }) => theme.colors.text.primary};
 158 |   padding: 6px 10px;
 159 |   border-radius: ${({ theme }) => theme.borderRadius.sm};
 160 |   cursor: pointer;
 161 |   font-size: 12px;
 162 |   font-weight: 600;
 163 |   transition: all 0.15s ease;
 164 | 
 165 |   &:hover {
 166 |     filter: brightness(1.08);
 167 |     transform: translateY(-1px);
 168 |   }
 169 | `;
 170 | 
 171 | const CloseButton = styled.button`
 172 |   background: transparent;
 173 |   border: none;
 174 |   color: ${({ theme }) => theme.colors.text.secondary};
 175 |   cursor: pointer;
 176 |   display: inline-flex;
 177 |   align-items: center;
 178 |   justify-content: center;
 179 |   padding: 4px;
 180 | 
 181 |   &:hover {
 182 |     color: ${({ theme }) => theme.colors.text.primary};
 183 |   }
 184 | `;
 185 | 
 186 | const getIcon = (v: ToastVariant) => {
 187 |   if (v === "success") return <VscCheck />;
 188 |   if (v === "warning") return <VscWarning />;
 189 |   if (v === "danger") return <VscError />;
 190 |   if (v === "loading") return <VscLoading className="spin" />;
 191 |   return <VscInfo />;
 192 | };
 193 | 
 194 | export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
 195 |   const [toasts, setToasts] = useState<ToastItem[]>([]);
 196 |   const timers = useRef<Record<string, number>>({});
 197 | 
 198 |   const dismiss = useCallback((id: string) => {
 199 |     const t = timers.current[id];
 200 |     if (t) window.clearTimeout(t);
 201 |     delete timers.current[id];
 202 |     setToasts((prev) => prev.filter((x) => x.id !== id));
 203 |   }, []);
 204 | 
 205 |   const clear = useCallback(() => {
 206 |     Object.values(timers.current).forEach((t) => window.clearTimeout(t));
 207 |     timers.current = {};
 208 |     setToasts([]);
 209 |   }, []);
 210 | 
 211 |   const push = useCallback(
 212 |     (input: ToastInput) => {
 213 |       const id = input.id ?? nanoid();
 214 |       const item: ToastItem = {
 215 |         id,
 216 |         title: input.title,
 217 |         message: input.message,
 218 |         variant: input.variant ?? "info",
 219 |         duration: input.duration ?? (input.variant === "danger" ? 6000 : 3500),
 220 |         actionLabel: input.actionLabel,
 221 |         onAction: input.onAction,
 222 |       };
 223 | 
 224 |       setToasts((prev) => [item, ...prev].slice(0, 5));
 225 | 
 226 |       if (item.duration && item.duration > 0) {
 227 |         timers.current[id] = window.setTimeout(() => dismiss(id), item.duration);
 228 |       }
 229 | 
 230 |       return id;
 231 |     },
 232 |     [dismiss]
 233 |   );
 234 | 
 235 |   const update = useCallback(
 236 |     (id: string, patch: Partial<Omit<ToastItem, "id">>) => {
 237 |       setToasts((prev) =>
 238 |         prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
 239 |       );
 240 | 
 241 |       if (typeof patch.duration === "number") {
 242 |         const existing = timers.current[id];
 243 |         if (existing) window.clearTimeout(existing);
 244 |         delete timers.current[id];
 245 | 
 246 |         if (patch.duration > 0) {
 247 |           timers.current[id] = window.setTimeout(() => dismiss(id), patch.duration);
 248 |         }
 249 |       }
 250 |     },
 251 |     [dismiss]
 252 |   );
 253 | 
 254 |   const info = useCallback(
 255 |     (title: string, message?: string, opts?: Partial<ToastInput>) =>
 256 |       push({ ...opts, title, message, variant: "info" }),
 257 |     [push]
 258 |   );
 259 | 
 260 |   const success = useCallback(
 261 |     (title: string, message?: string, opts?: Partial<ToastInput>) =>
 262 |       push({ ...opts, title, message, variant: "success" }),
 263 |     [push]
 264 |   );
 265 | 
 266 |   const warning = useCallback(
 267 |     (title: string, message?: string, opts?: Partial<ToastInput>) =>
 268 |       push({ ...opts, title, message, variant: "warning" }),
 269 |     [push]
 270 |   );
 271 | 
 272 |   const danger = useCallback(
 273 |     (title: string, message?: string, opts?: Partial<ToastInput>) =>
 274 |       push({ ...opts, title, message, variant: "danger" }),
 275 |     [push]
 276 |   );
 277 | 
 278 |   const loading = useCallback(
 279 |     (title: string, message?: string, opts?: Partial<ToastInput>) =>
 280 |       push({ ...opts, title, message, variant: "loading", duration: 0 }),
 281 |     [push]
 282 |   );
 283 | 
 284 |   useEffect(() => () => clear(), [clear]);
 285 | 
 286 |   const api: ToastApi = useMemo(
 287 |     () => ({ push, update, dismiss, clear, info, success, warning, danger, loading }),
 288 |     [push, update, dismiss, clear, info, success, warning, danger, loading]
 289 |   );
 290 | 
 291 |   return (
 292 |     <ToastContext.Provider value={api}>
 293 |       {children}
 294 |       {typeof document !== "undefined" &&
 295 |         createPortal(
 296 |           <Viewport>
 297 |             {toasts.map((t) => (
 298 |               <Card key={t.id} $variant="surface" $padding={3} $v={t.variant ?? "info"}>
 299 |                 <IconWrap $v={t.variant ?? "info"}>{getIcon(t.variant ?? "info")}</IconWrap>
 300 | 
 301 |                 <Content>
 302 |                   <Title>{t.title}</Title>
 303 |                   {t.message ? <Message>{t.message}</Message> : null}
 304 |                 </Content>
 305 | 
 306 |                 <Actions>
 307 |                   {t.actionLabel && t.onAction ? (
 308 |                     <ActionButton
 309 |                       onClick={() => {
 310 |                         t.onAction?.();
 311 |                         dismiss(t.id);
 312 |                       }}
 313 |                     >
 314 |                       {t.actionLabel}
 315 |                     </ActionButton>
 316 |                   ) : null}
 317 | 
 318 |                   <CloseButton onClick={() => dismiss(t.id)} aria-label="Dismiss toast">
 319 |                     <VscClose />
 320 |                   </CloseButton>
 321 |                 </Actions>
 322 |               </Card>
 323 |             ))}
 324 |           </Viewport>,
 325 |           document.body
 326 |         )}
 327 |     </ToastContext.Provider>
 328 |   );
 329 | };
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
   1 | import { useCallback, useEffect, useMemo, useState } from "react";
   2 | import { useNodesState, useEdgesState } from "@xyflow/react";
   3 | import type { AxonNode, AxonEdge } from "@axon-types/axonTypes";
   4 | import { useWorkspace } from "@features/workspace/useWorkspace";
   5 | import { useAxonCore } from "@features/axon/useAxonCore";
   6 | 
   7 | /**
   8 |  * Folder group layout notes:
   9 |  * - We preserve the backend's absolute node positions.
  10 |  * - We compute a bounding box per folder (including descendants) and render folder "group nodes".
  11 |  * - We then convert node positions into parent-relative coordinates for ReactFlow nesting.
  12 |  */
  13 | 
  14 | const GROUP_PADDING = 28;
  15 | const GROUP_HEADER_H = 46;
  16 | 
  17 | const FALLBACK_NODE_W = 280;
  18 | const FALLBACK_NODE_H = 240;
  19 | 
  20 | function normalizePath(p: string) {
  21 |   return (p ?? "").replace(/\\/g, "/");
  22 | }
  23 | 
  24 | function stripProjectRoot(absPath: string, projectRoot: string) {
  25 |   const a = normalizePath(absPath);
  26 |   const r = normalizePath(projectRoot);
  27 | 
  28 |   const aLow = a.toLowerCase();
  29 |   const rLow = r.toLowerCase();
  30 | 
  31 |   if (r && aLow.startsWith(rLow)) {
  32 |     let rel = a.slice(r.length);
  33 |     if (rel.startsWith("/")) rel = rel.slice(1);
  34 |     return rel;
  35 |   }
  36 |   return a;
  37 | }
  38 | 
  39 | function dirname(relPath: string) {
  40 |   const p = normalizePath(relPath);
  41 |   const idx = p.lastIndexOf("/");
  42 |   return idx === -1 ? "" : p.slice(0, idx);
  43 | }
  44 | 
  45 | function folderDepth(folder: string) {
  46 |   if (!folder) return 0;
  47 |   return normalizePath(folder).split("/").filter(Boolean).length;
  48 | }
  49 | 
  50 | function parentFolder(folder: string) {
  51 |   if (!folder) return "";
  52 |   const p = normalizePath(folder);
  53 |   const idx = p.lastIndexOf("/");
  54 |   return idx === -1 ? "" : p.slice(0, idx);
  55 | }
  56 | 
  57 | function folderId(folder: string) {
  58 |   return `folder:${normalizePath(folder)}`;
  59 | }
  60 | 
  61 | function folderLabel(folder: string) {
  62 |   const p = normalizePath(folder);
  63 |   const parts = p.split("/").filter(Boolean);
  64 |   return parts[parts.length - 1] ?? p ?? "folder";
  65 | }
  66 | 
  67 | function coerceNum(v: unknown, fallback: number) {
  68 |   if (typeof v === "number" && Number.isFinite(v)) return v;
  69 |   if (typeof v === "string") {
  70 |     const n = Number(v);
  71 |     if (Number.isFinite(n)) return n;
  72 |   }
  73 |   return fallback;
  74 | }
  75 | 
  76 | function approxNodeSize(n: any) {
  77 |   const mw = n?.measured?.width;
  78 |   const mh = n?.measured?.height;
  79 | 
  80 |   const sw = n?.style?.width;
  81 |   const sh = n?.style?.height;
  82 | 
  83 |   const w = coerceNum(mw ?? sw, FALLBACK_NODE_W);
  84 |   const h = coerceNum(mh ?? sh, FALLBACK_NODE_H);
  85 | 
  86 |   return { w, h };
  87 | }
  88 | 
  89 | type Bounds = { minX: number; minY: number; maxX: number; maxY: number; fileCount: number };
  90 | type GroupAbs = { xAbs: number; yAbs: number; width: number; height: number };
  91 | 
  92 | export const useGraphLayout = () => {
  93 |   const { projectRoot, workspaceId, scanConfig /* { entryPoint, depth, flatten } */ } = useWorkspace();
  94 |   const { scanGroup } = useAxonCore();
  95 | 
  96 |   const [nodes, setNodes, onNodesChange] = useNodesState<AxonNode>([]);
  97 |   const [edges, setEdges, onEdgesChange] = useEdgesState<AxonEdge>([]);
  98 |   const [isScanning, setIsScanning] = useState(false);
  99 | 
 100 |   useEffect(() => {
 101 |     setNodes([]);
 102 |     setEdges([]);
 103 |   }, [workspaceId, setNodes, setEdges]);
 104 | 
 105 |   const canScan = useMemo(() => {
 106 |     return !!projectRoot && !!workspaceId && !!scanConfig?.entryPoint;
 107 |   }, [projectRoot, workspaceId, scanConfig?.entryPoint]);
 108 | 
 109 |   const refreshGraph = useCallback(
 110 |     async (override?: Partial<{ entryPoint: string; depth: number; flatten: boolean }>) => {
 111 |       if (!projectRoot || !workspaceId) return;
 112 | 
 113 |       const entryPoint = override?.entryPoint ?? scanConfig?.entryPoint ?? "";
 114 |       const depth = override?.depth ?? scanConfig?.depth ?? 3;
 115 |       const flatten = override?.flatten ?? scanConfig?.flatten ?? false;
 116 | 
 117 |       if (!entryPoint) return;
 118 | 
 119 |       setIsScanning(true);
 120 | 
 121 |       try {
 122 |         const result = await scanGroup({
 123 |           groupId: workspaceId, // re-using backend "groupId" as workspace scan id
 124 |           projectRoot,
 125 |           entryPoint,
 126 |           depth,
 127 |           flatten,
 128 |         });
 129 | 
 130 |         const rawNodes = result.nodes ?? [];
 131 |         const rawEdges = result.edges ?? [];
 132 | 
 133 |         const boundsByFolder = new Map<string, Bounds>();
 134 | 
 135 |         function bumpBounds(folder: string, x: number, y: number, w: number, h: number) {
 136 |           if (!folder) return; // no explicit root group
 137 |           const cur = boundsByFolder.get(folder);
 138 |           const next = {
 139 |             minX: Math.min(cur?.minX ?? x, x),
 140 |             minY: Math.min(cur?.minY ?? y, y),
 141 |             maxX: Math.max(cur?.maxX ?? x + w, x + w),
 142 |             maxY: Math.max(cur?.maxY ?? y + h, y + h),
 143 |             fileCount: (cur?.fileCount ?? 0) + 1,
 144 |           };
 145 |           boundsByFolder.set(folder, next);
 146 |         }
 147 | 
 148 |         for (const n of rawNodes as any[]) {
 149 |           if (!n?.data?.path) continue;
 150 |           const rel = stripProjectRoot(n.data.path, projectRoot);
 151 |           const folder = dirname(rel);
 152 |           if (!folder) continue;
 153 | 
 154 |           const { w, h } = approxNodeSize(n);
 155 |           const x = n.position?.x ?? 0;
 156 |           const y = n.position?.y ?? 0;
 157 | 
 158 |           let f = folder;
 159 |           while (f) {
 160 |             bumpBounds(f, x, y, w, h);
 161 |             f = parentFolder(f);
 162 |           }
 163 |         }
 164 | 
 165 |         const groupAbsByFolder = new Map<string, GroupAbs>();
 166 |         for (const [folder, b] of boundsByFolder.entries()) {
 167 |           const xAbs = b.minX - GROUP_PADDING;
 168 |           const yAbs = b.minY - GROUP_PADDING - GROUP_HEADER_H;
 169 |           const width = (b.maxX - b.minX) + GROUP_PADDING * 2;
 170 |           const height = (b.maxY - b.minY) + GROUP_PADDING * 2 + GROUP_HEADER_H;
 171 | 
 172 |           groupAbsByFolder.set(folder, { xAbs, yAbs, width, height });
 173 |         }
 174 | 
 175 |         const foldersSorted = Array.from(groupAbsByFolder.keys()).sort((a, b) => {
 176 |           const da = folderDepth(a);
 177 |           const db = folderDepth(b);
 178 |           return da - db || a.localeCompare(b);
 179 |         });
 180 | 
 181 |         const groupNodes: AxonNode[] = foldersSorted.map((folder) => {
 182 |           const abs = groupAbsByFolder.get(folder)!;
 183 |           const parent = parentFolder(folder);
 184 | 
 185 |           const parentId = parent ? folderId(parent) : undefined;
 186 |           const parentAbs = parent ? groupAbsByFolder.get(parent) : undefined;
 187 | 
 188 |           const position = parentId && parentAbs
 189 |             ? { x: abs.xAbs - parentAbs.xAbs, y: abs.yAbs - parentAbs.yAbs }
 190 |             : { x: abs.xAbs, y: abs.yAbs };
 191 | 
 192 |           return {
 193 |             id: folderId(folder),
 194 |             type: "groupNode",
 195 |             position,
 196 |             ...(parentId
 197 |               ? { parentId, extent: "parent" as const }
 198 |               : {}),
 199 |             style: {
 200 |               width: abs.width,
 201 |               height: abs.height,
 202 |             },
 203 |             data: {
 204 |               label: folderLabel(folder),
 205 |               folderPath: folder,
 206 |               folderDepth: folderDepth(folder),
 207 |               fileCount: boundsByFolder.get(folder)?.fileCount ?? 0,
 208 |             } as any,
 209 |             selectable: true,
 210 |             draggable: true,
 211 |           };
 212 |         });
 213 | 
 214 |         const folderToGroupId = new Map<string, string>();
 215 |         for (const f of foldersSorted) folderToGroupId.set(f, folderId(f));
 216 | 
 217 |         const fileNodes: AxonNode[] = (rawNodes as any[]).map((n) => {
 218 |           const absX = n.position?.x ?? 0;
 219 |           const absY = n.position?.y ?? 0;
 220 | 
 221 |           const path = n?.data?.path ? String(n.data.path) : "";
 222 |           const rel = path ? stripProjectRoot(path, projectRoot) : "";
 223 |           const folder = rel ? dirname(rel) : "";
 224 | 
 225 |           if (!folder || !groupAbsByFolder.has(folder)) {
 226 |             return {
 227 |               ...n,
 228 |               type: "fileNode",
 229 |               position: { x: absX, y: absY },
 230 |             } as AxonNode;
 231 |           }
 232 | 
 233 |           const groupId = folderToGroupId.get(folder)!;
 234 |           const gAbs = groupAbsByFolder.get(folder)!;
 235 | 
 236 |           return {
 237 |             ...n,
 238 |             type: "fileNode",
 239 |             parentId: groupId,
 240 |             extent: "parent",
 241 |             position: { x: absX - gAbs.xAbs, y: absY - gAbs.yAbs },
 242 |           } as AxonNode;
 243 |         });
 244 | 
 245 |         setNodes([...groupNodes, ...fileNodes]);
 246 |         setEdges(rawEdges as any);
 247 |       } catch (err) {
 248 |         console.error("[useGraphLayout] scan failed:", err);
 249 |       } finally {
 250 |         setIsScanning(false);
 251 |       }
 252 |     },
 253 |     [projectRoot, workspaceId, scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten, scanGroup, setNodes, setEdges]
 254 |   );
 255 | 
 256 |   useEffect(() => {
 257 |     if (!canScan) return;
 258 |     refreshGraph();
 259 |   }, [canScan, refreshGraph]);
 260 | 
 261 |   return {
 262 |     nodes,
 263 |     edges,
 264 |     onNodesChange,
 265 |     onEdgesChange,
 266 |     isScanning,
 267 |     refreshGraph,
 268 |     setEdges,
 269 |   };
 270 | };
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
   5 |   selectActiveScanConfig,
   6 |   selectActiveWorkspace,
   7 |   updateScanConfig,
   8 |   updateGlobalOptions,
   9 |   type WorkspaceData,
  10 | } from "./workspacesSlice";
  11 | import type { ScanConfig } from "@axon-types/workspaceTypes";
  12 | 
  13 | export const useWorkspace = () => {
  14 |   const dispatch = useAppDispatch();
  15 | 
  16 |   const projectRoot = useAppSelector(selectActiveRoot);
  17 |   const scanConfig = useAppSelector(selectActiveScanConfig);
  18 |   const fullConfig = useAppSelector(selectActiveWorkspace);
  19 | 
  20 |   const setScan = useCallback(
  21 |     (patch: Partial<ScanConfig>) => {
  22 |       dispatch(updateScanConfig(patch));
  23 |     },
  24 |     [dispatch],
  25 |   );
  26 | 
  27 |   const setOptions = useCallback(
  28 |     (options: Partial<WorkspaceData["globalOptions"]>) => {
  29 |       dispatch(updateGlobalOptions(options));
  30 |     },
  31 |     [dispatch],
  32 |   );
  33 | 
  34 |   const workspaceId = fullConfig?.id;
  35 | 
  36 |   return {
  37 |     isActive: !!projectRoot,
  38 |     workspaceId,
  39 |     projectRoot,
  40 | 
  41 |     scanConfig,
  42 | 
  43 |     config: fullConfig?.globalOptions,
  44 | 
  45 |     setScan,
  46 |     setOptions,
  47 |   };
  48 | };
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
  77 | `;
  78 | 
  79 | const StatRow = styled.div`
  80 |   display: grid;
  81 |   grid-template-columns: repeat(4, minmax(0, 1fr));
  82 |   gap: 12px;
  83 |   margin-bottom: 18px;
  84 | 
  85 |   @media (max-width: 1100px) {
  86 |     grid-template-columns: repeat(2, minmax(0, 1fr));
  87 |   }
  88 | 
  89 |   @media (max-width: 620px) {
  90 |     grid-template-columns: 1fr;
  91 |   }
  92 | `;
  93 | 
  94 | const StatCard = styled(Surface)`
  95 |   display: flex;
  96 |   flex-direction: column;
  97 |   gap: 8px;
  98 | `;
  99 | 
 100 | const StatLabel = styled.div`
 101 |   font-size: 11px;
 102 |   font-weight: 800;
 103 |   text-transform: uppercase;
 104 |   letter-spacing: 0.04em;
 105 |   color: ${({ theme }) => theme.colors.text.muted};
 106 | `;
 107 | 
 108 | const StatValue = styled.div`
 109 |   font-size: 22px;
 110 |   font-weight: 900;
 111 |   color: ${({ theme }) => theme.colors.text.primary};
 112 | `;
 113 | 
 114 | const StatMeta = styled(Subtext)`
 115 |   margin: 0;
 116 | `;
 117 | 
 118 | const SectionHeader = styled.div`
 119 |   display: flex;
 120 |   align-items: baseline;
 121 |   justify-content: space-between;
 122 |   gap: 12px;
 123 |   margin-top: 16px;
 124 |   margin-bottom: 10px;
 125 | `;
 126 | 
 127 | const DangerText = styled.div`
 128 |   color: ${({ theme }) => theme.colors.palette.danger};
 129 |   font-weight: 800;
 130 |   display: inline-flex;
 131 |   align-items: center;
 132 |   gap: 8px;
 133 | `;
 134 | 
 135 | const DangerButton = styled.button`
 136 |   background: transparent;
 137 |   border: 1px solid ${({ theme }) => theme.colors.border};
 138 |   color: ${({ theme }) => theme.colors.text.secondary};
 139 |   padding: 8px 10px;
 140 |   border-radius: 6px;
 141 |   cursor: pointer;
 142 |   display: inline-flex;
 143 |   align-items: center;
 144 |   gap: 8px;
 145 | 
 146 |   &:hover {
 147 |     background: ${({ theme }) => theme.colors.bg.overlay};
 148 |     color: ${({ theme }) => theme.colors.text.primary};
 149 |   }
 150 | `;
 151 | 
 152 | const fmtDateTime = (iso: string) => {
 153 |   const d = new Date(iso);
 154 |   return d.toLocaleString(undefined, {
 155 |     year: "numeric",
 156 |     month: "short",
 157 |     day: "2-digit",
 158 |     hour: "2-digit",
 159 |     minute: "2-digit",
 160 |   });
 161 | };
 162 | 
 163 | export const LibraryHubPage = () => {
 164 |   const navigate = useNavigate();
 165 |   const { workspaces, activeId, open, remove } = useLibrary();
 166 |   const { toggle: toggleTheme } = useTheme();
 167 |   const palette = useToggle()
 168 |   const deleteModal = useToggle();
 169 | 
 170 |   const [pendingDelete, setPendingDelete] = useState<WorkspaceData | null>(null);
 171 | 
 172 |   useEffect(() => {
 173 |     if (!pendingDelete) deleteModal.close();
 174 |   }, [pendingDelete, deleteModal]);
 175 | 
 176 |   const activeWorkspace = useMemo(
 177 |     () => workspaces.find((w: WorkspaceData) => w.id === activeId) ?? null,
 178 |     [workspaces, activeId]
 179 |   );
 180 | 
 181 |   const stats = useMemo(() => {
 182 |     const total = workspaces.length;
 183 | 
 184 |     const mostRecent = [...workspaces]
 185 |       .filter((w: WorkspaceData) => Boolean(w.lastOpened))
 186 |       .sort((a: WorkspaceData, b: WorkspaceData) => +new Date(b.lastOpened) - +new Date(a.lastOpened))[0];
 187 | 
 188 |     return {
 189 |       total,
 190 |       activeName: activeWorkspace?.name ?? "None",
 191 |       recent: mostRecent?.lastOpened ? fmtDateTime(mostRecent.lastOpened) : "—",
 192 |     };
 193 |   }, [workspaces, activeWorkspace]);
 194 | 
 195 |   const openWorkspace = (id: string) => {
 196 |     open(id);
 197 |     navigate("/workspace");
 198 |   };
 199 | 
 200 |   const requestDelete = (ws: WorkspaceData) => setPendingDelete(ws);
 201 | 
 202 |   const confirmDelete = () => {
 203 |     if (!pendingDelete) return;
 204 |     remove(pendingDelete.id);
 205 |     setPendingDelete(null);
 206 |   };
 207 | 
 208 |   return (
 209 |     <Page>
 210 |       <TopBar>
 211 |         <TitleBlock>
 212 |           <Heading style={{ marginBottom: 0 }}>Library Hub</Heading>
 213 |           <Subtext>
 214 |             Jump between workspaces, see what’s “hot”, and fly with <strong>Ctrl</strong>+<strong>K</strong>.
 215 |           </Subtext>
 216 |         </TitleBlock>
 217 | 
 218 |         <Actions>
 219 |           <Hint>
 220 |             <Kbd>Ctrl</Kbd> <span>+</span> <Kbd>K</Kbd>
 221 |           </Hint>
 222 | 
 223 |           <IconButton title="Search workspaces (Ctrl+K)" onClick={palette.open}>
 224 |             <VscSearch />
 225 |           </IconButton>
 226 | 
 227 |           <IconButton title="Toggle theme" onClick={toggleTheme}>
 228 |             <VscColorMode />
 229 |           </IconButton>
 230 |         </Actions>
 231 |       </TopBar>
 232 | 
 233 |       <StatRow>
 234 |         <StatCard $variant="surface" $padding={3} $radius="md">
 235 |           <StatLabel>Workspaces</StatLabel>
 236 |           <StatValue>{stats.total}</StatValue>
 237 |           <StatMeta>All saved projects</StatMeta>
 238 |         </StatCard>
 239 | 
 240 |         <StatCard $variant="surface" $padding={3} $radius="md">
 241 |           <StatLabel>Active</StatLabel>
 242 |           <StatValue>{stats.activeName}</StatValue>
 243 |           <StatMeta>Currently selected</StatMeta>
 244 |         </StatCard>
 245 | 
 246 |         <StatCard $variant="surface" $padding={3} $radius="md">
 247 |           <StatLabel>Most Recent</StatLabel>
 248 |           <StatValue>{stats.recent}</StatValue>
 249 |           <StatMeta>Last opened workspace</StatMeta>
 250 |         </StatCard>
 251 | 
 252 |         <StatCard $variant="surface" $padding={3} $radius="md">
 253 |           <StatLabel>Quick Create</StatLabel>
 254 |           <StatValue style={{ fontSize: 14, fontWeight: 800 }}>New</StatValue>
 255 |           <StatMeta>Create a new workspace</StatMeta>
 256 |         </StatCard>
 257 |       </StatRow>
 258 | 
 259 |       <SectionHeader>
 260 |         <Heading style={{ marginBottom: 0, fontSize: 16 }}>Your Workspaces</Heading>
 261 |         <Subtext style={{ margin: 0 }}>
 262 |           Click to open · <strong>Ctrl</strong>+<strong>K</strong> to search
 263 |         </Subtext>
 264 |       </SectionHeader>
 265 | 
 266 |       <WorkspaceGrid
 267 |         workspaces={workspaces}
 268 |         activeId={activeId}
 269 |         onOpen={openWorkspace}
 270 |         onDelete={requestDelete}
 271 |       />
 272 | 
 273 |       <SectionHeader>
 274 |         <Heading style={{ marginBottom: 0, fontSize: 16 }}>Create</Heading>
 275 |         <Subtext style={{ margin: 0 }}>
 276 |           Start a new workspace from any folder
 277 |         </Subtext>
 278 |       </SectionHeader>
 279 | 
 280 |       <CreateWorkspaceCard />
 281 | 
 282 |       <WorkspaceCommandPalette
 283 |         onDelete={() => {}}
 284 |         activeId={activeId}
 285 |         isOpen={palette.isOpen}
 286 |         onClose={palette.close}
 287 |         workspaces={workspaces}
 288 |         onOpen={openWorkspace}
 289 |       />
 290 | 
 291 |       <Modal
 292 |         isOpen={deleteModal.isOpen}
 293 |         onClose={() => setPendingDelete(null)}
 294 |         title="Delete Workspace?"
 295 |       >
 296 |         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
 297 |           <DangerText>
 298 |             <VscTrash /> This cannot be undone.
 299 |           </DangerText>
 300 |           <Subtext style={{ margin: 0 }}>
 301 |             Delete <strong>{pendingDelete?.name}</strong>?
 302 |           </Subtext>
 303 | 
 304 |           <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
 305 |             <DangerButton onClick={() => setPendingDelete(null)}>
 306 |               Cancel
 307 |             </DangerButton>
 308 |             <DangerButton onClick={confirmDelete}>
 309 |               Delete <VscChevronRight />
 310 |             </DangerButton>
 311 |           </div>
 312 |         </div>
 313 |       </Modal>
 314 |     </Page>
 315 |   );
 316 | };
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
   1 | import { createGlobalStyle } from "styled-components";
   2 | import type { AxonTheme } from "../types/themeTypes";
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
  25 |   /* Simple utility spinner */
  26 |   .spin {
  27 |     animation: axon-spin 1s linear infinite;
  28 |   }
  29 |   @keyframes axon-spin {
  30 |     from { transform: rotate(0deg); }
  31 |     to   { transform: rotate(360deg); }
  32 |   }
  33 | 
  34 |   /* Custom Scrollbar */
  35 |   ::-webkit-scrollbar {
  36 |     width: 8px;
  37 |     height: 8px;
  38 |   }
  39 |   ::-webkit-scrollbar-track {
  40 |     background: transparent;
  41 |   }
  42 |   ::-webkit-scrollbar-thumb {
  43 |     background: ${({ theme }) => theme.colors.border};
  44 |     border-radius: 4px;
  45 |   }
  46 |   ::-webkit-scrollbar-thumb:hover {
  47 |     background: ${({ theme }) => theme.colors.text.muted};
  48 |   }
  49 | `;
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
   2 | 
   3 | export interface Position {
   4 |   x: number;
   5 |   y: number;
   6 | }
   7 | 
   8 | /**
   9 |  * Data associated with a File Node.
  10 |  * Matches the Rust `NodeData` struct.
  11 |  */
  12 | export interface FileNodeData {
  13 |   label: string;
  14 |   path: string;
  15 |   definitions: string[];
  16 |   calls: string[];
  17 |   [key: string]: any;
  18 | }
  19 | 
  20 | /**
  21 |  * Data associated with a Folder Group Node.
  22 |  * Frontend-generated grouping based on each file's directory.
  23 |  */
  24 | export interface GroupNodeData {
  25 |   /** Display label (usually the folder path). */
  26 |   label: string;
  27 |   /** Folder path represented by this group (relative or absolute, depending on backend output). */
  28 |   folderPath: string;
  29 |   /** Optional count of file nodes inside the group. */
  30 |   fileCount?: number;
  31 |   [key: string]: any;
  32 | }
  33 | 
  34 | export type AxonNode = Node<FileNodeData | GroupNodeData, "fileNode" | "groupNode">;
  35 | 
  36 | export interface AxonEdge {
  37 |   id: string;
  38 |   source: string;
  39 |   target: string;
  40 | 
  41 |   label?: string;
  42 |   animated?: boolean;
  43 |   style?: React.CSSProperties;
  44 |   type?: string;
  45 | 
  46 |   markerEnd?: any;
  47 |   markerStart?: any;
  48 |   className?: string;
  49 | }
  50 | 
  51 | /**
  52 |  * Matches the `PromptOptions` struct in Rust.
  53 |  * Used for generate_group_prompt and generate_combined_prompt.
  54 |  */
  55 | export interface PromptOptions {
  56 |   showLineNumbers: boolean;
  57 |   removeComments: boolean;
  58 |   redactions: string[];
  59 | 
  60 |   skeletonMode: string;
  61 |   skeletonTargets: string[];
  62 | }
  63 | 
  64 | /**
  65 |  * Request payload for scanning a workspace from a single entrypoint.
  66 |  */
  67 | export interface ScanParams {
  68 |   /** A stable id for the scan (we use workspace id on the frontend). */
  69 |   groupId: string;
  70 |   projectRoot: string;
  71 |   entryPoint: string;
  72 |   depth: number;
  73 |   flatten: boolean;
  74 | }
  75 | 
  76 | /**
  77 |  * Request payload for combining multiple groups (we use a single group in the new flow).
  78 |  */
  79 | export interface GroupRequest {
  80 |   entryPoint: string;
  81 |   depth: number;
  82 |   flatten: boolean;
  83 | }
  84 | 
  85 | /**
  86 |  * The raw response from the Rust `scan_workspace_group` command
  87 |  */
  88 | export interface ScanResponse {
  89 |   nodes: AxonNode[];
  90 |   edges: AxonEdge[];
  91 | }
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

