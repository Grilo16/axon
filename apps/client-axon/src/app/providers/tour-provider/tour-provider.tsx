import "driver.js/dist/driver.css";
import React, { useCallback, useState } from "react";
import { driver } from "driver.js";
import { TourContext } from "./tour-context";
import { DriverThemeOverrides } from "./tour-theme";
import { getTourSteps } from "@shared/tour"; // Make sure this path is correct!
import { useAppDispatch } from "@app/store";
import { useActiveWorkspaceId, useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useBundleActions } from "@features/core/bundles/hooks/use-bundle-actions";

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    return localStorage.getItem("axon_tour_seen") === "true";
  });
  
  const dispatch = useAppDispatch();
  const workspaceId = useActiveWorkspaceId();
  const { createBundle, deleteBundle } = useBundleActions();
  const { resetExplorer } = useWorkspaceDispatchers();

  const markTourAsSeen = useCallback(() => {
    localStorage.setItem("axon_tour_seen", "true");
    setHasSeenTour(true);
  }, []);
  
  const startTour = useCallback(async () => {
    if (!workspaceId) return;

    try {
      // 1. Fire the explorer nuke
      resetExplorer();

      // 2. Await the creation and extract the ID directly (NO .unwrap() here!)
      const result = await createBundle.handle({
        workspaceId, 
        name: "Interactive Tour 🚀", 
        options: { hideBarrelExports: false, rules: [], targetFiles: [] }
      });

      const newBundleId = result?.id;
      if (!newBundleId) throw new Error("Failed to create tour bundle");

      // 3. Configure the Driver
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

            // 4. Destroy the bundle (NO .unwrap() here either!)
            deleteBundle.handle({ id: `${newBundleId}`, workspaceId }).catch(console.error);
          }
        },
      });

      // 5. The React Buffer (Wait for Redux/UI to sync)
      setTimeout(() => {
        const steps = getTourSteps(driverObj, dispatch);
        driverObj.setConfig({ ...driverObj.getConfig(), steps });
        driverObj.drive();
      }, 100);

    } catch (error) {
      console.error("[Tour] Failed to start:", error);
    }
  }, [workspaceId, resetExplorer, createBundle, deleteBundle, markTourAsSeen, dispatch]);

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour, markTourAsSeen }}>
      <DriverThemeOverrides />
      {children}
    </TourContext.Provider>
  );
};
// import "driver.js/dist/driver.css";
// import React, { useCallback, useState } from "react";
// import { driver, type DriveStep } from "driver.js";
// import { TourContext } from "./tour-context";
// import { DriverThemeOverrides } from "./tour-theme";

// export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
//     return localStorage.getItem("axon_tour_seen") === "true";
//   });

//   const markTourAsSeen = useCallback(() => {
//     localStorage.setItem("axon_tour_seen", "true");
//     setHasSeenTour(true);
//   }, []);

//   const startTour = useCallback((steps: DriveStep[]) => {
//     const driverObj = driver({
//       stagePadding: 2,
//       showProgress: true,
//       animate: true,
//       smoothScroll: true,
//       overlayOpacity: 0.75,
//       steps: steps,
//       doneBtnText: "Finish",
//       nextBtnText: "Next →",
//       prevBtnText: "← Back",
//       onDestroyStarted: () => {
//         if (!driverObj.hasNextStep() || window.confirm("Are you sure you want to skip the tour?")) {
//           driverObj.destroy();
//           markTourAsSeen();
//         }
//       },
//     });

//     driverObj.drive();
//   }, [markTourAsSeen]);

//   return (
//     <TourContext.Provider value={{ startTour, hasSeenTour, markTourAsSeen }}>
//       <DriverThemeOverrides />
//       {children}
//     </TourContext.Provider>
//   );
// };