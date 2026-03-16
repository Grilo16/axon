import { memo, useCallback, useRef } from "react";
import styled, { css } from "styled-components";
import { Position, type NodeProps, Handle } from "@xyflow/react";

import type { AppFileNode } from "../../types";
import { FileNodeHeader } from "./file-node-header";
import { FileNodeActions } from "./file-node-actions";
import { FileNodeSymbols } from "./file-node-symbols";

import { Flex, Text } from "@shared/ui";
import { useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useGraphRender } from "@features/axon-graph/contexts/graph-render-context";
import { useZoom } from "@features/axon-graph/contexts/zoom-context";
import { useResponsiveMode } from "@shared/hooks/use-responsive-mode";
import { useMobileTab } from "@shared/hooks/use-mobile-tab";

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

  @media (max-width: 640px) {
    min-width: 200px;
  }
  max-height: 18rem;
  box-shadow: ${({ theme, $selected }) => ($selected ? `0 0 0 1px ${theme.colors.palette.primary.main}, 0 0 12px ${theme.colors.palette.primary.alpha}` : theme.shadows.sm)};
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
    box-shadow: 0 0 0 2px ${theme.colors.palette.primary.main}, 0 0 24px ${theme.colors.palette.primary.alpha};
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

const PathRow = styled(Flex)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  min-width: 0;
`;

const StyledHandle = styled(Handle)`
  width: 8px;
  height: 8px;
  border: 1px solid ${({ theme }) => theme.colors.bg.deep};

  &.handle-target { background: ${({ theme }) => theme.colors.palette.primary.accent}; }
  &.handle-source { background: ${({ theme }) => theme.colors.palette.success.main}; }
`;
const LONG_PRESS_MS = 500;

export const FileNode = memo(({ id, data }: NodeProps<AppFileNode>) => {
  const { openFileViewer } = useWorkspaceDispatchers();
  const { isZoomedOut: zoomIsOut } = useZoom();
  const isTourActive = document.body.classList.contains("axon-tour-active");
  const isTourNode = data.path === "axon-tutorial/src/app.tsx";
  const isZoomedOut = (isTourNode && isTourActive) ? false : zoomIsOut;
  const mode = useResponsiveMode();
  const isMobile = mode === "mobile";
  const mobileTab = useMobileTab();

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

  // Long-press on mobile opens the file viewer (replaces double-click)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    if (!isMobile) return;
    longPressTimer.current = setTimeout(() => {
      openFileViewer(data.path);
      mobileTab?.setActiveTab("code");
    }, LONG_PRESS_MS);
  }, [isMobile, openFileViewer, data.path, mobileTab]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <NodeCardWrapper
      id={data.path === "axon-tutorial/src/app.tsx" ? "tour-node-app" : undefined}
      $selected={isSelected}
      $visualState={visualState}
      onDoubleClick={(e) => { e.stopPropagation(); openFileViewer(data.path); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
  
      <StyledHandle id="top-in" type="target" position={Position.Top} style={{ top: -4 }} className="handle-target" />

      <FileNodeHeader fileId={data.fileId} label={data.label} isZoomedOut={isZoomedOut} />
      
      {!isZoomedOut && (
        <PathRow $p="sm md">
          <Text $size="xs" $color="muted" $truncate title={data.path} style={{ flex: 1 }}>
            {data.path}
          </Text>
        </PathRow>
      )}

      <FileNodeActions imports={data.imports} usedBy={data.usedBy} filePath={data.path} />

      <SymbolsContainer className="tour-symbols-container" $isZoomedOut={isZoomedOut}>
        <FileNodeSymbols symbols={data.symbols} filePath={data.path} />
      </SymbolsContainer>

      <StyledHandle id="bottom-out" type="source" position={Position.Bottom} style={{ bottom: -4 }} className="handle-source" />
    </NodeCardWrapper>
  );
});

FileNode.displayName = "FileNode";
