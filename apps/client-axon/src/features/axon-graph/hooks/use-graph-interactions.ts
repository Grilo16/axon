import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";
import { useActiveBundleQuery } from "@features/core/bundles/hooks/use-bundle-queries";
import { useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";

export const useGraphInteractions = () => {
  // Inherit the global Redux UI state interactions (hover, select, clear)
  const baseInteractions = useWorkspaceDispatchers();
  const {activeBundle} = useActiveBundleQuery()  
  const activePaths = activeBundle?.options.targetFiles || []
  const {setTargetFiles} = useActiveBundleActions()

  return {
    ...baseInteractions,

    // 🌟 Unified Graph Mutation API
    addNodeToBundle: (nodeId: string) => {
      if (!activePaths?.includes(nodeId)) {
        setTargetFiles([...activePaths, nodeId]);
      }
    },

    removeNodesFromBundle: (nodeIds: string[]) => {
      const nextPaths = activePaths.filter((path) => !nodeIds.includes(path));
      setTargetFiles(nextPaths);
      baseInteractions.clearSelection();
    },

    batchUpdateNodesInBundle: (toAdd: string[], toRemove: string[]) => {
      const nextSet = new Set(activePaths);
      toAdd.forEach((id) => nextSet.add(id));
      toRemove.forEach((id) => nextSet.delete(id));
      setTargetFiles(Array.from(nextSet));
    },

    triggerLayout: (direction: "TB" | "LR") => {
      console.log(`[Graph] Triggering layout calculation: ${direction}`);
    }
  };
};