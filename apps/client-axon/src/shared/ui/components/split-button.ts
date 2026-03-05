import styled, { css } from "styled-components";
import { flexCenter } from "../theme/mixins";

export type ActionTone = "primary" | "success" | "neutral";

export interface SplitButtonGroupProps {
  $active?: boolean;
  $tone?: ActionTone;
}

export const SplitButtonGroup = styled.div<SplitButtonGroupProps>`
  display: flex;
  position: relative;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.bg.elevated};
  transition: all 0.2s ease;

  ${({ $active, $tone, theme }) => {
    if (!$active) return "";
    
    switch ($tone) {
      case "success":
        return css`
          border-color: ${theme.colors.palette.success.main};
          background: ${theme.colors.palette.success.alpha};
          color: ${theme.colors.palette.success.light};
        `;
      case "primary":
        return css`
          border-color: ${theme.colors.palette.primary.main};
          background: ${theme.colors.palette.primary.alpha};
          color: ${theme.colors.palette.primary.light};
        `;
      default:
        return css`
          border-color: ${theme.colors.border.focus};
          background: ${theme.colors.bg.surfaceHover};
          color: ${theme.colors.text.primary};
        `;
    }
  }}
`;

export const SplitButtonMain = styled.button`
  ${flexCenter}
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs};
  border: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0 ${({ theme }) => theme.spacing.sm};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const SplitButtonChevron = styled.button`
  ${flexCenter}
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0 ${({ theme }) => theme.spacing.sm};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;