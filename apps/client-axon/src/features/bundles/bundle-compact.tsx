import { Copy } from "lucide-react";
import { Flex, Text, Button } from "@shared/ui";
import { useWorkspaceDispatchers } from "@core/workspace/hooks/use-workspace-slice";
import { useActiveBundleQuery } from "@core/bundles/hooks/use-bundle-queries";

export const BundleCompact = () => {
  const { openBundleViewer } = useWorkspaceDispatchers();
  const { activeBundle } = useActiveBundleQuery();
  
  if (!activeBundle) return null;
  const fileCount = activeBundle.options?.targetFiles?.length || 0;

  return (
    <Button
      id="tour-generate-context-btn"
      $variant="primary"
      $fill
      onClick={openBundleViewer}
      disabled={fileCount === 0}
      style={{ flexShrink: 0, minHeight: 'max-content' }}
    >
      <Flex $align="center" $justify="center" $gap="sm">
        <Copy size={14} />
        <Text $weight="bold">Generate Context</Text>
      </Flex>
    </Button>
  );
};