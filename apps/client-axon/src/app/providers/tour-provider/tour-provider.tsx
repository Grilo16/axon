import "driver.js/dist/driver.css";
import React, { useCallback, useState } from "react";
import { driver } from "driver.js";
import { TourContext } from "./tour-context";
import { DriverThemeOverrides } from "./tour-theme";
import { getTourSteps, getMobileTourSteps } from "@shared/tour";
import { useAppDispatch } from "@core/store";
import { useActiveWorkspaceId, useWorkspaceDispatchers } from "@core/workspace/hooks/use-workspace-slice";
import { useBundleActions } from "@core/bundles/hooks/use-bundle-actions";
import { useResponsiveMode } from "@shared/hooks/use-responsive-mode";
import { useMobileTab } from "@shared/hooks/use-mobile-tab";

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    return localStorage.getItem("axon_tour_seen") === "true";
  });

  const dispatch = useAppDispatch();
  const workspaceId = useActiveWorkspaceId();
  const { createBundle, deleteBundle } = useBundleActions();
  const { resetExplorer } = useWorkspaceDispatchers();
  const mode = useResponsiveMode();
  const mobileTab = useMobileTab();

  const markTourAsSeen = useCallback(() => {
    localStorage.setItem("axon_tour_seen", "true");
    setHasSeenTour(true);
  }, []);

  const startTour = useCallback(async () => {
    if (!workspaceId) return;

    const isMobile = mode === "mobile";

    try {
      // 1. Reset the explorer tree and start fresh
      resetExplorer();

      // 2. Create a dedicated tour bundle
      const result = await createBundle.handle({
        workspaceId,
        name: "Interactive Tour 🚀",
        options: { hideBarrelExports: false, rules: [], targetFiles: [] }
      });

      const newBundleId = result?.id;
      if (!newBundleId) throw new Error("Failed to create tour bundle");

      // 3. On mobile, start on the graph tab (step 0 is a centered popover,
      //    step 1's onNextClick will switch to explorer when user clicks "Let's Go")
      if (isMobile && mobileTab) {
        mobileTab.setActiveTab("graph");
      }

      document.body.classList.add("axon-tour-active");

      // 4. Configure driver.js
      const driverObj = driver({
        stagePadding: 4,
        showProgress: true,
        animate: true,
        smoothScroll: true,
        overlayOpacity: 0.75,
        doneBtnText: "Finish",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || window.confirm("Are you sure you want to skip the tutorial?")) {
            driverObj.destroy();
            markTourAsSeen();
            document.body.classList.remove("axon-tour-active");

            // Reset to graph tab on mobile after tour ends
            if (isMobile && mobileTab) {
              mobileTab.setActiveTab("graph");
            }

            // Clean up the tour bundle
            deleteBundle.handle({ id: `${newBundleId}`, workspaceId }).catch(console.error);
          }
        },
      });

      // 5. Brief delay to let Redux/UI sync, then start
      setTimeout(() => {
        const steps = isMobile && mobileTab
          ? getMobileTourSteps(driverObj, dispatch, mobileTab.setActiveTab)
          : getTourSteps(driverObj, dispatch);
        driverObj.setConfig({ ...driverObj.getConfig(), steps });
        driverObj.drive();
      }, 100);

    } catch (error) {
      console.error("[Tour] Failed to start:", error);
    }
  }, [workspaceId, resetExplorer, createBundle, deleteBundle, markTourAsSeen, dispatch, mode, mobileTab]);

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour, markTourAsSeen }}>
      <DriverThemeOverrides />
      {children}
    </TourContext.Provider>
  );
};
