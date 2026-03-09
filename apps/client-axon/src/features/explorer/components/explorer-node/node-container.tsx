import styled from "styled-components";
import { Flex } from "@shared/ui";

export const NodeContainer = styled(Flex)<{
  $depth: number;
  $isFocused: boolean;
  $isSelected: boolean;
}>`
  padding: ${({ theme, $depth }) =>
    `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xs} ${$depth * 12 + 8}px`};
  cursor: pointer;
  user-select: none;

  border-left: 2px solid
    ${({ theme, $isFocused }) =>
      $isFocused ? theme.colors.border.focus : "transparent"};
  background: ${({ theme, $isFocused, $isSelected }) =>
    $isFocused
      ? theme.colors.palette.primary.alpha
      : $isSelected
        ? theme.colors.bg.surfaceActive
        : "transparent"};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    .node-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;
