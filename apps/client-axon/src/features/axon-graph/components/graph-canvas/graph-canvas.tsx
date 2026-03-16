import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { AppEdge, AppNode } from "../../types";
import { FileNode } from "../file-node/file-node";
import { GraphToolbar } from "./graph-toolbar";
import { BiColorEdge } from "./bi-color-edge";
import { GraphSvgDefs } from "./graph-svg-defs";
import { GraphLoadingOverlay, GraphErrorBanner, GraphEmptyState } from "./graph-canvas-overlays";
import { useGraphModel } from "../../hooks/use-graph-model";
import { useGraphInteractions } from "../../hooks/use-graph-interactions";

import { Box } from "@shared/ui";
import { useHoveredPath, useSelectedPaths } from "@core/workspace/hooks/use-workspace-slice";
import { useWorkspaceShortcuts } from "@core/workspace/use-workspace-shortcuts";
import { useResponsiveMode } from "@shared/hooks/use-responsive-mode";
import { GraphAutoFitter } from "../../utils/graph-auto-fitter";
import { GraphRenderProvider } from "../../contexts/graph-render-context";
import { ZoomProvider } from "../../contexts/zoom-context";

const nodeTypes = { fileNode: FileNode };
const edgeTypes = { biColorEdge: BiColorEdge };

const FlowChromeOverrides = styled(Box)`
  .react-flow__node {
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
    max-height: min-content;
  }
  .react-flow__controls {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    border: 1px solid ${({ theme }) => theme.colors.border.hover};
    border-radius: ${({ theme }) => theme.radii.lg};
    overflow: hidden;
  }
  .react-flow__controls-button {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  .react-flow__controls-button:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceActive};
  }
  .react-flow__minimap {
    background: ${({ theme }) => theme.colors.bg.deep};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.radii.lg};
    overflow: hidden;
  }
`;

export const GraphCanvas: React.FC = () => {
  const theme = useTheme();
  const { nodes, edges, onNodesChange, onEdgesChange, isWorking, isError, isEmpty } = useGraphModel();
  const { hoverNode, toggleSelection, clearSelection, removeNodesFromBundle, setSelection } = useGraphInteractions();

  const selectedPaths = useSelectedPaths();
  const hoveredPath = useHoveredPath();
  const mode = useResponsiveMode();
  const isMobile = mode === "mobile";

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
      <GraphSvgDefs />

      {isWorking && <GraphLoadingOverlay />}
      {isError && <GraphErrorBanner />}
      {isEmpty && !isWorking && !isError && <GraphEmptyState />}

      {!isEmpty && (
        <FlowChromeOverrides $fill>
          <ReactFlowProvider>
            <GraphRenderProvider nodes={nodes} edges={edges} selectedPaths={selectedPaths} hoveredPath={hoveredPath}>
              <ZoomProvider>
                <ReactFlow<AppNode, AppEdge>
                  nodes={nodes}
                  edges={edges}
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
                  <GraphAutoFitter isEmpty={isEmpty} isWorking={isWorking}/>
                  <GraphToolbar />
                  <Background variant={BackgroundVariant.Dots} gap={24} size={2} color={theme.colors.bg.surfaceHover} />
                  {!isMobile && <Controls />}
                  {!isMobile && <MiniMap nodeColor={theme.colors.palette.primary.accent} maskColor="rgba(0, 0, 0, 0.8)" />}
                </ReactFlow>
              </ZoomProvider>
            </GraphRenderProvider>
          </ReactFlowProvider>
        </FlowChromeOverrides>
      )}
    </Box>
  );
};
