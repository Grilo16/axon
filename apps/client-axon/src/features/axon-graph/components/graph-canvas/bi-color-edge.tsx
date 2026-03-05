import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export function BiColorEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  

  const safeTargetX = sourceX === targetX ? targetX + 0.001 : targetX;
  const safeTargetY = sourceY === targetY ? targetY + 0.001 : targetY;

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX: safeTargetX,
    targetY: safeTargetY,
    sourcePosition,
    targetPosition,
    borderRadius: 32,
    offset: 24,
  });

  const isFlowingDown = targetY > sourceY;
  const gradientId = !isFlowingDown ? "url(#edge-gradient-down)" : "url(#edge-gradient-up)";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: gradientId,
          strokeWidth: 1.5,
          opacity: 0.8,
        }}
      />
    </>
  );
}