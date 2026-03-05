import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import {
  Background, BackgroundVariant, Controls, MiniMap, ReactFlow, Position, useReactFlow
} from "@xyflow/react";
import { Loader2 } from "lucide-react";
import "@xyflow/react/dist/style.css";

import type { AppEdge, AppNode, AxonGraphView, FocusNodeActions } from "../../types";
import { FileNode } from "../file-node/file-node";
import { GraphToolbar } from "./graph-toolbar";
import { BiColorEdge } from "./bi-color-edge";
import { ZoomSizeResetter } from "../../utils/zoom-size-resetter";
import { useGraphLayout } from "../../hooks/use-graph-layout";
import { GraphActionsProvider } from "../../context/graph-actions";

import { useWorkspaceSession } from "@features/core/workspace";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { Flex, Text, Box } from "@shared/ui";

const nodeTypes = { fileNode: FileNode };
const edgeTypes = { biColorEdge: BiColorEdge };

// --- XYFlow CSS Overrides ---
const FlowChromeOverrides = styled(Box)`
  .react-flow__node {
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease, filter 0.3s ease;
  }
  .react-flow__node.dragging, .react-flow__node.selected.dragging {
    transition: none !important;
  }
  .react-flow__node.dimmed-node { opacity: 0.15; filter: grayscale(100%); }
  .react-flow__node.semi-dimmed-node { opacity: 0.55; filter: grayscale(40%); }
  .react-flow__edge.dimmed-edge { opacity: 0.02 !important; filter: grayscale(100%); pointer-events: none; }
  
  .react-flow__controls { background: #222; border: 1px solid #444; border-radius: 8px; overflow: hidden; }
  .react-flow__controls-button { background: #222; border-bottom: 1px solid #333; color: #ccc; }
  .react-flow__controls-button:hover { background: #2a2a2a; }
  .react-flow__minimap { background: #111; border: 1px solid #2f2f2f; border-radius: 8px; overflow: hidden; }
`;

const BundleCenterer = ({ activeBundleId }: { activeBundleId?: string }) => {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (activeBundleId) setTimeout(() => { fitView({ duration: 800, padding: 0.2 }); }, 250);
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

export const GraphCanvas: React.FC<Props> = ({ graphData, activeFiles, actions, isLoading = false, isFetching = false }) => {
  const { toggleSelection, setHovered, clearAllSelections } = useWorkspaceSession();
  const { activePaths, setPaths, activeBundle } = useBundleSession();
  const { nodes, edges, isLayouting, layoutError, onNodesChange, onEdgesChange, applyLayout } = useGraphLayout();

  const handleNodesDelete = useCallback((deletedNodes: AppNode[]) => {
    const idsToRemove = deletedNodes.map((n) => n.id);
    setPaths(activePaths.filter((p) => !idsToRemove.includes(p)));
    clearAllSelections();
  }, [activePaths, setPaths, clearAllSelections]);

  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) {
      applyLayout([], [], false);
      return;
    }

    const rawNodes: AppNode[] = graphData.nodes.map((node) => ({
      id: node.id, type: "fileNode", position: { x: 0, y: 0 },
      sourcePosition: Position.Bottom, targetPosition: Position.Top, draggable: true,
      data: {
        fileId: node.id, label: node.label || node.id, path: node.path,
        symbols: node.symbols ?? [], imports: node.imports ?? [],
        usedBy: node.usedBy ?? [], globalActiveFiles: activeFiles,
      },
    }));

    const useBiColorEdges = graphData.edges.length <= 320;
    const rawEdges: AppEdge[] = graphData.edges.map((edge) => ({
      id: edge.id, source: edge.source, target: edge.target,
      sourceHandle: "bottom-out", targetHandle: "top-in",
      type: useBiColorEdges ? "biColorEdge" : undefined,
      animated: false, selectable: false,
    }));

    void applyLayout(rawNodes, rawEdges, false);
  }, [graphData, activeFiles, applyLayout]);

  const showEmpty = !graphData || nodes.length === 0;
  const showLoader = isLayouting || isLoading || isFetching;

  return (
    <Box id="tour-graph-canvas" $fill $bg="bg.main" style={{ position: 'relative' }}>
      
      {/* SVG Definitions for Gradients */}
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

      {/* Loading Overlay */}
      {showLoader && (
        <Flex $fill $align="center" $justify="center" $direction="column" $gap="md" style={{ position: 'absolute', zIndex: 20, background: 'rgba(0,0,0,0.5)' }}>
          <Loader2 size={32} className="animate-spin" color="#60a5fa" />
          <Text $size="sm" $weight="bold" $color="palette.primary.light" $uppercase $letterSpacing="0.08em">
            {isLoading || isFetching ? "Loading Graph Data..." : "Computing Layout..."}
          </Text>
        </Flex>
      )}

      {/* Error Banner */}
      {layoutError && (
        <Box $bg="palette.danger.dark" $p="sm md" $radius="md" style={{ position: 'absolute', top: 12, left: 12, zIndex: 30, border: '1px solid #7f1d1d' }}>
          <Text $color="palette.danger.light" $size="sm">Layout error: {layoutError}</Text>
        </Box>
      )}

      {/* Flow Chrome */}
      {!showEmpty && !isLoading && (
        <FlowChromeOverrides $fill>
          <GraphActionsProvider actions={actions}>
            <ReactFlow<AppNode, AppEdge>
              nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onNodeMouseEnter={(_, node) => setHovered(node.data.fileId)}
              onNodeMouseLeave={() => setHovered(null)}
              onNodeClick={(e, node) => toggleSelection(node.data.fileId, e.shiftKey)}
              onPaneClick={() => clearAllSelections()}
              onNodesDelete={handleNodesDelete}
              elementsSelectable={true} fitView colorMode="dark" minZoom={0.05} maxZoom={1.8}
            >
              <BundleCenterer activeBundleId={activeBundle?.id} />
              <ZoomSizeResetter />
              <GraphToolbar />
              <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#222" />
              <Controls />
              <MiniMap nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.8)" />
            </ReactFlow>
          </GraphActionsProvider>
        </FlowChromeOverrides>
      )}
    </Box>
  );
};