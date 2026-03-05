import React, { createContext, useCallback, useRef, useEffect } from "react";
import { driver, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { createGlobalStyle } from "styled-components";
import { AXON_TOUR_STEPS } from "../config/tour-steps";

const DriverDarkTheme = createGlobalStyle`
  /* Override driver.js default variables for Axon's Dark Theme */
  .driver-popover {
    background-color: #1e1e1e !important;
    color: #f3f4f6 !important;
    border: 1px solid #333 !important;
    border-radius: 8px !important;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5) !important;
  }
  
  .driver-popover-title {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #fff !important;
    margin-bottom: 8px !important;
  }
  
  .driver-popover-description {
    font-size: 13px !important;
    color: #9ca3af !important;
    line-height: 1.5 !important;
  }

  .driver-popover-footer {
    margin-top: 16px !important;
  }

  /* Buttons */
  .driver-popover-btn-next,
  .driver-popover-btn-prev,
  .driver-popover-btn-close {
    background-color: #2b2b2b !important;
    color: #e5e7eb !important;
    border: 1px solid #444 !important;
    border-radius: 6px !important;
    padding: 6px 12px !important;
    font-size: 12px !important;
    text-shadow: none !important;
    transition: all 0.2s ease !important;
  }

  .driver-popover-btn-next {
    background-color: #3b82f6 !important;
    border-color: #2563eb !important;
    color: white !important;
  }

  .driver-popover-btn-next:hover {
    background-color: #2563eb !important;
  }

  .driver-popover-btn-prev:hover,
  .driver-popover-btn-close:hover {
    background-color: #3b3b3b !important;
  }

  .driver-popover-progress-text {
    color: #6b7280 !important;
    font-size: 12px !important;
  }

  /* The arrow connecting the popover to the element */
  .driver-popover-arrow {
    border-color: #1e1e1e !important;
  }
`;

interface TourContextValue {
  startTour: () => void;
  hasSeenTour: boolean;
}

export const TourContext = createContext<TourContextValue | null>(null);

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    // Initialize the driver instance
    const config: Config = {
      showProgress: true,
      animate: true,
      smoothScroll: true,
      overlayOpacity: 0.65,
      steps: AXON_TOUR_STEPS,
      doneBtnText: "Finish",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      onDestroyStarted: () => {
        if (!driverObj.current?.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
          driverObj.current?.destroy();
          localStorage.setItem("axon_tour_seen", "true");
        }
      },
    };

    driverObj.current = driver(config);
  }, []);

  const startTour = useCallback(() => {
    if (driverObj.current) {
      driverObj.current.drive();
    }
  }, []);

  const hasSeenTour = localStorage.getItem("axon_tour_seen") === "true";

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour }}>
      <DriverDarkTheme />
      {children}
    </TourContext.Provider>
  );
};