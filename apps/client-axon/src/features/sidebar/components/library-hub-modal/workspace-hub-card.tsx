import { Play } from "lucide-react";
import { Flex, Box, Text, Heading, Card } from "@shared/ui";
import type { WorkspaceRecord } from "@shared/types/axon-core/workspace-api";

interface WorkspaceHubCardProps {
  workspace: WorkspaceRecord;
  isActive: boolean;
  bundleCount: number;
  totalRules: number;
  onClick: () => void;
}

export const WorkspaceHubCard = ({ 
  workspace, 
  isActive, 
  bundleCount, 
  totalRules, 
  onClick 
}: WorkspaceHubCardProps) => {
  return (
    <Card $interactive onClick={onClick}>
      <Flex $direction="column" $gap="md" $p="lg">
        {/* Top Row: Title & Status */}
        <Flex $justify="space-between" $align="flex-start">
          <Box style={{ minWidth: 0 }}>
            <Heading $level="h3" $color="secondary">{workspace.name}</Heading>
            <Text $size="xs" $color="muted" $monospace $truncate>
              {workspace.projectRoot}
            </Text>
          </Box>
          
          {isActive ? (
            <Box $bg="palette.primary.alpha" $p="2px 8px" style={{ borderRadius: 4 }}>
              <Text $size="xs" $color="palette.primary.light" $weight="bold" $uppercase>
                Active
              </Text>
            </Box>
          ) : (
            <Play size={16} color="#6b7280" />
          )}
        </Flex>
        
        {/* Bottom Row: Stats */}
        <Flex 
          $gap="lg" 
          $p="md 0 0 0" 
          style={{ borderTop: '1px solid #333' }}
        >
          <Flex $direction="column">
            <Text $size="xs" $color="muted">Bundles</Text>
            <Text $size="sm" $color="secondary" $weight="semibold">
              {bundleCount}
            </Text>
          </Flex>
          <Flex $direction="column">
            <Text $size="xs" $color="muted">Redaction Rules</Text>
            <Text $size="sm" $color="secondary" $weight="semibold">
              {totalRules}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};