import React, { createContext, useContext, useMemo } from "react";
import type { AppEdge, AppNode } from "../types";

interface GraphRenderContextValue {
  selectedPathsSet: Set<string>;
  connectedNodeIdsSet: Set<string>;
  hoveredPath: string | null;
}

const GraphRenderContext = createContext<GraphRenderContextValue | null>(null);

export const useGraphRender = () => {
  const ctx = useContext(GraphRenderContext);
  if (!ctx) throw new Error("useGraphRender must be used within GraphRenderProvider");
  return ctx;
};

interface ProviderProps {
  nodes: AppNode[];
  edges: AppEdge[];
  selectedPaths: string[];
  hoveredPath: string | null;
  children: React.ReactNode;
}

export const GraphRenderProvider: React.FC<ProviderProps> = ({
  nodes, edges, selectedPaths, hoveredPath, children
}) => {
  // Build a stable path->id map that only changes when the node set changes (not on position/style updates)
  const pathToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach(n => map.set(n.data.path, n.id));
    return map;
  }, [nodes.map(n => n.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build a stable edge key that only changes when connectivity changes
  const edgeKey = useMemo(() =>
    edges.map(e => `${e.source}-${e.target}`).join(','),
  [edges]);

  const value = useMemo(() => {
    const selectedPathsSet = new Set(selectedPaths);

    // Convert selected paths to their actual node IDs for edge matching
    const selectedNodeIdsSet = new Set<string>();
    for (const path of selectedPaths) {
      const id = pathToIdMap.get(path);
      if (id) selectedNodeIdsSet.add(id);
    }

    const connectedNodeIdsSet = new Set<string>();

    if (selectedNodeIdsSet.size > 0) {
      edges.forEach((edge) => {
        if (selectedNodeIdsSet.has(edge.source)) connectedNodeIdsSet.add(edge.target);
        if (selectedNodeIdsSet.has(edge.target)) connectedNodeIdsSet.add(edge.source);
      });
    }

    return { selectedPathsSet, connectedNodeIdsSet, hoveredPath };
  }, [pathToIdMap, edgeKey, selectedPaths, hoveredPath, edges]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GraphRenderContext.Provider value={value}>
      {children}
    </GraphRenderContext.Provider>
  );
};