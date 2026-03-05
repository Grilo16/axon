import styled, { css } from "styled-components";
import { textEllipsis } from "../theme/mixins";
import { resolveColor } from "../theme/utils";
import type { AppTheme, ColorProp } from "../theme/theme";
import { boxEngine, type BoxProps } from "./layout";

type TextSize = keyof AppTheme["typography"]["sizes"];
type TextWeight = keyof AppTheme["typography"]["weights"];
type TextAlign = "left" | "center" | "right" | "justify";

export interface TypographyProps extends BoxProps {
  $color?: ColorProp;
  $size?: TextSize;
  $weight?: TextWeight;
  $align?: TextAlign;
  $truncate?: boolean;
  $uppercase?: boolean;
  $monospace?: boolean;
  $letterSpacing?: string;
}
// The core engine for all text rendering
const typographyEngine = css<TypographyProps>`
  ${boxEngine}
  margin: 0;
  
  /* Use the resolver with a fallback to the primary text color */
  color: ${({ $color, theme }) => resolveColor($color, theme) || theme.colors.text.primary};
  
  font-size: ${({ $size = "md", theme }) => theme.typography.sizes[$size]};
  font-weight: ${({ $weight = "regular", theme }) => theme.typography.weights[$weight]};
  text-align: ${({ $align = "left" }) => $align};
  
  ${({ $uppercase }) => $uppercase && css`text-transform: uppercase;`}
  ${({ $monospace }) => $monospace && css`font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;`}
  ${({ $letterSpacing }) => $letterSpacing && css`letter-spacing: ${$letterSpacing};`}
  ${({ $truncate }) => $truncate && textEllipsis}
`;

export const Text = styled.span<TypographyProps>`
  ${typographyEngine}
`;

export interface HeadingProps extends TypographyProps {
  $level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading = styled.h1.attrs<HeadingProps>(({ $level = "h1" }) => ({
  as: $level,
}))<HeadingProps>`
  ${typographyEngine}
  
  /* Semantic heading defaults */
  ${({ $level, theme }) => {
    switch ($level) {
      case "h1":
        return css`font-size: ${theme.typography.sizes.h1}; font-weight: ${theme.typography.weights.bold};`;
      case "h2":
        return css`font-size: ${theme.typography.sizes.h2}; font-weight: ${theme.typography.weights.semibold};`;
      default:
        return "";
    }
  }}
`;