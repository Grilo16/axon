import styled from "styled-components";

export const CanvasArea = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.bg.main};
  overflow: hidden;
`;

export const CanvasOverlayHud = styled.div<{ $position: "topLeft" | "bottomLeft" | "topRight" }>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  
  ${({ $position, theme }) => {
    switch ($position) {
      case "topLeft":
        return `top: ${theme.spacing.md}; left: ${theme.spacing.md};`;
      case "bottomLeft":
        return `bottom: ${theme.spacing.md}; left: ${theme.spacing.md};`;
      case "topRight":
        return `top: ${theme.spacing.md}; right: ${theme.spacing.md};`;
    }
  }}
`;