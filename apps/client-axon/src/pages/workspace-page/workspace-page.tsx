import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";

import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";

import { FileExplorer } from "@features/explorer/components/file-explorer";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";
import { useAllWorkspacesQuery } from "@features/core/workspace/hooks/use-workspace-queries";
import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";
import { Flex, Spinner } from "@shared/ui";

export const WorkspacePage = () => {
const { workspaces, isLoading } = useAllWorkspacesQuery();
  const activeWorkspaceId = useActiveWorkspaceId();
const isGhostWorkspace = workspaces && activeWorkspaceId && !workspaces.some(w => w.id === activeWorkspaceId);

  if (isLoading || isGhostWorkspace) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main">
        <Spinner size={32} />
      </Flex>
    );
  }

  const BundlerUI = (
    <Flex $direction="column" $fill $gap="md" style={{ minHeight: 'min-content' }}>
      <BundleSelector />
      <BundleDetails />
      <BundleCompact /> 
    </Flex>
  );

  return (
    <WorkspaceLayout
      explorer={<FileExplorer />}
      bundler={BundlerUI}
      graph={<GraphCanvas />}
      codeViewer={<CodeViewerPanel />}
    />
  );
};