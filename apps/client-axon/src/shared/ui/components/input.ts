import styled, { css } from 'styled-components';
import { boxEngine, type BoxProps } from '../primitives';

export interface InputProps extends BoxProps {
  $size?: "sm" | "md" | "lg";
}

const inputSizeStyles = {
  sm: css`padding: 4px 8px; font-size: 12px;`,
  md: css`padding: 8px 12px; font-size: 14px;`,
  lg: css`padding: 12px 16px; font-size: 16px;`,
};

export const Input = styled.input<InputProps>`
  ${boxEngine}
  background: ${({ theme }) => theme.colors.bg.overlay};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  width: 100%;
  transition: border-color 0.2s;

  ${({ $size = "md" }) => inputSizeStyles[$size]}

  &:focus {
    border-color: ${({ theme }) => theme.colors.palette.primary.main};
  }
`;

export const Select = styled.select<InputProps>`
  ${boxEngine}
  ${({ $size = "md" }) => inputSizeStyles[$size]}
  background: ${({ theme }) => theme.colors.bg.overlay};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;