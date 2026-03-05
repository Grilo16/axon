import { memo, useEffect } from "react";
import styled, { css } from "styled-components";
import { Position, type NodeProps, useStore, NodeResizeControl, useUpdateNodeInternals, Handle } from "@xyflow/react";

import type { AppFileNode } from "../../types";
import { FileNodeHeader } from "./file-node-header";
import { FileNodeActions } from "./file-node-actions";
import { FileNodeSymbols } from "./file-node-symbols"; // <-- Import extracted component
import { useNodeSession, useWorkspaceSession } from "@features/core/workspace";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { Flex, Text } from "@shared/ui";

// --- XYFlow Specific Styled Components ---
const NodeCardWrapper = styled.div<{ $selected?: boolean; $isSeed?: boolean; $isZoomedOut?: boolean; $isHovered?: boolean; }>`
  background: ${({ theme, $isSeed }) => ($isSeed ? "#1b1f24" : theme.colors.bg.surface)};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.palette.primary.main : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.lg};
  position: relative;
  width: 100%;
  min-width: 300px;
  height: ${({ $isZoomedOut }) => ($isZoomedOut ? "max-content" : "100%")};
  box-shadow: ${({ theme }) => theme.shadows.sm};
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

export const FileNode = memo(({ id, data, selected }: NodeProps<AppFileNode>) => {
  const zoom = useStore((s) => s.transform[2]);
  const isZoomedOut = zoom < 0.65;
  const updateNodeInternals = useUpdateNodeInternals();

  const { activeBundle, addRedaction, deleteRule } = useBundleSession();
  const rules = activeBundle?.options.rules || [];
  const { hoverRelationship } = useNodeSession(data.fileId);
  const { openFileInViewer } = useWorkspaceSession();
  
  const isHovered = hoverRelationship === "exact" || hoverRelationship === "parent-hovered";
  const symbols = data.symbols ?? [];

  useEffect(() => { updateNodeInternals(id); }, [isZoomedOut, updateNodeInternals, id]);

  const handleToggleRule = (e: React.MouseEvent, symId: number, actionType: "hideImplementation" | "removeEntirely") => {
    e.stopPropagation();
    const existingIndex = rules.findIndex(r =>
      'specificSymbol' in r.target &&
      r.target.specificSymbol.file_path === data.path &&
      r.target.specificSymbol.symbol_id === symId
    );

    if (existingIndex >= 0) {
      const existingRule = rules[existingIndex];
      if (existingRule.action === actionType) {
        deleteRule(existingIndex);
        return;
      } 
      deleteRule(existingIndex);
      addRedaction({ target: { specificSymbol: { file_path: data.path, symbol_id: symId } }, action: actionType });
      return;
    }

    addRedaction({ target: { specificSymbol: { file_path: data.path, symbol_id: symId } }, action: actionType });
  };

  return (
    <NodeCardWrapper 
      $selected={!!selected} 
      $isZoomedOut={isZoomedOut} 
      $isHovered={isHovered} 
      onDoubleClick={(e) => { e.stopPropagation(); openFileInViewer(data.fileId); }}
    >
      {!isZoomedOut && (
        <NodeResizeControl minWidth={300} minHeight={110} style={{ border: 'none', background: 'transparent' }}>
          <div style={{ position: 'absolute', right: 4, bottom: 4, width: 10, height: 10, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%)' }} />
        </NodeResizeControl>
      )}

      <StyledHandle id="top-in" type="target" position={Position.Top} style={{ top: -4, background: '#3b82f6' }} />

      <FileNodeHeader fileId={data.fileId} label={data.label} isZoomedOut={isZoomedOut} />
      
      {!isZoomedOut && (
        // ✨ FIX 3: Added minWidth: 0 to the flex container so the Text truncation can calculate boundaries!
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
          rules={rules} 
          onToggleRule={handleToggleRule} 
        />
      )}

      <StyledHandle id="bottom-out" type="source" position={Position.Bottom} style={{ bottom: -4, background: '#16a34a' }} />
    </NodeCardWrapper>
  );
});

FileNode.displayName = "FileNode";