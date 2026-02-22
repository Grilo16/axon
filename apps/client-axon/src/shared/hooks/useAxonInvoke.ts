import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { AxonError } from '@shared/types/axon-core/error';

export function useAxonInvoke<T, Args extends Record<string, any>>(command: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AxonError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. This is the "Pure" executor. It doesn't touch the local state.
  // Useful for the recursive tree entries.
  const executePure = useCallback(async (args?: Args): Promise<T> => {
    try {
      return await invoke<T>(command, args);
    } catch (err) {
      throw err as AxonError;
    }
  }, [command]);

  // 2. This is the "Managed" executor. It updates local state.
  // Useful for the Sidebar root.
  const execute = useCallback(async (args?: Args) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await executePure(args);
      setData(result);
      return result;
    } catch (err) {
      setError(err as AxonError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [executePure]);

  return { data, error, isLoading, execute, executePure };
}