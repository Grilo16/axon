import { useTour } from "@app/providers";
import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";
import { BundleCompact } from "@features/bundles/bundle-compact";
import { BundleDetails } from "@features/bundles/bundle-details";
import { BundleSelector } from "@features/bundles/bundle-selector";
import { useActiveWorkspaceId } from "@core/workspace/hooks/use-workspace-slice";
import { FileExplorer } from "@features/explorer";
import { useListPublicWorkspacesQuery } from "@core/public/api/public-api";
import { Flex, Spinner } from "@shared/ui";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";
import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export default function PublicSandboxPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: publicWorkspaces, isLoading: isWorkspacesLoading } = useListPublicWorkspacesQuery();
  const activeWorkspaceId = useActiveWorkspaceId();
  const { startTour, hasSeenTour } = useTour();
  
  const isGhostWorkspace =
    publicWorkspaces &&
    activeWorkspaceId &&
    !publicWorkspaces.some((w) => w.id === activeWorkspaceId);

  const hasAttemptedTour = useRef(false);

  useEffect(() => {
    if (
      hasAttemptedTour.current ||
      hasSeenTour ||
      isLoading ||        
      isAuthenticated ||
      isWorkspacesLoading ||
      isGhostWorkspace ||
      !activeWorkspaceId
    ) {
      return;
    }

    console.log("[Sandbox] UI is fully mounted. Launching Tour...");

    hasAttemptedTour.current = true;

    setTimeout(() => {
      startTour();
    }, 500);

  }, [
    hasSeenTour,
    isLoading,
    isAuthenticated,
    isWorkspacesLoading,
    isGhostWorkspace,
    activeWorkspaceId,
    startTour,
  ]);

  if (isLoading) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main">
        <Spinner size={32} />
      </Flex>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  if (isWorkspacesLoading || isGhostWorkspace) {
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
}