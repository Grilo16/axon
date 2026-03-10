import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";

import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";

import { FileExplorer } from "@features/explorer/components/file-explorer";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";
import { useAllWorkspacesQuery } from "@features/core/workspace/hooks/use-workspace-queries";
import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";
import { Flex } from "@shared/ui";
import { Loader2 } from "lucide-react";

export const WorkspacePage = () => {
  // 🌟 Group the bundler pieces into a single fragment
const { workspaces, isLoading } = useAllWorkspacesQuery();
  const activeWorkspaceId = useActiveWorkspaceId();
const isGhostWorkspace = workspaces && activeWorkspaceId && !workspaces.some(w => w.id === activeWorkspaceId);

  if (isLoading || isGhostWorkspace) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main">
        <Loader2 size={32} className="animate-spin" color="#60a5fa" />
      </Flex>
    );
  }

  const BundlerUI = (
    <>
      <BundleSelector />
      <BundleCompact />
      <BundleDetails />
    </>
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