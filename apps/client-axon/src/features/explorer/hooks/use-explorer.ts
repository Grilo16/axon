import { AXON_COMMANDS } from "@shared/api/commands";
import { useAxonInvoke } from "@shared/hooks/useAxonInvoke";
import { useHistory } from "@shared/hooks/useHistory";
import type { ExplorerEntry } from "@shared/types/axon-core/explorer";
import { useCallback, useState } from "react";

export const useExplorer = (initialPath: string = "") => {
  const history = useHistory<string>(initialPath);

  // --- API Hooks ---
  const list = useAxonInvoke<ExplorerEntry[], { path: string }>(
    AXON_COMMANDS.EXPLORER.LIST_DIRECTORY,
  );
  const reader = useAxonInvoke<string, { path: string }>(
    AXON_COMMANDS.EXPLORER.READ_FILE,
  );

  // --- Selection State (Encapsulated!) ---
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  const handleSelect = useCallback((path: string, isMulti: boolean) => {
    setSelectedPaths((prev) => {
      const next = new Set(isMulti ? prev : []);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  // --- Navigation & Data Fetching ---
  const navigateTo = useCallback(
    async (path: string, shouldPush = true) => {
      const result = await list.execute({ path });
      if (shouldPush && result) history.push(path);
      return result;
    },
    [list, history],
  );

  const fetchDir = useCallback(
    async (path: string) => {
      return await list.executePure({ path });
    },
    [list],
  );

  // --- History Actions ---
  const goBack = useCallback(async () => {
    const prevPath = history.goBack();
    if (prevPath !== undefined) {
      await navigateTo(prevPath, false);
    }
  }, [history, navigateTo]);

  const goForward = useCallback(async () => {
    const nextPath = history.goForward();
    if (nextPath !== undefined) {
      await navigateTo(nextPath, false);
    }
  }, [history, navigateTo]);

  // --- File Reading ---
  const openFile = useCallback(
    async (path: string) => {
      const content = await reader.execute({ path });
      console.log(
        `%c[Axon] File Read: ${path}`,
        "color: #3b82f6; font-weight: bold;",
      );
      return content;
    },
    [reader],
  );

  return {
    // Actions
    navigateTo,
    openFile,
    goBack,
    goForward,
    fetchDir,
    handleSelect,
    clearSelection,

    // Directory state
    entries: list.data || [],
    isLoading: list.isLoading,
    error: list.error,
    currentPath: history.state,

    // Selection state
    selectedPaths,

    // History state
    canGoBack: history.canGoBack,
    canGoForward: history.canGoForward,

    // Reading state
    isReading: reader.isLoading,
    readError: reader.error,
  };
};

export type UseExplorerReturn = ReturnType<typeof useExplorer>;