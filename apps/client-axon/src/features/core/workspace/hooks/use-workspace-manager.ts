import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { 
  selectAllWorkspaces, 
  createWorkspace, 
  deleteWorkspace, 
  setActiveWorkspace,
  selectActiveWorkspace,
} from '../workspace-slice';
import { useLoadWorkspaceMutation } from '../api/workspace-api';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
/**
 * Global Workspace Manager
 * Handles the lifecycle of projects: Creating, Opening, Booting Rust, and Deleting.
 */
export const useWorkspaceManager = () => {
  const dispatch = useAppDispatch();
  
  // State
  const workspaces = useAppSelector(selectAllWorkspaces);
  const activeWorkspace = useAppSelector(selectActiveWorkspace);
  const isActive = !!activeWorkspace;

  const [triggerLoad, { isLoading: isBooting }] = useLoadWorkspaceMutation();


  /**
   * Creates a new workspace entry.
   * (Note: The bundles-slice automatically intercepts this to create a Main Bundle!)
   */
  const create = useCallback((name: string, root: string) => {
    dispatch(createWorkspace(name, root));
  }, [dispatch]);

  /**
   * Boots up the Rust backend engine for the given workspace ID.
   */
  const open = useCallback(async (id: string) => {
    const targetWorkspace = workspaces.find(ws => ws.id === id);
    if (!targetWorkspace) return;

    try {
      // 1. Tell Rust to parse the ASTs and load into RAM
      await triggerLoad({ path: targetWorkspace.projectRoot }).unwrap();
      
      // 2. Tell React we are officially inside the workspace
      dispatch(setActiveWorkspace(id));
      
    } catch (error) {
      console.error("Failed to boot workspace:", error);
    }
  }, [dispatch, workspaces, triggerLoad]);

  /**
   * Deletes a workspace from the library.
   */
  const remove = useCallback((id: string) => {
    dispatch(deleteWorkspace(id));
  }, [dispatch]);


  const triggerPickAndCreate = useCallback(async () => {
    try {
      const selectedPath = await openDialog({
        directory: true,
        multiple: false,
        title: "Select Project Root for Axon",
      });

      if (selectedPath && typeof selectedPath === "string") {
        const finalName = selectedPath.split(/[/\\]/).pop() || "Untitled Project";
        create(finalName, selectedPath);
        // We can automatically open it right after creating!
        const newWs = workspaces.find(w => w.projectRoot === selectedPath);
        if (newWs) {
          open(newWs.id)
        }
      }
    } catch (err) {
      console.error("Failed to pick directory:", err);
    }
  }, [create, workspaces]);
  return { 
    workspaces, 
    activeWorkspace,
    isActive, 
    isBooting,
    create, 
    open, 
    remove,
    triggerPickAndCreate, 
  };
};