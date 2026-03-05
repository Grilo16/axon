import { GlobalStyle } from "@shared/ui/theme/global-styles";
import { theme } from "@shared/ui/theme/theme";
import { ThemeProvider } from "styled-components";

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AxonThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};