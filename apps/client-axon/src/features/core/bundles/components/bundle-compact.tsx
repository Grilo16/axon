import {
  Package,
  FileCode,
  ShieldAlert,
  Copy,
  EyeOff,
  Eye,
} from "lucide-react";
import { Flex, Card, Text, Button } from "@shared/ui";
import { useTheme } from "styled-components";
import { useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useActiveBundleQuery } from "../hooks/use-bundle-queries";
import { useActiveBundleActions } from "../hooks/use-active-bundle-actions";

export const BundleCompact = () => {
  const theme = useTheme();
  const { openBundleViewer } = useWorkspaceDispatchers();
  const {toggleHideBarrelExports} = useActiveBundleActions()
  const { activeBundle } = useActiveBundleQuery();
  const options = activeBundle?.options;

 
  if (!activeBundle) return null;

  const fileCount = options?.targetFiles?.length || 0;
  const ruleCount = options?.rules?.length || 0;

  return (
    <Card id="tour-bundle-compact" $p="md" $bg="bg.surfaceHover">
      <Flex $direction="column" $gap="md">
        <Flex $justify="space-between" $align="center">
          <Flex $align="center" $gap="sm">
            <Package size={16} color={theme.colors.palette.primary.light} />
            <Text $weight="bold" $size="sm">
              {activeBundle.name}
            </Text>
          </Flex>

          <Button
            id="tour-hide-barrels-toggle"
            $variant="icon"
            onClick={toggleHideBarrelExports}
            title="Toggle Barrel Exports"
          >
            {options?.hideBarrelExports ? (
              <EyeOff size={14} color={theme.colors.palette.primary.main} />
            ) : (
              <Eye size={14} />
            )}
          </Button>
        </Flex>

        <Flex $gap="sm">
          <Flex
            $bg="bg.overlay"
            $p="xs sm"
            $radius="sm"
            $gap="xs"
            $align="center"
            style={{ border: `1px solid ${theme.colors.border.subtle}` }}
          >
            <FileCode size={12} color={theme.colors.palette.success.main} />
            <Text $size="xs" $weight="bold">
              {fileCount} Files
            </Text>
          </Flex>
          <Flex
            $bg="bg.overlay"
            $p="xs sm"
            $radius="sm"
            $gap="xs"
            $align="center"
            style={{ border: `1px solid ${theme.colors.border.subtle}` }}
          >
            <ShieldAlert size={12} color={theme.colors.palette.warning.main} />
            <Text $size="xs" $weight="bold">
              {ruleCount} Rules
            </Text>
          </Flex>
        </Flex>

        <Button
          id="tour-generate-context-btn"
          $variant="primary"
          $fill
          onClick={openBundleViewer}
          disabled={fileCount === 0}
        >
          <Flex $align="center" $justify="center" $gap="sm">
            <Copy size={14} />
            <Text $weight="bold">Generate Context</Text>
          </Flex>
        </Button>
      </Flex>
    </Card>
  );
};
