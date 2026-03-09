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
  const value = useMemo(() => {
    const selectedPathsSet = new Set(selectedPaths);
    
    // Convert selected paths to their actual node IDs for edge matching
    const selectedNodeIdsSet = new Set(
      nodes.filter(n => selectedPathsSet.has(n.data.path)).map(n => n.id)
    );

    const connectedNodeIdsSet = new Set<string>();
    
    if (selectedNodeIdsSet.size > 0) {
      edges.forEach((edge) => {
        if (selectedNodeIdsSet.has(edge.source)) connectedNodeIdsSet.add(edge.target);
        if (selectedNodeIdsSet.has(edge.target)) connectedNodeIdsSet.add(edge.source);
      });
    }

    return { selectedPathsSet, connectedNodeIdsSet, hoveredPath };
  }, [nodes, edges, selectedPaths, hoveredPath]);

  return (
    <GraphRenderContext.Provider value={value}>
      {children}
    </GraphRenderContext.Provider>
  );
};