import React from "react";
import styled, { css, keyframes } from "styled-components";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const StyledIconWrapper = styled.button<{ $active?: boolean; $isDanger?: boolean, $aura?: boolean}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
  }
  
  border-radius: ${({ theme, $active }) => ($active ? theme.radii.xl : theme.radii.round)};
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
  user-select: none;

  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  letter-spacing: 0.5px;
  line-height: 1; /* Critical for centering text vertically */

  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.palette.primary.main : theme.colors.bg.surfaceHover};
  color: ${({ theme, $active, $isDanger }) =>
    $active 
      ? theme.colors.text.primary 
      : $isDanger 
        ? theme.colors.palette.danger.main 
        : theme.colors.text.secondary};

  & > svg {
    display: block;
  }

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
          
    box-shadow: ${({ theme, $active }) => 
      $active ? theme.shadows.glow : theme.shadows.sm};
  }
    ${({ $aura, theme, $active, $isDanger }) => $aura && css`
    z-index: 1;

    /* Turn off the standard drop-shadow on hover so it doesn't fight the glowing aura */
    &:hover {
      box-shadow: none;
    }

    /* THE SPINNING NEON TRACK */
    &::after {
      content: '';
      position: absolute;
      top: -3px; right: -3px; bottom: -3px; left: -3px; 
      
      /* Start as a perfect circle */
      border-radius: 50%;
      transition: border-radius 0.25s cubic-bezier(0.25, 1, 0.5, 1);
      
      /* 🌟 THE COMET FIX: We MUST include 'transparent' to hollow out the ring! */
      background: conic-gradient(
        from 0deg,
        transparent 0%,
        transparent 65%,
        rgba(34, 197, 94, 0.3) 85%,
        rgba(34, 197, 94, 1) 100%
      );
      
      filter: blur(2px);
      animation: ${spin} 2s linear infinite;
      z-index: -2;
    }

    /* THE CENTER PUNCH-OUT MASK */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      
      /* Start as a perfect circle */
      border-radius: 50%;
      
      /* Transition the shape AND the color at the same speed as the button */
      transition: border-radius 0.25s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1);
      
      /* Match the button's resting state background */
      background-color: ${$active ? theme.colors.palette.primary.main : theme.colors.bg.surfaceHover}; 
      z-index: -1;
    }

    /* 🌟 THE HOVER SHAPE-SHIFT MAGIC */
    &:hover::after {
      /* The outer track needs to be exactly 3px rounder than the button to perfectly parallel the corners */
      /* Note: If your app breaks here, it means theme.radii.xl is a number instead of a string. If so, replace this with '16px' or '18px' */
      border-radius: calc(${theme.radii.xl} + 3px); 
    }

    &:hover::before {
      /* 1. Match the hover shape */
      border-radius: ${theme.radii.xl};
      
      /* 2. MATCH THE HOVER COLOR! This is critical so the button doesn't look dead on hover */
      background-color: ${
        $active 
          ? theme.colors.palette.primary.hover 
          : $isDanger 
            ? theme.colors.palette.danger.alpha 
            : theme.colors.bg.surfaceActive
      };
    }
  `}
`;

const ActivePill = styled.div`
  position: absolute;
  left: -14px;
  width: 4px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 4px;
  animation: popIn 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards;

  @keyframes popIn {
    from { opacity: 0; transform: scaleY(0.2); }
    to { opacity: 1; transform: scaleY(1); }
  }

  @media (max-width: 640px) {
    left: auto;
    bottom: -8px;
    width: 20px;
    height: 4px;
  }
`;

interface SidebarIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  $active?: boolean;
  $isDanger?: boolean;
  $aura?: boolean
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, $active, $isDanger, title,  $aura, ...props }) => {
  return (
    <StyledIconWrapper title={title} $active={$active} $isDanger={$isDanger} $aura={$aura} {...props}>
      {$active && <ActivePill />}
      {icon}
    </StyledIconWrapper>
  );
};