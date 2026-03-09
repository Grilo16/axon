import { useState, useCallback, useRef } from "react";
import {
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  type NodeChange,
} from "@xyflow/react";
import type { AppEdge, AppNode } from "../types";
import { layoutVisibleGraph } from "../utils/focus-layout";

export function useGraphLayout() {
  const [nodes, setNodes] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  
  const [isLayouting, setIsLayouting] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const nodesRef = useRef<AppNode[]>([]);

  const onNodesChangeSafe = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      const layoutChanges = changes.filter((c) => c.type !== "select");
      setNodes((prev) => {
        const nextNodes = applyNodeChanges(layoutChanges, prev) as AppNode[];
        nodesRef.current = nextNodes; 
        return nextNodes;
      });
    },
    [setNodes]
  );

  // --- PURE LAYOUT CALCULATION ---
  const applyLayout = useCallback(
    async (
      rawNodes: AppNode[],
      rawEdges: AppEdge[],
      forceRelayout: boolean
    ) => {
      if (rawNodes.length === 0) {
        setNodes([]);
        setEdges([]);
        setLayoutError(null);
        setIsLayouting(false);
        return;
      }

      setIsLayouting(true);
      setLayoutError(null);

      try {
        const layouted = await layoutVisibleGraph(rawNodes, rawEdges, {
          previousNodes: nodesRef.current,
          forceRelayout,
        });

        // Simply set the coordinates! No highlight looping.
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
        nodesRef.current = layouted.nodes;
      } catch (error) {
        console.error("[Axon Focus Graph] Layout failed:", error);
        setLayoutError(error instanceof Error ? error.message : "Unknown layout error");
      } finally {
        setIsLayouting(false);
      }
    },
    [setNodes, setEdges]
  );

  return {
    nodes,
    edges,
    isLayouting,
    layoutError,
    onNodesChange: onNodesChangeSafe,
    onEdgesChange,
    applyLayout,
  };
}