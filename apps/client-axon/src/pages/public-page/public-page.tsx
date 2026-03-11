import { useTour } from "@app/providers";
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
import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export default function PublicSandboxPage() {
  // 🌟 1. ALL HOOKS MUST GO AT THE ABSOLUTE TOP
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

    // 2. Permanently lock the ignition for the lifecycle of this component
    hasAttemptedTour.current = true;

    // 3. FIRE AND FORGET
    // We intentionally DO NOT clear this timeout. This allows the initial 
    // Strict Mode render to successfully launch the tour, while the useRef 
    // permanently prevents any infinite loops when Redux updates!
    setTimeout(() => {
      startTour();
    }, 500);

    // 🌟 REMOVED THE CLEANUP FUNCTION ENTIRELY 🌟

  }, [
    hasSeenTour,
    isLoading,
    isAuthenticated,
    isWorkspacesLoading,
    isGhostWorkspace,
    activeWorkspaceId,
    startTour,
  ]);

  // 🌟 3. EARLY RETURNS GO DOWN HERE, AFTER ALL HOOKS ARE REGISTERED
  if (isLoading) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main">
        <Loader2 size={32} className="animate-spin" color="#60a5fa" />
      </Flex>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  if (isWorkspacesLoading || isGhostWorkspace) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main">
        <Loader2 size={32} className="animate-spin" color="#60a5fa" />
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