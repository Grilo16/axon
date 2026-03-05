import { css } from 'styled-components';

export const textEllipsis = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export const absoluteInset = css`
  position: absolute;
  inset: 0;
`;

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const customScrollbar = css`
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.hover};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;