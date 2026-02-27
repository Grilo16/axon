import styled, { css } from "styled-components";
import { Handle } from "@xyflow/react";

export const NodeCard = styled.div<{
  $selected?: boolean;
  $isSeed?: boolean;
  $isZoomedOut?: boolean;
  $isHovered?: boolean;
}>`
  background: ${({ $isSeed }) => ($isSeed ? "#1b1f24" : "#1e1e1e")};
  border: 1px solid ${({ $selected }) => ($selected ? "#3b82f6" : "#333")};
  border-radius: 8px;
  position: relative;
  width: 100%;
  min-width: 300px;
  height: ${({ $isZoomedOut }) => ($isZoomedOut ? "max-content" : "100%")};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: box-shadow 0.2s ease, border-color 0.2s ease; // Smooth animation

  /* THE GLOW EFFECT */
  ${({ $isHovered }) =>
    $isHovered &&
    css`
      border-color: #60a5fa;
      box-shadow: 0 0 0 1px #3b82f6, 0 0 24px rgba(59, 130, 246, 0.4);
      z-index: 1000;
    `}
`;
export const ResizeHandle = styled.div`
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
  background: linear-gradient(
    135deg,
    transparent 50%,
    rgba(255, 255, 255, 0.3) 50%
  );
  border-radius: 2px;
`;

export const NodeHeader = styled.div<{ $isZoomedOut?: boolean }>`
  background: #252526;
  padding: 8px 12px;
  border-bottom: 1px solid #333;
  border-radius: 7px 7px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  ${({ $isZoomedOut }) =>
    $isZoomedOut &&
    css`
      flex: 1;
      border-radius: 7px;
      border-bottom: none;
      padding: 16px 12px;
    `}
`;

export const NodeTitle = styled.span<{ $isZoomedOut?: boolean }>`
  font-size: ${({ $isZoomedOut }) => ($isZoomedOut ? "26px" : "12px")};
  font-weight: 700;
  color: #e5e5e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TopTargetHandle = styled(Handle)`
  width: 8px;
  height: 8px;
  top: -4px;
  border: 1px solid #111;
  background: #3b82f6;
`;
export const BottomSourceHandle = styled(Handle)`
  width: 8px;
  height: 8px;
  bottom: -4px;
  border: 1px solid #111;
  background: #16a34a;
`;
export const NodeHeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;
export const NodeHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;
export const IconGhostButton = styled.button`
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover {
    color: #e5e7eb;
  }
`;
export const NodePath = styled.div`
  padding: 6px 10px;
  border-bottom: 1px solid #2b2b2b;
  font-size: 10px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* Action Grid & Dropdowns */
export const NodeActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #2b2b2b;
`;
export const ActionGroup = styled.div<{
  $active?: boolean;
  $tone?: "green" | "blue";
}>`
  display: flex;
  position: relative;
  height: 28px;
  border-radius: 6px;
  font-size: 11px;
  color: #d1d5db;
  border: 1px solid #374151;
  background: #1f2937;
  ${({ $active, $tone }) =>
    $active &&
    $tone === "green" &&
    css`
      border-color: #16a34a;
      background: rgba(22, 163, 74, 0.12);
    `}
  ${({ $active, $tone }) =>
    $active &&
    $tone === "blue" &&
    css`
      border-color: #2563eb;
      background: rgba(37, 99, 235, 0.12);
    `}
`;
export const ActionMainButton = styled.button`
  flex: 1;
  border: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
export const ActionChevron = styled.button`
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;
export const ActionPopover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #252526;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 4px 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  max-height: 200px;
  overflow-y: auto;
`;

/* NEW: Instant Action Row */
export const ActionRow = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  font-size: 11px;
  color: #ccc;
  cursor: pointer;
  border: none;
  background: transparent;
  text-align: left;
  &:hover {
    background: #333;
    color: #fff;
  }
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SymbolList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
`;


export const SymbolKindBadge = styled.span<{ $kind: string }>`
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
`;


export const SymbolDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
`;






export const SymbolName = styled.span<{ $isRemoved?: boolean, $isHidden?: boolean }>`
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* ✨ Visual feedback when redacted! */
  text-decoration: ${({ $isRemoved }) => $isRemoved ? 'line-through' : 'none'};
  opacity: ${({ $isHidden, $isRemoved }) => ($isHidden || $isRemoved) ? 0.4 : 1};
  font-style: ${({ $isHidden }) => $isHidden ? 'italic' : 'normal'};
`;

export const SymbolActions = styled.div<{ $forceVisible?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  /* ✨ Force visibility if a rule is active */
  opacity: ${({ $forceVisible }) => $forceVisible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

export const SymbolItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    ${SymbolActions} {
      opacity: 1;
    }
  }
`;

export const ActionButton = styled.button<{ $isActive?: boolean, $variant?: 'hide' | 'remove' }>`
  background: ${({ $isActive }) => $isActive ? '#374151' : 'transparent'};
  border: none;
  
  /* ✨ Permanent colors when active */
  color: ${({ $isActive, $variant }) => {
    if (!$isActive) return '#9ca3af';
    return $variant === 'hide' ? '#facc15' : '#f87171';
  }};

  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #374151;
    color: ${({ $variant }) => $variant === 'hide' ? '#facc15' : '#f87171'};
  }
`;