import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";
import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";
import { FileExplorer } from "@features/explorer";
import { useListPublicWorkspacesQuery } from "@features/public/api/public-api";
import { Flex } from "@shared/ui";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";
import { Loader2 } from "lucide-react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export default function PublicSandboxPage() {

const { isAuthenticated, isLoading } = useAuth();
  const { data: publicWorkspaces, isLoading: isWorkspacesLoading } = useListPublicWorkspacesQuery();
  const activeWorkspaceId = useActiveWorkspaceId();

  if (isLoading) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main">
        <Loader2 size={32} className="animate-spin" color="#60a5fa" />
      </Flex>
    );
  }

  // 🌟 2. THE BOUNCER: If they are logged in, silently teleport them to the real app!
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const isGhostWorkspace = publicWorkspaces && activeWorkspaceId && !publicWorkspaces.some(w => w.id === activeWorkspaceId);

  // Block the UI from mounting until the network loads AND the Redux extraReducer finishes healing!
  if (isWorkspacesLoading || isGhostWorkspace) {
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
  )
}
  