export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  success: string;
}

export interface BackgroundParams {
  main: string;    // The deepest background
  surface: string; // Cards/Panels
  overlay: string; // Modals/Dropdowns
  input: string;   // Input fields
}

export interface TextParams {
  primary: string; // High contrast
  secondary: string; // Medium contrast
  muted: string; // Low contrast/disabled
}

// The Main Theme Interface
export interface AxonTheme {
  name: string;
  colors: {
    bg: BackgroundParams;
    text: TextParams;
    palette: ColorPalette;
    border: string;
  };
  spacing: (factor: number) => string; 
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    round: string;
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    }
  }
}