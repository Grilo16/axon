import styled, { css } from 'styled-components';
import { resolveColor, resolveSpacing, resolveRadii } from '../theme/utils';
import type { ColorProp, SpacingProp, RadiiProp } from '../theme/theme';

export interface BoxProps {
  $p?: SpacingProp;       // Autocomplete for padding!
  $m?: SpacingProp;       // Autocomplete for margin!
  $bg?: ColorProp;        // Autocomplete for background!
  $radius?: RadiiProp;    // Autocomplete for border-radius!
  $fill?: boolean; 
}

export const boxEngine = css<BoxProps>`
  ${({ $p, theme }) => $p !== undefined && css`padding: ${resolveSpacing($p, theme)};`}
  ${({ $m, theme }) => $m !== undefined && css`margin: ${resolveSpacing($m, theme)};`}
  ${({ $bg, theme }) => $bg && css`background-color: ${resolveColor($bg, theme)};`}
  ${({ $radius, theme }) => $radius && css`border-radius: ${resolveRadii($radius, theme)};`}
  
  ${({ $fill }) => $fill && css`
    width: 100%;
    height: 100%;
  `}
`;

export const Box = styled.div<BoxProps>`
  ${boxEngine}
`;

export interface FlexProps extends BoxProps {
  $direction?: 'row' | 'column';
  $align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  $justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  $gap?: SpacingProp;     // Autocomplete for flex gap!
  $wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  $flex?: number | string;
}

export const Flex = styled.div<FlexProps>`
  ${boxEngine}
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
  align-items: ${({ $align = 'stretch' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
  flex-wrap: ${({ $wrap = 'nowrap' }) => $wrap};
  
  ${({ $gap, theme }) => $gap !== undefined && css`gap: ${resolveSpacing($gap, theme)};`}
  ${({ $flex }) => $flex !== undefined && css`flex: ${$flex};`}
`;

export interface GridProps extends BoxProps {
  $columns?: string;
  $gap?: SpacingProp;     // Autocomplete for grid gap!
}

export const Grid = styled.div<GridProps>`
  ${boxEngine}
  display: grid;
  grid-template-columns: ${({ $columns = '1fr' }) => $columns};
  ${({ $gap, theme }) => $gap !== undefined && css`gap: ${resolveSpacing($gap, theme)};`}
`;