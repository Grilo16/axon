import { useCallback } from "react";
import { useAxonInvoke } from "@shared/hooks/useAxonInvoke";
import { AXON_COMMANDS } from "@shared/api/commands";
import type { AxonGraphView } from "@shared/types/axon-core/graph";

export const useGraph = () => {
  const graphBuilder = useAxonInvoke<AxonGraphView, { path: string }>( 
    AXON_COMMANDS.GRAPH.BUILD_GRAPH
  );

  /**
   * Triggers the Rust backend to parse the directory and build the AST/Dependency graph
   */
  const buildGraph = useCallback(
    async (targetPath: string) => {
      if (!targetPath) return;
      console.log(`%c[Axon] Building Graph for: ${targetPath}`, "color: #10b981; font-weight: bold;");
      return await graphBuilder.execute({ path: targetPath });
    },
    [graphBuilder]
  );

  const clearGraph = useCallback(() => {
    // We can add a manual clear to the useAxonInvoke later if needed, 
    // or just manage local state if you want to wipe the board.
  }, []);

  return {
    buildGraph,
    clearGraph,
    graphData: graphBuilder.data,
    isLoading: graphBuilder.isLoading,
    error: graphBuilder.error,
  };
};

export type UseGraphReturn = ReturnType<typeof useGraph>;