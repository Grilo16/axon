import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

export const GraphAutoFitter = ({ isWorking, isEmpty }: { isWorking: boolean; isEmpty: boolean }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!isWorking && !isEmpty) {
      const timeout = setTimeout(() => {
        window.requestAnimationFrame(() => {
          fitView({ padding: 0.2, duration: 800 });
        });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isWorking, isEmpty, fitView]);

  return null;
};