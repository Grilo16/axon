import { useState, useCallback } from "react";
import type { ExplorerEntry as ExplorerEntryType } from "@shared/types/axon-core/explorer";

import { useNodeSession, useWorkspaceSession } from "@features/core/workspace";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useWorkspaceActions } from "@features/core/workspace/hooks/use-workspace-actions";
import type { ExplorerOptions } from "../components/explorer-node/explorer-node";

export const useExplorerNode = (
  entry: ExplorerEntryType,
  options: ExplorerOptions,
  onFolderExpand: (path: string) => Promise<ExplorerEntryType[] | undefined>,
  onNavigate: (path: string) => void,
) => {
  const path = entry.data.path;
  const isFolder = entry.type === "folder";

  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<ExplorerEntryType[]>([]);
  const [loading, setLoading] = useState(false);

  const { hoverRelationship, isSelected } = useNodeSession(path);
  const { activeId } = useWorkspaceManager();
  const { toggleSelection, setHovered, openFileInViewer } =
    useWorkspaceSession();
  const { activePaths, setPaths, toggleTarget } = useBundleSession();
  const { handle, isFetching } = useWorkspaceActions().lazyFilePathsByDir;

  const isFocused =
    hoverRelationship === "exact" ||
    (hoverRelationship === "child-hovered" && !isOpen);
  const inGraph = !isFolder && activePaths.includes(path);
  const folderActiveFilesCount = isFolder
    ? activePaths.filter((p) => p.startsWith(path + "/")).length
    : 0;
  const hasFilesInGraph = folderActiveFilesCount > 0;

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isFolder) return;
      if (options.cascade === false) {
        onNavigate(path);
        return;
      }
      if (!isOpen && children.length === 0) {
        setLoading(true);
        const result = await onFolderExpand(path);
        if (result) setChildren(result);
        setLoading(false);
      }
      setIsOpen((prev) => !prev);
    },
    [
      isFolder,
      options.cascade,
      isOpen,
      children.length,
      onNavigate,
      path,
      onFolderExpand,
    ],
  );

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder && options.foldersSelectable === false) return;
      if (!isFolder && options.filesSelectable === false) return;
      toggleSelection(
        path,
        options.multiSelect ? e.ctrlKey || e.metaKey : false,
      );
    },
    [isFolder, options, path, toggleSelection],
  );

  const handleToggleFileGraph = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleTarget(path);
    },
    [path, toggleTarget],
  );

  const handleToggleFolderGraph = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isFolder || !activeId) return;
      try {
        const folderFiles = await handle({
          id: activeId,
          query: { limit: 100, path: path, recursive: true },
        });
        if (!folderFiles || folderFiles.length === 0) return;

        const allInGraph = folderFiles.every((f) => activePaths.includes(f));
        if (allInGraph) {
          setPaths(activePaths.filter((p) => !folderFiles.includes(p)));
        } else {
          setPaths(Array.from(new Set([...activePaths, ...folderFiles])));
        }
      } catch (err) {
        console.error("Failed to toggle folder files", err);
      }
    },
    [isFolder, activeId, handle, path, activePaths, setPaths],
  );

  return {
    isFolder,
    isOpen,
    children,
    loading,
    isFocused,
    isSelected,
    inGraph,
    hasFilesInGraph,
    isFetching,
    path,
    handleToggle,
    handleSelect,
    handleToggleFileGraph,
    handleToggleFolderGraph,
    setHovered,
    openFileInViewer,
  };
};
