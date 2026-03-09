import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { useGraphRender } from "../../contexts/graph-render-context";

export function BiColorEdge({
  id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
}: EdgeProps) {
  
  // 🌟 Edge determines its own opacity!
  const { selectedPathsSet, connectedNodeIdsSet } = useGraphRender();
  
  const hasSelection = selectedPathsSet.size > 0;
  const isEdgeActive = connectedNodeIdsSet.has(source) || connectedNodeIdsSet.has(target) || hasSelection === false;
  const isDimmed = hasSelection && !isEdgeActive;

  const safeTargetX = sourceX === targetX ? targetX + 0.001 : targetX;
  const safeTargetY = sourceY === targetY ? targetY + 0.001 : targetY;

  const [path] = getSmoothStepPath({
    sourceX, sourceY, targetX: safeTargetX, targetY: safeTargetY,
    sourcePosition, targetPosition, borderRadius: 32, offset: 24,
  });

  const isFlowingDown = targetY > sourceY;
  const gradientId = !isFlowingDown ? "url(#edge-gradient-down)" : "url(#edge-gradient-up)";

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: gradientId,
        strokeWidth: 1.5,
        opacity: isDimmed ? 0.04 : 0.8,
        filter: isDimmed ? "grayscale(100%)" : "none",
        pointerEvents: isDimmed ? "none" : "auto",
        transition: "opacity 0.3s ease, filter 0.3s ease"
      }}
    />
  );
}