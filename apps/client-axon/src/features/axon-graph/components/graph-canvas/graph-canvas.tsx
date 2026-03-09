import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  Background, BackgroundVariant, Controls, MiniMap, ReactFlow
} from "@xyflow/react";
import { Loader2 } from "lucide-react";
import "@xyflow/react/dist/style.css";

import type { AppEdge, AppNode } from "../../types";
import { FileNode } from "../file-node/file-node";
import { GraphToolbar } from "./graph-toolbar";
import { BiColorEdge } from "./bi-color-edge";
import { ZoomSizeResetter } from "../../utils/zoom-size-resetter";
import { useGraphModel } from "../../hooks/use-graph-model";
import { useGraphInteractions } from "../../hooks/use-graph-interactions";

import { Flex, Text, Box } from "@shared/ui";
// 🌟 Import our atomic Redux selector
import { useHoveredPath, useSelectedPaths } from "@features/core/workspace/hooks/use-workspace-slice";

const nodeTypes = { fileNode: FileNode };
const edgeTypes = { biColorEdge: BiColorEdge };

const FlowChromeOverrides = styled(Box)`
  .react-flow__node {
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease, filter 0.3s ease;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
  }
  
  .react-flow__node.selected {
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
  }
  
  .react-flow__node.dragging, .react-flow__node.selected.dragging {
    transition: none !important;
  }
  
  .react-flow__node.dimmed-node { opacity: 0.15; filter: grayscale(100%); }
  .react-flow__node.semi-dimmed-node { opacity: 0.55; filter: grayscale(40%); }
  .react-flow__edge.dimmed-edge { opacity: 0.04 !important; filter: grayscale(100%); pointer-events: none; }
  
  .react-flow__node.hover-targeted-node {
    opacity: 1 !important;
    filter: none !important;
    z-index: 1000;
  }

  .react-flow__node.hover-targeted-node > div {
    border-color: #3b82f6 !important; 
    box-shadow: 0 0 0 2px #3b82f6, 0 0 24px rgba(59, 130, 246, 0.4) !important;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  /* Controls Chrome */
  .react-flow__controls { background: #222; border: 1px solid #444; border-radius: 8px; overflow: hidden; }
  .react-flow__controls-button { background: #222; border-bottom: 1px solid #333; color: #ccc; }
  .react-flow__controls-button:hover { background: #2a2a2a; }
  .react-flow__minimap { background: #111; border: 1px solid #2f2f2f; border-radius: 8px; overflow: hidden; }
`;
export const GraphCanvas: React.FC = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, isWorking, isError, errorMessage, isEmpty 
  } = useGraphModel();
  
  const { 
    hoverNode, toggleSelection, clearSelection, removeNodesFromBundle 
  } = useGraphInteractions();

  // 1. Grab the current selection from Redux
  const selectedPaths = useSelectedPaths();

  const handleNodesDelete = useCallback((deletedNodes: AppNode[]) => {
    removeNodesFromBundle(deletedNodes.map((n) => n.id));
  }, [removeNodesFromBundle]);

  
  const hoveredPath = useHoveredPath()

  const { displayNodes, displayEdges } = useMemo(() => {
    const selectedSet = new Set(selectedPaths);
    const connectedSet = new Set<string>();

    edges.forEach((edge) => {
      if (selectedSet.has(edge.source)) connectedSet.add(edge.target);
      if (selectedSet.has(edge.target)) connectedSet.add(edge.source);
    });

    const nextNodes = nodes.map((node) => {
      const isSelected = selectedSet.has(node.id);
      const isConnected = connectedSet.has(node.id);
      
      const isHoverTarget = hoveredPath && (node.data.path === hoveredPath || node.data.path.startsWith(hoveredPath + '/'));

      let className = node.className ? node.className.replace(/dimmed-node|semi-dimmed-node|hover-targeted-node/g, '') : "";

      // Prioritize the visual hierarchy
      if (isHoverTarget) {
        className += " hover-targeted-node"; // Overrides everything with a bright glow
      } else if (selectedPaths.length > 0) {
        if (isSelected) {
          // Native selection handles border natively
        } else if (isConnected) {
          className += " semi-dimmed-node";
        } else {
          className += " dimmed-node";
        }
      }

      return { ...node, className: className.trim() };
    });

    const nextEdges = edges.map((edge) => {
      const isSourceSelected = selectedSet.has(edge.source);
      const isTargetSelected = selectedSet.has(edge.target);
      const isConnectedEdge = isSourceSelected || isTargetSelected;

      let className = edge.className ? edge.className.replace(/dimmed-edge/g, '') : "";
      
      if (selectedPaths.length > 0 && !isConnectedEdge) {
        className += " dimmed-edge";
      }

      return { ...edge, className: className.trim() };
    });

    return { displayNodes: nextNodes, displayEdges: nextEdges };
  }, [nodes, edges, selectedPaths, hoveredPath]);
  return (
    <Box id="tour-graph-canvas" $fill $bg="bg.main" style={{ position: 'relative' }}>
      
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

      {isWorking && (
        <Flex $fill $align="center" $justify="center" $direction="column" $gap="md" style={{ position: 'absolute', zIndex: 20, background: 'rgba(0,0,0,0.5)' }}>
          <Loader2 size={32} className="animate-spin" color="#60a5fa" />
          <Text $size="sm" $weight="bold" $color="palette.primary.light" $uppercase $letterSpacing="0.08em">
            Processing Graph...
          </Text>
        </Flex>
      )}

      {isError && (
        <Box $bg="palette.danger.dark" $p="sm md" $radius="md" style={{ position: 'absolute', top: 12, left: 12, zIndex: 30, border: '1px solid #7f1d1d' }}>
          <Text $color="palette.danger.light" $size="sm">Layout error: {errorMessage}</Text>
        </Box>
      )}

      {!isEmpty && (
        <FlowChromeOverrides $fill>
          <ReactFlow<AppNode, AppEdge>
            nodes={displayNodes} 
            edges={displayEdges} 
            
            nodeTypes={nodeTypes} 
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange}
            
            onNodeMouseEnter={(_, node) => hoverNode(node.data.fileId)}
            onNodeMouseLeave={() => hoverNode(null)}
            onNodeClick={(e, node) => {
              const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
              toggleSelection(node.data.fileId, isMulti);
            }}
            onPaneClick={() => clearSelection()}
            onNodesDelete={handleNodesDelete}
            
            elementsSelectable={true} 
            fitView 
            colorMode="dark" 
            minZoom={0.05} 
            maxZoom={1.8}
          >
            <ZoomSizeResetter />
            <GraphToolbar />
            <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#222" />
            <Controls />
            <MiniMap nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.8)" />
          </ReactFlow>
        </FlowChromeOverrides>
      )}
    </Box>
  );
};