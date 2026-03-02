import React from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global-styles";
import { useAxonTheme } from "../hooks/use-axon-theme";
import { darkTheme } from "../themes";

interface AxonThemeProviderProps {
  children: React.ReactNode;
}
export const AxonThemeProvider = ({ children }: AxonThemeProviderProps) => {
  const { theme } = useAxonTheme();
  
  // Provide a hardcoded default theme if Redux isn't ready yet
  const activeTheme = theme || darkTheme; 

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyles theme={activeTheme} />
      {children}
    </ThemeProvider>
  );
};