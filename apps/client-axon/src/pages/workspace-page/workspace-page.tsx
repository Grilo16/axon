import { Panel, Group, Separator } from "react-resizable-panels";

import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { CodeViewerPanel } from "@features/code-viewer/components/code-viewer-panel";

import { Flex, CanvasArea, PanelSection, ResizeHandle } from "@shared/ui";
import { WorkspaceLeftSidebar } from "./components/workspace-left-sidebar";
import { useViewMode } from "@features/core/workspace/hooks/use-workspace-slice";

export const WorkspacePage = () => {
  const viewMode = useViewMode()

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
            <GraphCanvas/>
          </CanvasArea>
        </Panel>

        {(viewMode !== "none") && (
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
