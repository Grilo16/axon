import React, { createContext, useContext, useState, useMemo } from "react";

export type MobileTab = "explorer" | "graph" | "code" | "bundler";

export interface MobileTabContextValue {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
}

export const MobileTabContext = createContext<MobileTabContextValue | null>(null);

export const useMobileTab = () => useContext(MobileTabContext);

export const MobileTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MobileTab>("graph");
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return React.createElement(MobileTabContext.Provider, { value }, children);
};
