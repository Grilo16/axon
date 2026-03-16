import { createContext, useContext } from "react";

export type MobileTab = "explorer" | "graph" | "code" | "bundler";

export interface MobileTabContextValue {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
}

export const MobileTabContext = createContext<MobileTabContextValue | null>(null);

export const useMobileTab = () => useContext(MobileTabContext);
