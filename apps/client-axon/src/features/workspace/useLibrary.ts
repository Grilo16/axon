import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { 
  selectAllWorkspaces, 
  createWorkspace, 
  deleteWorkspace, 
  setActiveWorkspace,
  selectActiveId 
} from './workspacesSlice';

export const useLibrary = () => {
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector(selectAllWorkspaces);
  const activeId = useAppSelector(selectActiveId);

  const create = useCallback((name: string, root: string) => {
    dispatch(createWorkspace(name, root));
  }, [dispatch]);

  const open = useCallback((id: string) => {
    dispatch(setActiveWorkspace(id));
  }, [dispatch]);

  const remove = useCallback((id: string) => {
    dispatch(deleteWorkspace(id));
  }, [dispatch]);

  return {
    workspaces,
    activeId,
    create,
    open,
    remove
  };
};