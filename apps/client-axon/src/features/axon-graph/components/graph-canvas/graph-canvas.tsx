import React, { useCallback } from "react";
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

const nodeTypes = { fileNode: FileNode };
const edgeTypes = { biColorEdge: BiColorEdge };

const FlowChromeOverrides = styled(Box)`
  .react-flow__node {
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease, filter 0.3s ease;
  }
  .react-flow__node.dragging, .react-flow__node.selected.dragging {
    transition: none !important;
  }
  .react-flow__controls { background: #222; border: 1px solid #444; border-radius: 8px; overflow: hidden; }
  .react-flow__controls-button { background: #222; border-bottom: 1px solid #333; color: #ccc; }
  .react-flow__controls-button:hover { background: #2a2a2a; }
  .react-flow__minimap { background: #111; border: 1px solid #2f2f2f; border-radius: 8px; overflow: hidden; }
`;

// 🌟 No more props needed! FSD purity achieved.
export const GraphCanvas: React.FC = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, isWorking, isError, errorMessage, isEmpty 
  } = useGraphModel();
  
  const { 
    hoverNode, toggleSelection, clearSelection, removeNodesFromBundle 
  } = useGraphInteractions();

  const handleNodesDelete = useCallback((deletedNodes: AppNode[]) => {
    removeNodesFromBundle(deletedNodes.map((n) => n.id));
  }, [removeNodesFromBundle]);

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
            nodes={nodes} 
            edges={edges} 
            nodeTypes={nodeTypes} 
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange}
            
            onNodeMouseEnter={(_, node) => hoverNode(node.data.fileId)}
            onNodeMouseLeave={() => hoverNode(null)}
            onNodeClick={(_, node) => toggleSelection(node.data.fileId)}
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