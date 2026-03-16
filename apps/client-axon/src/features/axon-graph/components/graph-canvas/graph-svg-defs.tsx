import { memo } from "react";
import { useTheme } from "styled-components";

export const GraphSvgDefs = memo(() => {
  const theme = useTheme();

  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <linearGradient id="edge-gradient-down" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.colors.palette.primary.accent} />
          <stop offset="100%" stopColor={theme.colors.palette.success.main} />
        </linearGradient>
        <linearGradient id="edge-gradient-up" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={theme.colors.palette.primary.accent} />
          <stop offset="100%" stopColor={theme.colors.palette.success.main} />
        </linearGradient>
      </defs>
    </svg>
  );
});

GraphSvgDefs.displayName = "GraphSvgDefs";
