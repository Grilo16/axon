import { useCallback } from "react";
import { useHistory } from "@shared/hooks/useHistory";
import {
  useListDirectoryQuery,
  useLazyListDirectoryQuery,
} from "../api/explorer-api";
import { useWorkspaceSession } from "@features/core/workspace";

export const useExplorer = () => {
  const history = useHistory<string>("");
  const currentPath = history.state;
  const { clearAllSelections } = useWorkspaceSession();

  const {
    data: entries = [],
    isLoading,
    error,
  } = useListDirectoryQuery({ path: currentPath });
  const [triggerLazyFetch] = useLazyListDirectoryQuery();

  const navigateTo = useCallback(
    (path: string) => {
      history.push(path);
      clearAllSelections();
    },
    [history, clearAllSelections],
  );

  const fetchDir = useCallback(
    async (path: string) => {
      return await triggerLazyFetch({ path }).unwrap();
    },
    [triggerLazyFetch],
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
