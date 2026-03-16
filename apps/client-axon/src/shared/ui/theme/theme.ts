import 'styled-components';


export const theme = {
  colors: {
    bg: {
      main: '#121212',
      surface: '#1e1e1e',
      surfaceHover: '#252526',
      surfaceActive: '#2a2a2a',
      overlay: 'rgba(18, 18, 18, 0.85)',
      elevated: '#1a1a1a',
      deep: '#111111',
      badge: '#374151',
    },
    border: {
      subtle: '#2b2b2b',
      default: '#333333',
      hover: '#444444',
      focus: '#3b82f6',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
      muted: '#9ca3af',
      disabled: '#6b7280',
    },
    palette: {
      primary: {
        main: '#2563eb',
        hover: '#1d4ed8',
        light: '#60a5fa',
        accent: '#3b82f6',
        alpha: 'rgba(37, 99, 235, 0.12)',
      },
      danger: {
        main: '#ef4444',
        hover: '#f87171',
        dark: '#7f1d1d',
        alpha: 'rgba(248, 113, 113, 0.15)',
      },
      success: {
        main: '#16a34a',
        light: '#34d399',
        alpha: 'rgba(22, 163, 74, 0.12)',
      },
      warning: {
        main: '#facc15',
        dark: '#fbbf24',
      },
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    round: '50%',
  },
  typography: {
    sizes: {
      xs: '10px',
      sm: '11px',
      md: '12px',
      lg: '13px',
      xl: '14px',
      h1: '26px',
      h2: '18px',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },
  shadows: {
    sm: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    md: '0 8px 16px rgba(0, 0, 0, 0.5)',
    lg: '0 16px 50px rgba(0, 0, 0, 0.5)',
    glow: '0 0 8px rgba(37, 99, 235, 0.4)',
  },
  zIndices: {
    base: 1,
    dropdown: 40,
    overlay: 50,
    modal: 100,
    toast: 1000,
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export const media = {
  sm: `@media (min-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  xl: `@media (min-width: ${theme.breakpoints.xl})`,
} as const;

// Strongly type the styled-components theme
export type AppTheme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}

type Primitive = string | number | boolean | null | undefined;

export type DotPaths<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive
        ? K
        : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];

// 2. Export the specific type for your colors
// This automatically generates: "bg.main" | "bg.surface" | "palette.primary.main" | etc...
export type ThemeColorToken = DotPaths<AppTheme['colors']>;

// We use this trick to preserve IDE autocompletion for ThemeColorToken, 
// while still legally accepting raw strings like "#FFFFFF" or "transparent".
export type ColorProp = ThemeColorToken | (string & {});

// -- Spacing Tokens --
// Grabs "xs" | "sm" | "md" | "lg" | "xl" | "xxl"
export type ThemeSpacingToken = keyof AppTheme['spacing'];
export type SpacingProp = ThemeSpacingToken | (string & {}) | number;

// -- Radii Tokens --
// Grabs "sm" | "md" | "lg" | "xl" | "round"
export type ThemeRadiiToken = keyof AppTheme['radii'];
export type RadiiProp = ThemeRadiiToken | (string & {}) | number;