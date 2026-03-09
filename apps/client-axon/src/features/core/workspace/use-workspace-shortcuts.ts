import { useEffect } from "react";
import { toast } from "sonner";
import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";
import { useSelectedPaths, useWorkspaceDispatchers } from "./hooks/use-workspace-slice";

export const useWorkspaceShortcuts = () => {
  const selectedPaths = useSelectedPaths();
  const { clearSelection } = useWorkspaceDispatchers();
  const { removeTargetFiles } = useActiveBundleActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
 
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Check for our target keys
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedPaths.length > 0) {
          e.preventDefault(); // Prevent browser from doing a "back page" navigation
          
          removeTargetFiles(selectedPaths);
          clearSelection(); // Drop the selection so we don't have "ghosts"
          
          toast.success(`Removed ${selectedPaths.length} items from the bundle.`);
        }
      }
      
      // Bonus: Escape key to clear selection!
      if (e.key === "Escape" && selectedPaths.length > 0) {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPaths, removeTargetFiles, clearSelection]);
};