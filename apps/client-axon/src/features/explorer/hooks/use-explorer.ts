import { useCallback, useEffect } from "react";
import { useHistory } from "@shared/hooks/useHistory";
import { useWorkspaceSession } from "@features/core/workspace";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useWorkspaceActions } from "@features/core/workspace/hooks/use-workspace-actions";
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
    isFetching,
    error,
  } = useListDirectoryQuery({
      id: activeId!,
      query: { path: currentPath }
    }, { skip: !activeId }
  );

  const navigateTo = useCallback(
    (path: string) => {
      history.push(path);
      clearAllSelections();
    },
    [history, clearAllSelections],
  );

  useEffect(() => {
    if (activeId && currentPath !== "") {
      navigateTo("");
    }
  }, [activeId, currentPath, navigateTo]);

  const fetchDir = useCallback(
    async (path: string) => {
      if (!activeId) return undefined;
      return await lazyListDir.handle({
        id: activeId,
        query: { path },
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
    isFetching,
    error,
    currentPath,
    canGoBack: history.canGoBack,
    canGoForward: history.canGoForward,
  };
};

export type UseExplorerReturn = ReturnType<typeof useExplorer>;