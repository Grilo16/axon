import { useState, useCallback, useMemo } from "react";
import { open as openTauriDialog } from "@tauri-apps/plugin-dialog";
import { IS_TAURI } from "@app/constants";
import { useWorkspaceManager } from "./use-workspace-manager";

export const useWorkspaceLoader = (onClose?: () => void) => {
  const { workspaces, open, create, remove } = useWorkspaceManager();
  const [mode, setMode] = useState<"list" | "create">(workspaces.length > 0 ? "list" : "create");
  
  // Form State
  const [newName, setNewName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const sortedWorkspaces = useMemo(() => {
    return [...workspaces].sort(
      (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
    );
  }, [workspaces]);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (IS_TAURI) {
      try {
        const selectedPath = await openTauriDialog({
          directory: true,
          multiple: false,
          title: "Select Project Root for Axon",
        });

        if (selectedPath && typeof selectedPath === "string") {
          const finalName = newName.trim() || selectedPath.split(/[/\\]/).pop() || "Untitled Project";
          await create(finalName, selectedPath);
          onClose?.();
        }
      } catch (err) {
        console.error("Failed to pick directory:", err);
      }
    } else {
      if (!githubUrl.trim()) return;
      
      const urlParts = githubUrl.trim().split('/');
      const repoName = urlParts.pop() || "GitHub Repository";
      const finalName = newName.trim() || repoName;
      
      await create(finalName, githubUrl.trim());
      onClose?.();
    }
  }, [IS_TAURI, newName, githubUrl, create, onClose]);

  const handleOpenWorkspace = useCallback((id: string) => {
    open(id);
    onClose?.();
  }, [open, onClose]);

  return {
    mode,
    setMode,
    newName,
    setNewName,
    githubUrl,
    setGithubUrl,
    workspaces: sortedWorkspaces,
    handleOpenWorkspace,
    handleRemoveWorkspace: remove,
    handleCreate
  };
};