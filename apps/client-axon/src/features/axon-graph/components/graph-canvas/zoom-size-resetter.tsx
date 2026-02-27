import { useEffect, useRef } from "react";
import { useStore, useReactFlow } from "@xyflow/react";

export function ZoomSizeResetter() {
  const zoom = useStore((s) => s.transform[2]);
  const { setNodes } = useReactFlow();
  const isZoomedOut = zoom < 0.65;
  const prevZoomedOut = useRef(isZoomedOut);

  useEffect(() => {
    if (isZoomedOut && !prevZoomedOut.current) {
      setNodes((nds) =>
        nds.map((n) =>
          n.style?.width !== 300 || n.style?.height !== undefined
            ? { ...n, style: { ...n.style, width: 300, height: undefined } }
            : n,
        ),
      );
    }
    prevZoomedOut.current = isZoomedOut;
  }, [isZoomedOut, setNodes]);

  return null;
}