import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";
import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { FileExplorer } from "@features/explorer";
import { Flex } from "@shared/ui";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";
import { Loader2 } from "lucide-react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export default function PublicSandboxPage() {

const { isAuthenticated, isLoading } = useAuth();

  // 🌟 1. THE FREEZE: Wait for OIDC to figure out if they have a token
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
  