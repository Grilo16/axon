import React from "react";
import styled, { useTheme } from "styled-components";
import { ChevronRight, Folder, FolderOpen, FileCode, Loader2, Plus, Check, Minus } from "lucide-react";
import { Flex, Text, Button } from "@shared/ui";

const StyledNodeRow = styled(Flex)<{ $depth: number; $isFocused: boolean; $isSelected: boolean }>`
  padding: ${({ theme, $depth }) => `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xs} ${$depth * 12 + 8}px`};
  cursor: pointer;
  user-select: none;
  
  border-left: 2px solid ${({ theme, $isFocused }) => $isFocused ? theme.colors.border.focus : 'transparent'};
  background: ${({ theme, $isFocused, $isSelected }) =>
    $isFocused ? theme.colors.palette.primary.alpha :
    $isSelected ? theme.colors.bg.surfaceActive : 'transparent'};
  
  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    .graph-toggle-btn { opacity: 1; pointer-events: auto; } 
  }
`;

const NodeActionBtn = styled(Button)`
  opacity: 0;
  pointer-events: none;
  padding: 4px;
  transition: opacity 0.2s ease;
`;

interface NodeRowProps {
  name: string;
  depth: number;
  isFolder: boolean;
  isOpen: boolean;
  loading: boolean;
  isFocused: boolean;
  isSelected: boolean;
  inGraph: boolean;
  hasFilesInGraph: boolean;
  isFetching: boolean;
  cascade: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleGraph: (e: React.MouseEvent) => void;
  onToggleFolder: (e: React.MouseEvent) => void;
}

export const NodeRow: React.FC<NodeRowProps> = ({
  name, depth, isFolder, isOpen, loading, isFocused, isSelected,
  inGraph, hasFilesInGraph, isFetching, cascade,
  onClick, onDoubleClick, onMouseEnter, onMouseLeave,
  onToggleGraph, onToggleFolder
}) => {
  const theme = useTheme();

  return (
    <StyledNodeRow
      $depth={depth}
      $isSelected={isSelected}
      $isFocused={isFocused}
      $align="center"
      $gap="xs"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Caret */}
      {cascade && (
        <Flex $align="center" $justify="center" onClick={onToggleFolder} style={{ width: 16, height: 16 }}>
          {loading ? (
            <Loader2 size={12} className="animate-spin" color={theme.colors.palette.primary.main} />
          ) : isFolder ? (
            <ChevronRight
              size={14}
              color={theme.colors.text.muted}
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
            />
          ) : null}
        </Flex>
      )}

      {/* Icon */}
      <Flex $align="center" $justify="center" style={{ width: 16, height: 16 }}>
        {isFolder ? (
          isOpen ? <FolderOpen size={14} color={theme.colors.palette.primary.light} /> : <Folder size={14} color={theme.colors.text.muted} />
        ) : (
          <FileCode size={14} color={inGraph ? theme.colors.palette.success.main : theme.colors.text.disabled} />
        )}
      </Flex>

      {/* Label */}
      <Text 
        $size="md" 
        $color={inGraph || hasFilesInGraph ? "primary" : "secondary"} 
        $weight={inGraph || hasFilesInGraph ? "semibold" : "regular"} 
        $truncate 
        title={name}
        style={{ flex: 1 }}
      >
        {name}
      </Text>

      {/* Quick Actions */}
      {isFolder ? (
        <NodeActionBtn
          className="graph-toggle-btn"
          $variant="icon"
          onClick={onToggleGraph}
          disabled={isFetching}
          title={hasFilesInGraph ? "Sync folder with Graph" : "Add all files to Graph"}
        >
          {isFetching ? <Loader2 size={14} className="animate-spin" color={theme.colors.text.muted} /> : 
           hasFilesInGraph ? <Minus size={14} color={theme.colors.palette.success.main} /> : 
           <Plus size={14} color={theme.colors.text.muted} />}
        </NodeActionBtn>
      ) : (
        <NodeActionBtn
          className="graph-toggle-btn"
          $variant="icon"
          onClick={onToggleGraph}
          title={inGraph ? "Remove from Graph" : "Add to Graph"}
        >
          {inGraph ? <Check size={14} color={theme.colors.palette.success.main} /> : <Plus size={14} color={theme.colors.text.muted} />}
        </NodeActionBtn>
      )}
    </StyledNodeRow>
  );
};