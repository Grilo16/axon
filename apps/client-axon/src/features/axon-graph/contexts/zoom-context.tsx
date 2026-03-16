import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore, useUpdateNodeInternals } from "@xyflow/react";

const ZOOM_THRESHOLD = 0.65;

interface ZoomContextValue {
  isZoomedOut: boolean;
}

const ZoomContext = createContext<ZoomContextValue | null>(null);

export const useZoom = () => {
  const ctx = useContext(ZoomContext);
  if (!ctx) throw new Error("useZoom must be used within ZoomProvider");
  return ctx;
};

export const ZoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const zoom = useStore((s) => s.transform[2]);
  const nodeIds = useStore((s) => Array.from(s.nodeLookup.keys()));
  const updateNodeInternals = useUpdateNodeInternals();

  const [isZoomedOut, setIsZoomedOut] = useState(zoom < ZOOM_THRESHOLD);
  const prevZoomedOut = useRef(isZoomedOut);

  useEffect(() => {
    const next = zoom < ZOOM_THRESHOLD;
    if (next !== prevZoomedOut.current) {
      prevZoomedOut.current = next;
      setIsZoomedOut(next);

      // Batch update all node internals in one call when crossing the threshold
      if (nodeIds.length > 0) {
        updateNodeInternals(nodeIds);
      }
    }
  }, [zoom, nodeIds, updateNodeInternals]);

  return (
    <ZoomContext.Provider value={{ isZoomedOut }}>
      {children}
    </ZoomContext.Provider>
  );
};
