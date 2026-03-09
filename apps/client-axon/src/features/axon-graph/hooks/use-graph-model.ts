import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { useAppSelector } from "@app/store"; 
import { bundleApi } from "@features/core/bundles/api/bundles-api";
import { useGetPublicGraphQuery, publicApi } from "@features/public/api/public-api";
import { createSelector } from "@reduxjs/toolkit";
import { Position } from "@xyflow/react";
import type { AppNode, AppEdge, FocusFileNodeData } from "../types";
import { useGraphLayout } from "./use-graph-layout";
import { useActiveBundleGraphQuery } from "@features/core/bundles/hooks/use-bundle-queries";

// --- Pure Selectors for Deriving Topology ---
const selectRawGraphData = (state: any, activeBundleId: string | null, isAuthenticated: boolean) => {
  if (!activeBundleId) return null;
  if (isAuthenticated) {
    return bundleApi.endpoints.getBundleGraph.select(activeBundleId)(state)?.data;
  } else {
    const req = state.publicBundles.bundles[activeBundleId];
    return req ? publicApi.endpoints.getPublicGraph.select(req)(state)?.data : null;
  }
};

const selectGraphTopology = createSelector(
  [selectRawGraphData],
  (graphData) => {
    // If there is no graph data, we return a stable default object
    if (!graphData) return { nodes: [], edges: [] };

    const useBiColorEdges = graphData.edges.length <= 320;

    const nodes: AppNode[] = graphData.nodes.map((node) => ({
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

    const edges: AppEdge[] = graphData.edges.map((edge) => ({
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
  }
);

// --- The Master Facade Hook ---
export const useGraphModel = () => {
  const { isAuthenticated } = useAuth();
  const activeBundleId = useAppSelector((state) => state.workspaceUi.activeBundleId);
  const publicGraphReq = useAppSelector((state) => activeBundleId ? state.publicBundles.bundles[activeBundleId] : undefined);

  // Network Queries (Declarative)
  const privateQuery = useActiveBundleGraphQuery()
  
  const publicQuery = useGetPublicGraphQuery(
    publicGraphReq!,
    { skip: isAuthenticated || !activeBundleId || !publicGraphReq }
  );

  const isFetching = isAuthenticated ? privateQuery.isFetching : publicQuery.isFetching;
  const isError = isAuthenticated ? privateQuery.isError : publicQuery.isError;

  // Derive structural topology instantly
  const topology = useAppSelector((state) => selectGraphTopology(state, activeBundleId, isAuthenticated));
  
  // Layout Engine
  const layout = useGraphLayout();
  
  // Structural change detector (prevents infinite layout loops)
  const topologyHash = useMemo(() => 
    topology.nodes.map(n => n.id).join(',') + '|' + topology.edges.map(e => e.id).join(','),
  [topology]);
  
  const prevHash = useRef<string | null>(null);

  useEffect(() => {
    if (topologyHash !== prevHash.current) {
      prevHash.current = topologyHash;
      layout.applyLayout(topology.nodes, topology.edges, false);
    }
  }, [topologyHash, topology.nodes, topology.edges, layout]);

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