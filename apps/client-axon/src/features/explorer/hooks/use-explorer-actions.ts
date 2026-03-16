import { useCallback } from "react";
import { toast } from "sonner";
import { useIsAuthenticated } from "@shared/hooks/use-auth-mode";
import { useActiveBundleActions } from "@core/bundles/hooks/use-active-bundle-actions";
import { useActiveWorkspaceId } from "@core/workspace/hooks/use-workspace-slice";

// 🌟 2. Import both Private and Public lazy triggers
import { useLazyGetFilePathsByDirQuery } from "@core/workspace/api/workspace-api";
import { useLazyGetPublicFilePathsByDirQuery } from "@core/public/api/public-api";

export const useExplorerActions = () => {
  const activeWorkspaceId = useActiveWorkspaceId();
  const isAuthenticated = useIsAuthenticated();
  const { toggleTargetFile, addTargetFiles, removeTargetFiles } = useActiveBundleActions();

  const [triggerPrivate, privateMeta] = useLazyGetFilePathsByDirQuery();
  const [triggerPublic, publicMeta] = useLazyGetPublicFilePathsByDirQuery();

  const toggleFolder = useCallback(
    async (path: string, currentlyHasFiles: boolean) => {
      if (!activeWorkspaceId) return;

      const loadingToast = toast.loading(`Scanning ${path}...`);

      try {
        const payload = {
          id: activeWorkspaceId,
          query: {
            path,
            recursive: true,
            limit: null,
          },
        };

        const files = isAuthenticated 
          ? await triggerPrivate(payload).unwrap() 
          : await triggerPublic(payload).unwrap();

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
    [
      activeWorkspaceId, 
      isAuthenticated, 
      triggerPrivate, 
      triggerPublic, 
      addTargetFiles, 
      removeTargetFiles
    ],
  );

  return {
    toggleFile: toggleTargetFile,
    toggleFolder,
    isFolderToggling: isAuthenticated ? privateMeta.isFetching : publicMeta.isFetching,
  };
};