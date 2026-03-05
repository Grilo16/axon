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
`;