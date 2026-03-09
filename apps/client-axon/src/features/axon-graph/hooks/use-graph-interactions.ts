import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";
import { useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";

export const useGraphInteractions = () => {
  // Inherit the global Redux UI state interactions (hover, select, clear)
  const baseInteractions = useWorkspaceDispatchers();
  const bundleActions = useActiveBundleActions()

  return {
    ...baseInteractions,

   addNodeToBundle: (nodeId: string) => {
      bundleActions.addTargetFiles([nodeId]);
    },

    removeNodesFromBundle: (nodeIds: string[]) => {
      bundleActions.removeTargetFiles(nodeIds);
      // Clear selection so we don't have "ghost" selections
      baseInteractions.clearSelection();
    },

    batchUpdateNodesInBundle: (toAdd: string[], toRemove: string[]) => {
      // Safely fire only the mutations that actually have data
      if (toAdd.length > 0) bundleActions.addTargetFiles(toAdd);
      if (toRemove.length > 0) bundleActions.removeTargetFiles(toRemove);
    },

    triggerLayout: (direction: "TB" | "LR") => {
      console.log(`[Graph] Triggering layout calculation: ${direction}`);
    }
  };
};