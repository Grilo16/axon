import { useEffect, useMemo, useRef } from "react";
import { Position } from "@xyflow/react";

import { useActiveBundleId } from "@features/core/workspace/hooks/use-workspace-slice";
import { useActiveBundleGraphQuery } from "@features/core/bundles/hooks/use-bundle-queries";
import { useGraphLayout } from "./use-graph-layout";

import type { AppNode, AppEdge, FocusFileNodeData } from "../types";

// --- The Master Facade Hook ---
export const useGraphModel = () => {
  const activeBundleId = useActiveBundleId();

  // 🌟 THE ELITE FIX: Just read the data directly from your switchboard!
  const { data: rawGraphData, isFetching, isError } = useActiveBundleGraphQuery();

  // Derive structural topology instantly via useMemo
  const topology = useMemo(() => {
    if (!rawGraphData) return { nodes: [], edges: [] };

    const useBiColorEdges = rawGraphData.edges.length <= 320;

    const nodes: AppNode[] = rawGraphData.nodes.map((node) => ({
      id: node.id, 
      type: "fileNode", 
      position: { x: 0, y: 0 },
      sourcePosition: Position.Bottom, 
      targetPosition: Position.Top, 
      draggable: true,
      data: {
        fileId: node.id, 
        label: node.label || node.id, 
        path: node.path,
        symbols: node.symbols ?? [], 
        imports: node.imports ?? [],
        usedBy: node.usedBy ?? [], 
      } satisfies FocusFileNodeData,
    }));

    const edges: AppEdge[] = rawGraphData.edges.map((edge) => ({
      id: edge.id, 
      source: edge.source, 
      target: edge.target,
      sourceHandle: "bottom-out", 
      targetHandle: "top-in",
      type: useBiColorEdges ? "biColorEdge" : "default",
      animated: false, 
      selectable: false,
    }));

    return { nodes, edges };
  }, [rawGraphData]);
  
  // Layout Engine
  const layout = useGraphLayout();
  const { applyLayout } = layout;

  // Structural change detector (prevents infinite layout loops)
  const topologyHash = useMemo(() =>
    topology.nodes.map(n => n.id).join(',') + '|' + topology.edges.map(e => e.id).join(','),
  [topology]);

  const prevHash = useRef<string | null>(null);

  useEffect(() => {
    if (topologyHash !== prevHash.current) {
      prevHash.current = topologyHash;
      applyLayout(topology.nodes, topology.edges, false);
    }
  }, [topologyHash, topology.nodes, topology.edges, applyLayout]);

  return {
    nodes: layout.nodes,
    edges: layout.edges,
    onNodesChange: layout.onNodesChange,
    onEdgesChange: layout.onEdgesChange,
    isWorking: isFetching || layout.isLayouting,
    isError: isError || !!layout.layoutError,
    errorMessage: layout.layoutError,
    isActive: !!activeBundleId,
    isEmpty: topology.nodes.length === 0,
  };
};