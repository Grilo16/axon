import { Loader2, AlertCircle } from 'lucide-react';
import { Flex, Text, Box } from '@shared/ui';
import { useTheme } from 'styled-components';

export const ExplorerLoader = () => {
  const theme = useTheme();
  return (
    <Flex $fill $align="center" $justify="center" $direction="column" $gap="md">
      <Loader2 size={24} className="animate-spin" color={theme.colors.palette.primary.main} />
      <Text $size="sm" $color="muted">Scanning workspace...</Text>
    </Flex>
  );
};

export const ExplorerError = ({ error }: { error: any }) => {
  const message = error?.message || "An unknown error occurred.";

  return (
    <Box $p="md" $m="md" $bg="palette.danger.alpha" $radius="md" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
      <Flex $align="center" $gap="sm" $m="0 0 sm 0">
        <AlertCircle size={14} color="#ef4444" />
        <Text $size="sm" $weight="bold" $color="palette.danger.light">Failed to load</Text>
      </Flex>
      <Text $size="xs" $color="palette.danger.light" style={{ wordBreak: 'break-word' }}>
        {message}
      </Text>
    </Box>
  );
};