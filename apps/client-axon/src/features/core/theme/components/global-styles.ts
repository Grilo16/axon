import { createGlobalStyle } from "styled-components";
import type { AxonTheme } from "../types";

export const GlobalStyles = createGlobalStyle<{ theme: AxonTheme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden; /* Important for a canvas-based app! */
  }

  body {
    background-color: ${({ theme }) => theme.colors.bg.main};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    -webkit-font-smoothing: antialiased;
  }

  /* Simple utility spinner */
  .spin {
    animation: axon-spin 1s linear infinite;
  }
  @keyframes axon-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.muted};
  }
`;
