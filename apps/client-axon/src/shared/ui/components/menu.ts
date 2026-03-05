import styled from "styled-components";
import { textEllipsis } from "../theme/mixins";

export const PopoverMenu = styled.div<{ $width?: string }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: ${({ $width = "180px" }) => $width};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  
  background: ${({ theme }) => theme.colors.bg.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border.hover};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  box-shadow: ${({ theme }) => theme.shadows.md};
  max-height: 250px;
  overflow-y: auto;
`;

export const MenuItem = styled.button<{ $isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  
  color: ${({ theme, $isDestructive }) => 
    $isDestructive ? theme.colors.palette.danger.main : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme, $isDestructive }) => 
      $isDestructive ? theme.colors.palette.danger.alpha : theme.colors.bg.surfaceActive};
    color: ${({ theme, $isDestructive }) => 
      $isDestructive ? theme.colors.palette.danger.hover : theme.colors.text.primary};
  }

  /* Target the inner text for truncation */
  & > span {
    ${textEllipsis}
    flex: 1;
  }
`;