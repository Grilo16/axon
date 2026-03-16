import type { AppTheme, ColorProp, SpacingProp, RadiiProp, ThemeSpacingToken, ThemeRadiiToken } from './theme';

export const resolveColor = (path: ColorProp | undefined, theme: AppTheme) => {
  // ... (keep existing color resolver)
  if (!path) return undefined;
  if (path === 'inherit') return 'inherit';
  const keys = path.split('.');
  let current: Record<string, unknown> = theme.colors as Record<string, unknown>;
  for (const key of keys) {
    if (current[key] === undefined) return path;
    current = current[key] as Record<string, unknown>;
  }
  return current as unknown as string;
};

/**
 * Smart Spacing Resolver:
 * Resolves single tokens ("md"), multi-value shorthand ("md lg 0"), or raw numbers (16)
 */
export const resolveSpacing = (val: SpacingProp | undefined, theme: AppTheme): string | undefined => {
  if (val === undefined) return undefined;
  if (typeof val === 'number') return `${val}px`;

  // If it's an exact token match (e.g., "md")
  if (theme.spacing[val as ThemeSpacingToken]) {
    return theme.spacing[val as ThemeSpacingToken];
  }

  // If it's a multiple-value string (e.g., "md lg" or "sm 0 md 0")
  if (typeof val === 'string' && val.includes(' ')) {
    return val
      .split(' ')
      .map((part) => theme.spacing[part as ThemeSpacingToken] || part)
      .join(' ');
  }

  // Fallback to raw string (e.g., "100%", "2rem", "auto")
  return val;
};

/**
 * Radii Resolver
 */
export const resolveRadii = (val: RadiiProp | undefined, theme: AppTheme): string | undefined => {
  if (val === undefined) return undefined;
  if (typeof val === 'number') return `${val}px`;
  if (theme.radii[val as ThemeRadiiToken]) {
    return theme.radii[val as ThemeRadiiToken];
  }
  return val;
};