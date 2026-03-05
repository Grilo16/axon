import styled, { css } from "styled-components";

export interface ResizeHandleProps {
  $orientation: "vertical" | "horizontal";
}

export const ResizeHandle = styled.div<ResizeHandleProps>`
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
  z-index: ${({ theme }) => theme.zIndices.dropdown};

  ${({ $orientation }) =>
    $orientation === "vertical"
      ? css`
          width: 4px;
          height: 100%;
          cursor: col-resize;
        `
      : css`
          height: 4px;
          width: 100%;
          cursor: row-resize;
        `}

  /* * Hover state for discovery.
   * [data-resize-handle-state="drag"] ensures the highlight stays active 
   * while the user's mouse is down, even if they move off the exact pixel.
   */
  &:hover,
  &[data-resize-handle-state="drag"] {
    background-color: ${({ theme }) => theme.colors.palette.primary.main};
  }
`;