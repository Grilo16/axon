import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";

import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";

import { FileExplorer } from "@features/explorer/components/file-explorer";
import { WorkspaceLayout } from "@shared/ui/layouts/workspace-layout";

export const WorkspacePage = () => {
  // 🌟 Group the bundler pieces into a single fragment
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