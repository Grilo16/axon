import React, { useCallback, useEffect } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Loader2 } from "lucide-react";
import "@xyflow/react/dist/style.css";

import * as S from "./graph-canvas.styles";
import type {
  AppEdge,
  AppNode,
  AxonGraphView,
  FocusNodeActions,
} from "../../types";
import { FileNode } from "../file-node/file-node";
import { GraphToolbar } from "../graph-toolbar/graph-toolbar";
import { BiColorEdge } from "../bi-color-edge";
import { ZoomSizeResetter } from "./zoom-size-resetter";
import { useGraphLayout } from "../../hooks/use-graph-layout";
import { GraphActionsProvider } from "../../context/graph-actions";

import { useWorkspaceSession } from "@features/core/workspace";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";

const nodeTypes = { fileNode: FileNode };
const edgeTypes = { biColorEdge: BiColorEdge };

const BundleCenterer = ({ activeBundleId }: { activeBundleId?: string }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (activeBundleId) {
      setTimeout(() => {
        fitView({ duration: 800, padding: 0.2 });
      }, 250);
    }
  }, [activeBundleId, fitView]);

  return null;
};

type Props = {
  graphData: AxonGraphView | null;
  activeFiles: string[];
  actions: FocusNodeActions;
  isLoading?: boolean;
  isFetching?: boolean;
};

export const GraphCanvas: React.FC<Props> = ({
  graphData,
  activeFiles,
  actions,
  isLoading = false,
  isFetching = false,
}) => {
  const { toggleSelection, setHovered, clearAllSelections } = useWorkspaceSession();
  const { activePaths, setPaths, activeBundle } = useBundleSession();
  const {
    nodes,
    edges,
    isLayouting,
    layoutError,
    onNodesChange,
    onEdgesChange,
    applyLayout,
  } = useGraphLayout();

  const handleNodesDelete = useCallback(
    (deletedNodes: AppNode[]) => {
      const idsToRemove = deletedNodes.map((n) => n.id);
      const nextPaths = activePaths.filter((p) => !idsToRemove.includes(p));
      setPaths(nextPaths);
      clearAllSelections();
    },
    [activePaths, setPaths, clearAllSelections],
  );

  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) {
      applyLayout([], [], false);
      return;
    }

    const rawNodes: AppNode[] = graphData.nodes.map((node) => ({
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
        globalActiveFiles: activeFiles,
      },
    }));

    const useBiColorEdges = graphData.edges.length <= 320;
    const rawEdges: AppEdge[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: "bottom-out",
      targetHandle: "top-in",
      type: useBiColorEdges ? "biColorEdge" : undefined,
      animated: false,
      selectable: false,
    }));

    void applyLayout(rawNodes, rawEdges, false);
  }, [graphData, activeFiles, applyLayout]);

  const showEmpty = !graphData || nodes.length === 0;
  const showLoader = isLayouting || isLoading || isFetching;

  return (
    <S.GraphContainer>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient-down" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="edge-gradient-up" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>

      {showLoader && (
        <S.Overlay>
          <Loader2 size={32} className="animate-spin" />
          <S.OverlayText>
            {isLoading || isFetching ? "Loading Graph Data..." : "Computing Layout..."}
          </S.OverlayText>
        </S.Overlay>
      )}

      {layoutError && <S.ErrorBanner>Layout error: {layoutError}</S.ErrorBanner>}

      {/* ✨ Magic unmount: if isLoading is true, we kill the FlowChrome completely so the old canvas never shows. */}
      {!showEmpty && !isLoading && (
        <S.FlowChrome>
          <GraphActionsProvider actions={actions}>
            <ReactFlow<AppNode, AppEdge>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeMouseEnter={(_, node) => setHovered(node.data.fileId)}
              onNodeMouseLeave={() => setHovered(null)}
              onNodeClick={(e, node) => toggleSelection(node.data.fileId, e.shiftKey)}
              onPaneClick={() => clearAllSelections()}
              onNodesDelete={handleNodesDelete}
              elementsSelectable={true}
              fitView
              colorMode="dark"
              minZoom={0.05}
              maxZoom={1.8}
            >
              <BundleCenterer activeBundleId={activeBundle?.id} />
              <ZoomSizeResetter />
              <GraphToolbar />
              <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#222" />
              <Controls />
              <MiniMap nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.8)" />
            </ReactFlow>
          </GraphActionsProvider>
        </S.FlowChrome>
      )}
    </S.GraphContainer>
  );
};