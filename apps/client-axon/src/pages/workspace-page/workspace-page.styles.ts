import styled from "styled-components";

export const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: ${({ theme }) => theme.colors.bg.main};
  overflow: hidden;
`;

export const LeftPanelContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.bg.surface};
`;

export const ExplorerSection = styled.div`
  flex: 1;
  overflow: hidden;
  min-height: 0; /* Critical for Flexbox nested scrolling */
`;

export const BundlerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  
  height: 100%; 
  
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.bg.surface};
`;
export const CanvasSection = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const VerticalResizeHandle = styled.div`
  width: 4px;
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
  cursor: col-resize;
  z-index: 10;

  &:hover,
  &[data-resize-handle-state="drag"] {
    background-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

export const HorizontalResizeHandle = styled.div`
  height: 4px;
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
  cursor: row-resize;
  z-index: 10;

  &:hover,
  &[data-resize-handle-state="drag"] {
    background-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;