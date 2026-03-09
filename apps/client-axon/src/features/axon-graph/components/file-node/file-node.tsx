import { memo, useEffect } from "react";
import styled, { css } from "styled-components";
import { Position, type NodeProps, useStore, NodeResizeControl, useUpdateNodeInternals, Handle } from "@xyflow/react";

import type { AppFileNode } from "../../types";
import { FileNodeHeader } from "./file-node-header";
import { FileNodeActions } from "./file-node-actions";
import { FileNodeSymbols } from "./file-node-symbols";

import { Flex, Text } from "@shared/ui";
import { useIsNodeHovered, useIsNodeSelected, useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";

// --- XYFlow Specific Styled Components ---
const NodeCardWrapper = styled.div<{ $selected?: boolean; $isSeed?: boolean; $isZoomedOut?: boolean; $isHovered?: boolean; }>`
  background: ${({ theme, $isSeed }) => ($isSeed ? "#1b1f24" : theme.colors.bg.surface)};
  /* Hijack standard border/shadow logic based purely on our Redux injected props */
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.palette.primary.main : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.lg};
  position: relative;
  width: 100%;
  min-width: 300px;
  height: ${({ $isZoomedOut }) => ($isZoomedOut ? "max-content" : "100%")};
  box-shadow: ${({ theme, $selected }) => ($selected ? `0 0 0 1px ${theme.colors.palette.primary.main}, 0 0 12px rgba(59, 130, 246, 0.2)` : theme.shadows.sm)};
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  ${({ $isHovered, theme }) => $isHovered && css`
    border-color: ${theme.colors.palette.primary.light};
    box-shadow: 0 0 0 1px ${theme.colors.palette.primary.main}, 0 0 24px rgba(59, 130, 246, 0.4);
    z-index: 1000;
  `}
`;

const StyledHandle = styled(Handle)`
  width: 8px;
  height: 8px;
  border: 1px solid #111;
`;

export const FileNode = memo(({ id, data }: NodeProps<AppFileNode>) => {
  const zoom = useStore((s) => s.transform[2]);
  const isZoomedOut = zoom < 0.65;
  const updateNodeInternals = useUpdateNodeInternals();

  // 1. Redux UI State (O(1) highly optimized!)
    const isHovered = useIsNodeHovered(data.path)
    const isSelected = useIsNodeSelected(data.path)
  const {openFileViewer} = useWorkspaceDispatchers()
  
  const symbols = data.symbols ?? [];

  useEffect(() => { 
    updateNodeInternals(id); 
  }, [isZoomedOut, updateNodeInternals, id]);


  return (
    <NodeCardWrapper 
      $selected={isSelected} 
      $isZoomedOut={isZoomedOut} 
      $isHovered={isHovered} 
      onDoubleClick={(e) => { 
        e.stopPropagation(); 
        openFileViewer(data.path); 
      }}
    >
      {!isZoomedOut && (
        <NodeResizeControl minWidth={300} minHeight={110} style={{ border: 'none', background: 'transparent' }}>
          <div style={{ position: 'absolute', right: 4, bottom: 4, width: 10, height: 10, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%)' }} />
        </NodeResizeControl>
      )}

      <StyledHandle id="top-in" type="target" position={Position.Top} style={{ top: -4, background: '#3b82f6' }} />

      <FileNodeHeader fileId={data.fileId} label={data.label} isZoomedOut={isZoomedOut} />
      
      {!isZoomedOut && (
        <Flex $p="sm md" style={{ borderBottom: '1px solid #2b2b2b', minWidth: 0 }}>
          <Text $size="xs" $color="muted" $truncate title={data.path} style={{ flex: 1 }}>
            {data.path}
          </Text>
        </Flex>
      )}

      <FileNodeActions imports={data.imports} usedBy={data.usedBy} />

      {!isZoomedOut && (
        <FileNodeSymbols 
          symbols={symbols} 
          filePath={data.path} 
        />
      )}

      <StyledHandle id="bottom-out" type="source" position={Position.Bottom} style={{ bottom: -4, background: '#16a34a' }} />
    </NodeCardWrapper>
  );
});

FileNode.displayName = "FileNode";