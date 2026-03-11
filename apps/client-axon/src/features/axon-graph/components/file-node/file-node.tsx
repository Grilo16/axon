import { memo, useEffect} from "react";
import styled, { css } from "styled-components";
import { Position, type NodeProps, useStore, useUpdateNodeInternals, Handle } from "@xyflow/react";

import type { AppFileNode } from "../../types";
import { FileNodeHeader } from "./file-node-header";
import { FileNodeActions } from "./file-node-actions";
import { FileNodeSymbols } from "./file-node-symbols";

import { Flex, Text } from "@shared/ui";
import { useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useGraphRender } from "@features/axon-graph/contexts/graph-render-context";

const NodeCardWrapper = styled.div<{ 
  $selected?: boolean; 
  $visualState: "normal" | "hovered" | "dimmed" | "semi-dimmed"; 
}>`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.palette.primary.main : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.lg};
  position: relative;
  width: 100%;
  min-width: 300px;
  height: auto;
  max-height: 18rem;
  box-shadow: ${({ theme, $selected }) => ($selected ? `0 0 0 1px ${theme.colors.palette.primary.main}, 0 0 12px rgba(59, 130, 246, 0.2)` : theme.shadows.sm)};
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease, filter 0.3s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  /* The magic internal states */
  ${({ $visualState }) => $visualState === "dimmed" && css`
    opacity: 0.15; filter: grayscale(100%);
  `}
  ${({ $visualState }) => $visualState === "semi-dimmed" && css`
    opacity: 0.55; filter: grayscale(40%);
  `}
  ${({ $visualState, theme }) => $visualState === "hovered" && css`
    opacity: 1 !important; filter: none !important; z-index: 1000;
    border-color: ${theme.colors.palette.primary.light};
    box-shadow: 0 0 0 2px ${theme.colors.palette.primary.main}, 0 0 24px rgba(59, 130, 246, 0.4);
  `}
`;

const SymbolsContainer = styled.div<{ $isZoomedOut: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  
  ${({ $isZoomedOut }) => $isZoomedOut && css`
    display: none;
  `}
`;

const StyledHandle = styled(Handle)`
  width: 8px;
  height: 8px;
  border: 1px solid #111;
`;
export const FileNode = memo(({ id, data }: NodeProps<AppFileNode>) => {
  const zoom = useStore((s) => s.transform[2]);
  const updateNodeInternals = useUpdateNodeInternals();
  const { openFileViewer } = useWorkspaceDispatchers();
  const isTourActive = document.body.classList.contains("axon-tour-active")
  const isTourNode = data.path === "axon-tutorial/src/app.tsx"; 
  // If the tour is active AND this is the tour node, NEVER hide the symbols!
  const isZoomedOut = (isTourNode && isTourActive) ? false : zoom < 0.65;
  // 🌟 O(1) Context Lookups!
  const { selectedPathsSet, connectedNodeIdsSet, hoveredPath } = useGraphRender();
  
  const isSelected = selectedPathsSet.has(data.path);
  const isHoverTarget = hoveredPath && (data.path === hoveredPath || data.path.startsWith(hoveredPath + '/'));
  const hasSelection = selectedPathsSet.size > 0;
  
  let visualState: "normal" | "hovered" | "dimmed" | "semi-dimmed" = "normal";
  if (isHoverTarget) visualState = "hovered";
  else if (hasSelection) {
    if (isSelected) visualState = "normal"; 
    else if (connectedNodeIdsSet.has(id)) visualState = "semi-dimmed";
    else visualState = "dimmed";
  }

  useEffect(() => { updateNodeInternals(id); }, [isZoomedOut, updateNodeInternals, id]);

  return (
    <NodeCardWrapper 
      id={data.path === "axon-tutorial/src/app.tsx" ? "tour-node-app" : undefined}
      $selected={isSelected} 
      $visualState={visualState} 
      onDoubleClick={(e) => { e.stopPropagation(); openFileViewer(data.path); }}
    >
  
      <StyledHandle id="top-in" type="target" position={Position.Top} style={{ top: -4, background: '#3b82f6' }} />

      <FileNodeHeader fileId={data.fileId} label={data.label} isZoomedOut={isZoomedOut} />
      
      {!isZoomedOut && (
        <Flex $p="sm md" style={{ borderBottom: '1px solid #2b2b2b', minWidth: 0 }}>
          <Text $size="xs" $color="muted" $truncate title={data.path} style={{ flex: 1 }}>
            {data.path}
          </Text>
        </Flex>
      )}

      <FileNodeActions imports={data.imports} usedBy={data.usedBy} filePath={data.path} />

      <SymbolsContainer className="tour-symbols-container" $isZoomedOut={isZoomedOut}>
        <FileNodeSymbols symbols={data.symbols} filePath={data.path} />
      </SymbolsContainer>

      <StyledHandle id="bottom-out" type="source" position={Position.Bottom} style={{ bottom: -4, background: '#16a34a' }} />
    </NodeCardWrapper>
  );
});

FileNode.displayName = "FileNode";


    {/* {!isZoomedOut && (
        <NodeResizeControl 
        onResizeStart={() => setIsResized(true)}
        minWidth={300} minHeight={110} style={{ border: 'none', background: 'transparent' }}>
          <div style={{ position: 'absolute', right: 4, bottom: 4, width: 10, height: 10, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%)' }} />
        </NodeResizeControl>
      )} */}
