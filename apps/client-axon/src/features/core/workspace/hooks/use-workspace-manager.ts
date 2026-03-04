import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { setActiveWorkspaceId, selectActiveWorkspaceId } from '../workspace-slice';
import { useListWorkspacesQuery } from '../api/workspace-api'; 
import { useWorkspaceActions } from './use-workspace-actions';

const isTauri = "__TAURI_INTERNALS__" in window;

export const useWorkspaceManager = () => {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector(selectActiveWorkspaceId);

  // 1. GET DATA: Subscribed to the workspace list
  const { data: workspaces = [], isLoading: isFetching } = useListWorkspacesQuery({limit: null, offset: null});

  // 2. ACTIONS: Grab our wrapped factory handles
  const { 
    createWorkspace, 
    deleteWorkspace, 
    touchWorkspace, 
    loadLocalAst, 
    loadGithubAst 
  } = useWorkspaceActions();

  const engine = isTauri ? loadLocalAst : loadGithubAst;

  const activeWorkspace = useMemo(() => 
    workspaces.find(ws => ws.id === activeId), 
    [workspaces, activeId]
  );

  /**
   * OPEN / SWITCH: 
   * Updates Redux, touches the 'lastOpened' timestamp in DB, and boots AST into RAM.
   */
  const open = useCallback(async (id: string) => {
    dispatch(setActiveWorkspaceId(id));
    touchWorkspace.handle(id); 
    await engine.handle(id);
  }, [dispatch, touchWorkspace, engine]);

  /**
   * CREATE:
   * Stashes in DB, then automatically triggers the 'open' flow for the new workspace.
   */
  const create = useCallback(async (name: string, root: string) => {
    const newWs = await createWorkspace.handle({ name, projectRoot: root });
    await open(newWs.id);
  }, [createWorkspace, open]);

  /**
   * REMOVE:
   * Deletes from DB and clears active selection if it was the one deleted.
   */
  const remove = useCallback(async (id: string) => {
    await deleteWorkspace.handle(id);
    if (activeId === id) {
      dispatch(setActiveWorkspaceId(null));
    }
  }, [deleteWorkspace, activeId, dispatch]);

  /**
   * TAURI DIRECTORY PICKER:
   * Native OS dialog -> Create -> Open.
   */
  const triggerPickAndCreate = useCallback(async () => {
    const selectedPath = await openDialog({ directory: true, multiple: false });
    if (selectedPath && typeof selectedPath === "string") {
      const finalName = selectedPath.split(/[/\\]/).pop() || "Untitled Project";
      await create(finalName, selectedPath);
    }
  }, [create]);

  return { 
    // Data & Status
    workspaces, 
    activeWorkspace, 
    activeId,
    isActive: !!activeWorkspace, 
    isBooting: engine.isLoading || isFetching,
    isCreating: createWorkspace.isLoading,
    
    // Operations
    create, 
    open, 
    remove, 
    triggerPickAndCreate 
  };
};