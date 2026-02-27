
const SPACING_UNIT = 4; 

export const baseTheme = {
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
