import styled, { css } from 'styled-components';
import { flexCenter } from '../theme/mixins';
import type { BoxProps } from '../primitives';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon';

export interface ButtonProps extends BoxProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: ButtonVariant;
  $isLoading?: boolean;
  $isActive?: boolean; // For toggle states
}

export const Button = styled.button<ButtonProps>`
  ${flexCenter}
  gap: ${({ theme }) => theme.spacing.sm};
  border: none;
  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  /* Base Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Variants */
  ${({ $variant = 'primary', $isActive, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${theme.colors.palette.primary.main};
          color: ${theme.colors.text.primary};
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          border-radius: ${theme.radii.sm};
          font-size: ${theme.typography.sizes.md};

          &:hover:not(:disabled) {
            background: ${theme.colors.palette.primary.hover};
            box-shadow: ${theme.shadows.glow};
          }
        `;
      case 'ghost':
        return css`
          background: ${$isActive ? theme.colors.bg.surfaceActive : 'transparent'};
          color: ${$isActive ? theme.colors.text.primary : theme.colors.text.muted};
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          border-radius: ${theme.radii.sm};
          font-size: ${theme.typography.sizes.xl};

          &:hover:not(:disabled) {
            color: ${theme.colors.text.primary};
            background: ${theme.colors.bg.surfaceHover};
          }
        `;
      case 'danger':
        return css`
          background: ${theme.colors.palette.danger.alpha};
          color: ${theme.colors.palette.danger.main};
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          border-radius: ${theme.radii.sm};

          &:hover:not(:disabled) {
            background: ${theme.colors.palette.danger.dark};
            color: ${theme.colors.text.primary};
          }
        `;
      case 'icon':
        return css`
          background: transparent;
          color: ${$isActive ? theme.colors.palette.primary.light : theme.colors.text.muted};
          padding: ${theme.spacing.xs};
          border-radius: ${theme.radii.sm};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.border.default};
            color: ${theme.colors.text.primary};
          }
        `;
    }
  }}

  /* Loading Override */
  ${({ $isLoading, theme }) => $isLoading && css`
    background: ${theme.colors.bg.surfaceActive} !important;
    cursor: wait;
  `}
`;