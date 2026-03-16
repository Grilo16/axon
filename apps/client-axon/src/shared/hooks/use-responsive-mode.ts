import React, { createContext, useContext } from "react";
import { useMediaQuery } from "./use-media-query";
import { theme } from "@shared/ui/theme/theme";

export type ResponsiveMode = "mobile" | "tablet" | "desktop";

const ResponsiveContext = createContext<ResponsiveMode>("desktop");

export const useResponsiveMode = () => useContext(ResponsiveContext);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isTablet = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);

  const mode: ResponsiveMode = isDesktop ? "desktop" : isTablet ? "tablet" : "mobile";

  return React.createElement(ResponsiveContext.Provider, { value: mode }, children);
};
