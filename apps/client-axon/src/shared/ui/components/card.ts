import styled, { css } from 'styled-components';
import { boxEngine, type BoxProps } from '../primitives';

export interface CardProps extends BoxProps { // Extend BoxProps
  $interactive?: boolean;
  $elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = styled.div<CardProps>`
  ${boxEngine} /* Inject Box Engine (Padding, Margin, Background, etc.) */
  
  background: ${({ theme, $bg }) => ($bg ? 'transparent' : theme.colors.bg.surface)};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${({ $elevation, theme }) => {
    switch ($elevation) {
      case 'sm': return css`box-shadow: ${theme.shadows.sm};`;
      case 'md': return css`box-shadow: ${theme.shadows.md};`;
      case 'lg': return css`box-shadow: ${theme.shadows.lg};`;
      default: return '';
    }
  }}

  ${({ $interactive, theme }) => $interactive && css`
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
      border-color: ${theme.colors.palette.primary.main};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
  `}
`;