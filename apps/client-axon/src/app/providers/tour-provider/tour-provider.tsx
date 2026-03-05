import "driver.js/dist/driver.css";
import React, { useCallback, useState } from "react";
import { driver, type DriveStep } from "driver.js";
import { TourContext } from "./tour-context";
import { DriverThemeOverrides } from "./tour-theme";

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    return localStorage.getItem("axon_tour_seen") === "true";
  });

  const markTourAsSeen = useCallback(() => {
    localStorage.setItem("axon_tour_seen", "true");
    setHasSeenTour(true);
  }, []);

  const startTour = useCallback((steps: DriveStep[]) => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      overlayOpacity: 0.65,
      steps: steps,
      doneBtnText: "Finish",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      onDestroyStarted: () => {
        if (!driverObj.hasNextStep() || window.confirm("Are you sure you want to skip the tour?")) {
          driverObj.destroy();
          markTourAsSeen();
        }
      },
    });

    driverObj.drive();
  }, [markTourAsSeen]);

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour, markTourAsSeen }}>
      <DriverThemeOverrides />
      {children}
    </TourContext.Provider>
  );
};