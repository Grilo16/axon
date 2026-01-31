import type { AxonTheme } from '../types/themeTypes';

const SPACING_UNIT = 4; // 1 unit = 4px

const baseTheme = {
  spacing: (factor: number) => `${factor * SPACING_UNIT}px`,
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '12px',
    round: '50%',
  },
  typography: {
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
    sizes: {
      xs: '10px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '20px',
      xxl: '32px',
    }
  }
};

export const darkTheme: AxonTheme = {
  ...baseTheme,
  name: 'dark',
  colors: {
    bg: {
      main: '#1e1e1e',     // VS Code Editor BG
      surface: '#252526',  // Sidebar/Panel BG
      overlay: '#333333',  // Hover states / Modals
      input: '#3c3c3c',
    },
    text: {
      primary: '#e1e1e1',
      secondary: '#cccccc',
      muted: '#858585',
    },
    palette: {
      primary: '#007acc',  // VS Code Blue
      secondary: '#0e639c',
      accent: '#dcb67a',   // Yellow/Gold for folders
      danger: '#f14c4c',
      success: '#89d185',
    },
    border: '#454545',
  }
};

export const lightTheme: AxonTheme = {
  ...baseTheme,
  name: 'light',
  colors: {
    bg: {
      main: '#ffffff',
      surface: '#f3f3f3',
      overlay: '#e5e5e5',
      input: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      muted: '#999999',
    },
    palette: {
      primary: '#0078d4',
      secondary: '#106ebe',
      accent: '#b08800',
      danger: '#d13438',
      success: '#107c10',
    },
    border: '#e1e1e1',
  }
};