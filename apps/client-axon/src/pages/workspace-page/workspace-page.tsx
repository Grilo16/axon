import { Panel, Group, Separator } from "react-resizable-panels"; 

import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { FileExplorer } from "@features/explorer/components/file-explorer";
import { useAxonGraph } from "@features/axon-graph/hooks/use-axon-graph";
import { WorkspaceLoader } from "@features/core/workspace";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useWorkspaceSession } from "@features/core/workspace";

// Bundler UI
import { BundleCompact } from "@features/core/bundles/components/bundle-compact/bundle-compact";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector/bundle-selector";
import { BundleDetails } from "@features/core/bundles/components/bundle-details/bundle-details";

import * as S from "./workspace-page.styles";

export const WorkspacePage = () => {
  const { activeWorkspace, isActive } = useWorkspaceManager();
  const { viewedFilePath, viewedBundleContent } = useWorkspaceSession();
  const { graphData, activeFiles, actions, isLoading } = useAxonGraph();

  if (!isActive || !activeWorkspace) return <WorkspaceLoader />;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121212] text-blue-400">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin text-4xl">⟳</span>
          <span className="animate-pulse tracking-widest uppercase text-sm font-bold">
            Parsing AST & Building Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <S.PageContainer>
      <Group orientation="horizontal" >
        
        {/* ============================== */}
        {/* 1. LEFT SIDEBAR (Explorer + Bundler) */}
        {/* ============================== */}
        <Panel defaultSize={"20%"} minSize={"15%"}>
          <Group orientation="vertical" >
            
            {/* Top: Explorer */}
            <Panel defaultSize={"60%"} minSize={"30%"}>
              <S.LeftPanelContent>
                <S.ExplorerSection>
                  <FileExplorer/>
                </S.ExplorerSection>
              </S.LeftPanelContent>
            </Panel>

            <Separator><S.HorizontalResizeHandle /></Separator>

            {/* Bottom: Bundler UI */}
            <Panel defaultSize={"40%"} minSize={"30%"}>
              <S.BundlerSection>
                <BundleSelector />
                <BundleCompact />
                <BundleDetails />
              </S.BundlerSection>
            </Panel>

          </Group>
        </Panel>

        <Separator><S.VerticalResizeHandle /></Separator>

        {/* ============================== */}
        {/* 2. CENTER STAGE (Graph Canvas) */}
        {/* ============================== */}
        <Panel defaultSize={"80%"} minSize={"30%"}>
          <S.CanvasSection>
            <GraphCanvas
              graphData={graphData!}
              actions={actions}
              activeFiles={activeFiles}
            />
          </S.CanvasSection>
        </Panel>

       {/* ============================== */}
        {/* 3. RIGHT PANEL (Code Viewer)   */}
        {/* ============================== */}
        {(viewedFilePath || viewedBundleContent) && (
          <>
            <Separator><S.VerticalResizeHandle /></Separator>
            
            <Panel defaultSize={"35%"} minSize={"20%"}>
              <CodeViewerPanel />
            </Panel>
          </>
        )}

      </Group>
    </S.PageContainer>
  );
};