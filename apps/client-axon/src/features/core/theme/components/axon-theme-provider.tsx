import React from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global-styles";
import { useAxonTheme } from "../hooks/use-axon-theme";

interface AxonThemeProviderProps {
  children: React.ReactNode;
}

export const AxonThemeProvider = ({ children }: AxonThemeProviderProps) => {
  const { theme } = useAxonTheme();
  if (!theme) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      {children}
    </ThemeProvider>
  );
};
