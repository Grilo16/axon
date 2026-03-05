import { Toaster } from 'sonner';
import { useTheme } from 'styled-components';

export const ToastProvider = () => {
  const theme = useTheme();

  return (
    <Toaster
      position="bottom-right"
      gap={theme.spacing.sm as unknown as number}
      toastOptions={{
        style: {
          background: theme.colors.bg.surfaceHover,
          color: theme.colors.text.primary,
          border: `1px solid ${theme.colors.border.subtle}`,
          borderRadius: theme.radii.md,
          boxShadow: theme.shadows.lg,
          fontFamily: 'inherit',
          fontSize: theme.typography.sizes.md,
        },
        className: 'axon-toast', 
      }}
    />
  );
};