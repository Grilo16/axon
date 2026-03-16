import React from "react";
import { ResponsiveProvider } from "@shared/hooks/use-responsive-mode";

/**
 * Wraps children with the ResponsiveProvider so the entire app
 * can access the current responsive mode (mobile | tablet | desktop).
 * The old "bouncer" behavior is replaced by responsive layouts.
 */
export const MobileBouncer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ResponsiveProvider>{children}</ResponsiveProvider>;
};