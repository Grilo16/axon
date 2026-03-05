import { Panel, Group, Separator } from "react-resizable-panels"; 

import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";
import { useAxonGraph } from "@features/axon-graph/hooks/use-axon-graph";
import { WorkspaceLoader, useWorkspaceSession } from "@features/core/workspace";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";

// UI & Layout
import { Flex, Text, CanvasArea, PanelSection, ResizeHandle } from "@shared/ui";
import { WorkspaceLeftSidebar } from "./components/workspace-left-sidebar";

export const WorkspacePage = () => {
  const { activeWorkspace, isActive } = useWorkspaceManager();
  const { viewedFilePath, viewedBundleContent } = useWorkspaceSession();
  const { graphData, activeFiles, actions, isLoading } = useAxonGraph();

  if (!isActive || !activeWorkspace) return <WorkspaceLoader />;

  if (isLoading) {
    return (
      <Flex $fill $align="center" $justify="center" $bg="bg.main" $direction="column" $gap="md">
        <Text $color="palette.primary.light" $size="sm" $weight="bold" $uppercase $letterSpacing="0.1em">
          Parsing AST & Building Workspace...
        </Text>
      </Flex>
    );
  }

  return (
    <Flex $fill $bg="bg.main">
      <Group orientation="horizontal">
        
  
        <Panel defaultSize={"20%"} minSize={"15%"}>
          <WorkspaceLeftSidebar />
        </Panel>

        <Separator>
          <ResizeHandle $orientation="vertical" />
        </Separator>

        <Panel defaultSize={"80%"} minSize={"30%"}>
          <CanvasArea>
            <GraphCanvas
              graphData={graphData!}
              actions={actions}
              activeFiles={activeFiles}
            />
          </CanvasArea>
        </Panel>
  
        {(viewedFilePath || viewedBundleContent) && (
          <>
            <Separator>
              <ResizeHandle $orientation="vertical" />
            </Separator>
            
            <Panel defaultSize={"35%"} minSize={"20%"}>
              <PanelSection $bg="bg.surface">
                <CodeViewerPanel />
              </PanelSection>
            </Panel>
          </>
        )}

      </Group>
    </Flex>
  );
};