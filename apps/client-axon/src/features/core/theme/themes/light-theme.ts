import type { AxonTheme } from "../types";
import { baseTheme } from "./base-theme";

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