import React from "react";
import { useTheme } from "styled-components";
import { Waypoints } from "lucide-react";
import { Box, Flex, Text, Spinner } from "@shared/ui";

export const GraphLoadingOverlay: React.FC = () => (
  <Flex $fill $align="center" $justify="center" $direction="column" $gap="md" style={{ position: 'absolute', zIndex: 20, background: 'rgba(0,0,0,0.5)' }}>
    <Spinner size={32} />
    <Text $size="sm" $weight="bold" $color="palette.primary.light" $uppercase $letterSpacing="0.08em">
      Processing Graph...
    </Text>
  </Flex>
);

export const GraphErrorBanner: React.FC = () => {
  const theme = useTheme();
  return (
    <Box $bg="palette.danger.dark" $p="sm md" $radius="md" style={{ position: 'absolute', top: 12, left: 12, zIndex: 30, border: `1px solid ${theme.colors.palette.danger.dark}` }}>
      <Text $color="palette.danger.light" $size="sm">Layout error</Text>
    </Box>
  );
};

export const GraphEmptyState: React.FC = () => {
  const theme = useTheme();
  return (
    <Flex $fill $align="center" $justify="center" $direction="column" $gap="lg">
      <Flex
        $align="center"
        $justify="center"
        $bg="bg.surface"
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: `2px dashed ${theme.colors.border.hover}`,
          boxShadow: '0 0 40px rgba(0,0,0,0.3) inset'
        }}
      >
        <Waypoints size={40} color={theme.colors.palette.primary.light} style={{ opacity: 0.8 }} />
      </Flex>

      <Flex $direction="column" $align="center" $gap="xs">
        <Text $size="xl" $weight="bold" $color="primary">
          Your Canvas is Empty
        </Text>
        <Text $size="md" $color="secondary" style={{ maxWidth: 400, textAlign: 'center', lineHeight: 1.5 }}>
          Select files or folders from the Explorer on the left to add them to your bundle and start visualizing your architecture.
        </Text>
      </Flex>
    </Flex>
  );
};
