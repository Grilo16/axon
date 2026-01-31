import { useState, useCallback, useRef } from 'react';
import { useAxonCore } from './useAxonCore';

interface FileSystemState {
  currentPath: string | null;
  files: any[];
  isLoading: boolean;
  error: string | null;
}

export const useFileSystem = (initialPath: string | null) => {
  const { listFiles } = useAxonCore();
  
  const [state, setState] = useState<FileSystemState>({
    currentPath: initialPath, 
    files: [],
    isLoading: false,
    error: null
  });

  const activeRequest = useRef<string | null>(null);

  const cd = useCallback(async (targetPath: string) => {
    setState(prev => ({ 
      ...prev, 
      currentPath: targetPath, 
      isLoading: true, 
      error: null 
    }));

    activeRequest.current = targetPath;

    try {
      const result = await listFiles(targetPath);
    
      if (activeRequest.current !== targetPath) return;

      const sorted = result.sort((a: any, b: any) => 
         Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name)
      );

      setState(prev => ({ 
        ...prev, 
        files: sorted, 
        isLoading: false 
      }));

    } catch (err) {
      if (activeRequest.current !== targetPath) return;
      
      console.error("FS Error", err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to load directory" 
      }));
    }
  }, [listFiles]);

  const navigateUp = useCallback(() => {
    if (!state.currentPath) return;
    const parent = state.currentPath.split(/[/\\]/).slice(0, -1).join('/');
    cd(parent || state.currentPath); 
  }, [state.currentPath, cd]);

  const refresh = useCallback(() => {
    if (state.currentPath) cd(state.currentPath);
  }, [state.currentPath, cd]);

  return {
    ...state, 
    cd,      
    navigateUp,
    refresh
  };
};