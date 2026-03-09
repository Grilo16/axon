import { useCallback } from "react";
import { toast } from "sonner";
import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";
import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";
import { useWorkspaceActions } from "@features/core/workspace/hooks/use-workspace-actions";

export const useExplorerActions = () => {
  const activeWorkspaceId = useActiveWorkspaceId();
  const { handle, isFetching } = useWorkspaceActions().lazyFilePathsByDir;
  const { toggleTargetFile, addTargetFiles, removeTargetFiles } =
    useActiveBundleActions();

  const toggleFolder = useCallback(
    async (path: string, currentlyHasFiles: boolean) => {
      if (!activeWorkspaceId) return;

      const loadingToast = toast.loading(`Scanning ${path}...`);

      try {
        const files = await handle({
          id: activeWorkspaceId,
          query: {
            path,
            recursive: true,
            limit: null,
          },
        });

        if (!files || files.length === 0) {
          toast.dismiss(loadingToast);
          toast.info("No valid files found in this folder.");
          return;
        }

        // 2. Pipe the result into our elite bulk mutators
        if (currentlyHasFiles) {
          removeTargetFiles(files);
          toast.success(`Removed ${files.length} files from graph.`, {
            id: loadingToast,
          });
        } else {
          addTargetFiles(files);
          toast.success(`Added ${files.length} files to graph.`, {
            id: loadingToast,
          });
        }
      } catch (error) {
        toast.error("Failed to fetch folder contents.", { id: loadingToast });
        console.error("[Explorer] Failed to toggle folder:", error);
      }
    },
    [activeWorkspaceId, handle, addTargetFiles, removeTargetFiles],
  );

  return {
    toggleFile: toggleTargetFile,
    toggleFolder,
    isFolderToggling: isFetching,
  };
};
