import styled from "styled-components";
import { Flex } from "../primitives/layout"; 
import { customScrollbar } from "../theme/mixins";

export const PanelContainer = styled(Flex).attrs({
  $direction: 'column',
  $bg: 'bg.surface'
})<{ $width?: string }>`
  height: 100%;
  width: ${({ $width = "300px" }) => $width};
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

/**
 * Inherits all Flex/Box superpowers ($bg, $p, $gap).
 * Defaults to a column that fills its parent.
 * Strictly enforces min-height: 0 so nested scroll areas don't blow out the layout.
 */
export const PanelSection = styled(Flex).attrs(props => ({
  $direction: props.$direction || 'column',
  $fill: true, // Automatically applies width: 100% and height: 100% from our Box engine!
}))`
  min-height: 0; 
  overflow: hidden;
  ${customScrollbar}
`;

export const PanelHeader = styled(Flex).attrs({
  $align: 'center',
  $justify: 'space-between',
  $p: 'md lg',
  $bg: 'bg.surface'
})`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  flex-shrink: 0; /* Prevents the header from getting squished if the panel gets too small */
`;

export const PanelScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  ${customScrollbar}
`;