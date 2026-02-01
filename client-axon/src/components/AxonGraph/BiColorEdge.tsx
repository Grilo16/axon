import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { useTheme } from "styled-components";

/**
 * Bi-color edge: start color at the source, end color at the target.
 * Note: SVG ids must be "safe" (no spaces, slashes, etc.) or gradients can fail to resolve.
 */
export const BiColorEdge = memo((props: EdgeProps) => {
  const theme = useTheme();

  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    markerStart,
  } = props;

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const start = theme.colors.palette.primary;
  const end = theme.colors.palette.success;

  // Make the gradient id safe for SVG URL references.
  const safe = String(id).replace(/[^a-zA-Z0-9\-_:.]/g, "_");
  const gradId = `axon-grad-${safe}`;

  return (
    <>
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor={start} stopOpacity={1} />
          <stop offset="100%" stopColor={end} stopOpacity={1} />
        </linearGradient>
      </defs>

      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...(style ?? {}),
          stroke: `url(#${gradId})`,
        }}
      />
    </>
  );
});
