import React from "react";
import styled from "styled-components";

const StyledIconWrapper = styled.button<{ $active?: boolean; $isDanger?: boolean }>`
  /* 1. Structural Layout */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px; /* Slightly bumped from 42px for better touch/click targets */
  height: 44px;
  padding: 0;
  border: none;
  flex-shrink: 0;
  
  /* 2. Shape Morphing (Circle to Rounded Square) */
  border-radius: ${({ theme, $active }) => ($active ? theme.radii.xl : theme.radii.round)};
  /* The cubic-bezier gives it that snappy "Apple" feel */
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
  user-select: none;

  /* 3. Typography & Alignment Fixes */
  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  letter-spacing: 0.5px;
  line-height: 1; /* Critical for centering text vertically */

  /* 4. Base Colors */
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.palette.primary.main : theme.colors.bg.surfaceHover};
  color: ${({ theme, $active, $isDanger }) =>
    $active 
      ? theme.colors.text.primary 
      : $isDanger 
        ? theme.colors.palette.danger.main 
        : theme.colors.text.secondary};

  /* Ensure SVG icons sit perfectly inside */
  & > svg {
    display: block;
  }

  /* 5. Modern Interaction States */
  &:hover {
    border-radius: ${({ theme }) => theme.radii.xl};
    
    background-color: ${({ theme, $active, $isDanger }) =>
      $active
        ? theme.colors.palette.primary.hover
        : $isDanger
          ? theme.colors.palette.danger.alpha
          : theme.colors.bg.surfaceActive};
          
    color: ${({ theme, $isDanger, $active }) => 
      $active
        ? theme.colors.text.primary
        : $isDanger 
          ? theme.colors.palette.danger.alpha
          : theme.colors.text.primary};
          
    /* Add depth only on hover/active */
    box-shadow: ${({ theme, $active }) => 
      $active ? theme.shadows.glow : theme.shadows.sm};
  }
`;

const ActivePill = styled.div`
  position: absolute;
  /* Push to the left edge of the sidebar. Adjust this based on your Sidebar padding */
  left: -14px; 
  width: 4px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 4px;
  
  /* Snappy entry animation for the pill */
  animation: popIn 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards;

  @keyframes popIn {
    from { opacity: 0; transform: scaleY(0.2); }
    to { opacity: 1; transform: scaleY(1); }
  }
`;

interface SidebarIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  $active?: boolean;
  $isDanger?: boolean;
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, $active, $isDanger, title, ...props }) => {
  return (
    <StyledIconWrapper title={title} $active={$active} $isDanger={$isDanger} {...props}>
      {$active && <ActivePill />}
      {icon}
    </StyledIconWrapper>
  );
};