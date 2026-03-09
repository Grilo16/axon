import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";
import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { FileExplorer } from "@features/explorer";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";

export default function PublicSandboxPage() {
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
  