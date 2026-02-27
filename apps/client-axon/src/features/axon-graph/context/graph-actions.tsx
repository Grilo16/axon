import React, { createContext, useContext } from "react";
import type { FocusNodeActions } from "../types";

const GraphActionsContext = createContext<FocusNodeActions | null>(null);

export function useGraphActions() {
  const context = useContext(GraphActionsContext);
  if (!context) {
    throw new Error("useGraphActions must be used within a GraphActionsProvider");
  }
  return context;
}

export const GraphActionsProvider: React.FC<{
  actions: FocusNodeActions;
  children: React.ReactNode;
}> = ({ actions, children }) => {
  return (
    <GraphActionsContext.Provider value={actions}>
      {children}
    </GraphActionsContext.Provider>
  );
};