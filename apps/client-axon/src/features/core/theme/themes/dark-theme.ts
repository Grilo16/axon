import type { AxonTheme } from "../types";
import { baseTheme } from "./base-theme";

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
