import { createContext, useContext } from "react";

export interface TourContextValue {
  startTour: () => void;
  hasSeenTour: boolean;
  markTourAsSeen: () => void;
}

export const TourContext = createContext<TourContextValue | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};