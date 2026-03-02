import { useCallback } from "react";
import { useHistory } from "@shared/hooks/useHistory";
import { useWorkspaceSession } from "@features/core/workspace";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useWorkspaceActions } from "@features/core/workspace/hooks/use-workspace-actions";
import {  } from "@features/core/workspace/api/workspace-api";
import { useListDirectoryQuery } from "@features/core/workspace/api/workspace-api";

export const useExplorer = () => {
  const { activeId } = useWorkspaceManager();
  const history = useHistory<string>("");
  const currentPath = history.state;
  const { clearAllSelections } = useWorkspaceSession();
  const { lazyListDir } = useWorkspaceActions();

  const {
    data: entries = [],
    isLoading,
    error,
  } = useListDirectoryQuery({
      id: activeId!,
      query:{path: currentPath}
    },{ skip: !activeId },
  );


  const navigateTo = useCallback(
    (path: string) => {
      history.push(path);
      clearAllSelections();
    },
    [history, clearAllSelections],
  );

  const fetchDir = useCallback(
    async (path: string) => {
      if (!activeId) return undefined;
      return await lazyListDir.handle({
        id: activeId,
        query: {path},
      });
    },
    [lazyListDir.handle, activeId],
  );

  const goBack = useCallback(() => {
    history.goBack();
    clearAllSelections();
  }, [history, clearAllSelections]);

  const goForward = useCallback(() => {
    history.goForward();
    clearAllSelections();
  }, [history, clearAllSelections]);

  return {
    navigateTo,
    goBack,
    goForward,
    fetchDir,
    entries,
    isLoading,
    error,
    currentPath,
    canGoBack: history.canGoBack,
    canGoForward: history.canGoForward,
  };
};

export type UseExplorerReturn = ReturnType<typeof useExplorer>;
