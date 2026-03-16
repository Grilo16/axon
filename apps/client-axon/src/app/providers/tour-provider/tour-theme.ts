import { createGlobalStyle } from "styled-components";

export const DriverThemeOverrides = createGlobalStyle`
  /* Override driver.js default variables for Axon's Theme */
  .driver-popover {
    background-color: ${({ theme }) => theme.colors.bg.surface} !important;
    color: ${({ theme }) => theme.colors.text.secondary} !important;
    border: 1px solid ${({ theme }) => theme.colors.border.subtle} !important;
    border-radius: ${({ theme }) => theme.radii.xl} !important; /* Match your Modals */
    box-shadow: ${({ theme }) => theme.shadows.lg} !important;
  }
  
  .driver-popover-title {
    font-size: ${({ theme }) => theme.typography.sizes.h2} !important;
    font-weight: ${({ theme }) => theme.typography.weights.bold} !important;
    color: ${({ theme }) => theme.colors.text.primary} !important;
    margin-bottom: ${({ theme }) => theme.spacing.sm} !important;
  }
  
  .driver-popover-description {
    font-size: ${({ theme }) => theme.typography.sizes.md} !important;
    color: ${({ theme }) => theme.colors.text.muted} !important;
    line-height: 1.5 !important;
  }

  .driver-popover-footer {
    margin-top: ${({ theme }) => theme.spacing.lg} !important;
  }

  /* Buttons */
  .driver-popover-btn-next,
  .driver-popover-btn-prev,
  .driver-popover-btn-close {
    background-color: ${({ theme }) => theme.colors.bg.surfaceActive} !important;
    color: ${({ theme }) => theme.colors.text.secondary} !important;
    border: 1px solid ${({ theme }) => theme.colors.border.default} !important;
    border-radius: ${({ theme }) => theme.radii.md} !important;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`} !important;
    font-size: ${({ theme }) => theme.typography.sizes.md} !important;
    text-shadow: none !important;
    transition: all 0.2s ease !important;
  }

  .driver-popover-btn-next {
    background-color: ${({ theme }) => theme.colors.palette.primary.main} !important;
    border-color: ${({ theme }) => theme.colors.palette.primary.main} !important;
    color: #ffffff !important;
  }

  .driver-popover-btn-next:hover {
    background-color: ${({ theme }) => theme.colors.palette.primary.hover} !important;
    box-shadow: ${({ theme }) => theme.shadows.glow} !important;
  }

  .driver-popover-btn-prev:hover,
  .driver-popover-btn-close:hover {
    background-color: ${({ theme }) => theme.colors.bg.surfaceHover} !important;
    color: ${({ theme }) => theme.colors.text.primary} !important;
  }

  .driver-popover-progress-text {
    color: ${({ theme }) => theme.colors.text.disabled} !important;
    font-size: ${({ theme }) => theme.typography.sizes.sm} !important;
  }

  /* The arrow connecting the popover to the element */
  .driver-popover-arrow {
    border-color: ${({ theme }) => theme.colors.bg.surface} !important;
  }

.driver-active-element .tour-add-btn {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important; 
    
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.palette.primary.main}, 
                0 0 15px ${({ theme }) => theme.colors.palette.primary.main} !important;
    border-radius: 4px;
    animation: tour-pulse 2s infinite;
  }

  @keyframes tour-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .driver-active-element.tour-symbol-row-first .symbol-actions {
    opacity: 1 !important;
  }

  .driver-active-element .tour-symbol-hide-btn {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.palette.primary.main}, 
                0 0 15px ${({ theme }) => theme.colors.palette.primary.main} !important;
    border-radius: 4px;
    animation: tour-pulse 2s infinite;
  }

.driver-active-element.react-flow__node {
    height: max-content !important;
    min-height: min-content !important;
    width: max-content !important; /* Optional: if you also want width to hug perfectly */
    overflow: visible !important;
  }

body.axon-tour-active .react-flow__pane,
  body.axon-tour-active .react-flow__nodes {
    overflow: visible !important;
  }
`;