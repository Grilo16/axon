import React, { useCallback } from "react";
import styled from "styled-components";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { AppEdge, AppNode } from "../../types";
import { FileNode } from "../file-node/file-node";
import { GraphToolbar } from "./graph-toolbar";
import { BiColorEdge } from "./bi-color-edge";
import { ZoomSizeResetter } from "../../utils/zoom-size-resetter";
import { useGraphModel } from "../../hooks/use-graph-model";
import { useGraphInteractions } from "../../hooks/use-graph-interactions";

import { Box, Flex, Text } from "@shared/ui";
import { useHoveredPath, useSelectedPaths } from "@features/core/workspace/hooks/use-workspace-slice";
import { useWorkspaceShortcuts } from "@features/core/workspace/use-workspace-shortcuts";
import { GraphAutoFitter } from "../../utils/graph-auto-fitter";
import { GraphRenderProvider } from "../../contexts/graph-render-context"; // 🌟 Import Context
import { Loader2, Waypoints } from "lucide-react";

const nodeTypes = { fileNode: FileNode };
const edgeTypes = { biColorEdge: BiColorEdge };

const FlowChromeOverrides = styled(Box)`
  /* We keep the structural overrides, but remove all the manual class toggles */
  .react-flow__node {
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
  }
  .react-flow__controls { background: #222; border: 1px solid #444; border-radius: 8px; overflow: hidden; }
  .react-flow__controls-button { background: #222; border-bottom: 1px solid #333; color: #ccc; }
  .react-flow__controls-button:hover { background: #2a2a2a; }
  .react-flow__minimap { background: #111; border: 1px solid #2f2f2f; border-radius: 8px; overflow: hidden; }
`;

export const GraphCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, isWorking, isError, isEmpty } = useGraphModel();
  const { hoverNode, toggleSelection, clearSelection, removeNodesFromBundle, setSelection } = useGraphInteractions();

  const selectedPaths = useSelectedPaths();
  const hoveredPath = useHoveredPath();

  useWorkspaceShortcuts();

  const handleNodesDelete = useCallback((deletedNodes: AppNode[]) => {
    removeNodesFromBundle(deletedNodes.map((n) => n.id));
  }, [removeNodesFromBundle]);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: AppNode[] }) => {
    const newSelectionIds = selectedNodes.map((n) => n.data.path);
    if (newSelectionIds.length > 0) {
      setSelection(newSelectionIds);
    }
  }, [setSelection]);

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
          <Text $color="palette.danger.light" $size="sm">Layout error</Text>
        </Box>
      )}


      {isEmpty && !isWorking && !isError && (
        <Flex $fill $align="center" $justify="center" $direction="column" $gap="lg">
          <Flex 
            $align="center" 
            $justify="center" 
            $bg="bg.surface" 
            style={{ 
              width: 96, 
              height: 96, 
              borderRadius: '50%', 
              border: '2px dashed #444',
              boxShadow: '0 0 40px rgba(0,0,0,0.3) inset' 
            }}
          >
            <Waypoints size={40} color="#60a5fa" style={{ opacity: 0.8 }} />
          </Flex>
          
          <Flex $direction="column" $align="center" $gap="xs">
            <Text $size="xl" $weight="bold" $color="primary">
              Your Canvas is Empty
            </Text>
            <Text $size="md" $color="secondary" style={{ maxWidth: 400, textAlign: 'center', lineHeight: 1.5 }}>
              Select files or folders from the Explorer on the left to add them to your bundle and start visualizing your architecture.
            </Text>
          </Flex>
        </Flex>
      )}

      {!isEmpty && (
        <FlowChromeOverrides $fill>
          <GraphRenderProvider nodes={nodes} edges={edges} selectedPaths={selectedPaths} hoveredPath={hoveredPath}>
            <ReactFlow<AppNode, AppEdge>
              nodes={nodes} // 🌟 RAW NODES!
              edges={edges} // 🌟 RAW EDGES!
              nodeTypes={nodeTypes} 
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange} 
              onEdgesChange={onEdgesChange}
              onSelectionChange={handleSelectionChange}
              onNodeMouseEnter={(_, node) => hoverNode(node.data.fileId)}
              onNodeMouseLeave={() => hoverNode(null)}
              onNodeClick={(e, node) => {
                const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
                toggleSelection(node.data.path, isMulti);
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
              <GraphAutoFitter isEmpty={isEmpty} isWorking={isWorking}/>
              <GraphToolbar />
              <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#222" />
              <Controls />
              <MiniMap nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.8)" />
            </ReactFlow>
          </GraphRenderProvider>
        </FlowChromeOverrides>
      )}
    </Box>
  );
};