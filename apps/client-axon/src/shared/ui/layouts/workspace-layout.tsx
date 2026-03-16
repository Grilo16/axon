import React from "react";
import styled from "styled-components";
import { Group, Panel, Separator } from "react-resizable-panels";
import { CanvasArea, Flex, PanelSection, ResizeHandle } from "@shared/ui";
import { useViewMode } from "@core/workspace/hooks/use-workspace-slice";
import { useResponsiveMode } from "@shared/hooks/use-responsive-mode";
import { MobileWorkspaceLayout } from "./mobile-workspace-layout";

const BundlerPanel = styled(PanelSection)`
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
`;

interface WorkspaceSidebarLayoutProps {
  explorer: React.ReactNode;
  bundler: React.ReactNode;
}

export const WorkspaceSidebarLayout: React.FC<WorkspaceSidebarLayoutProps> = ({
  bundler,
  explorer,
}) => {
  return (
    <Group orientation="vertical">
      <Panel defaultSize={"60%"} minSize={"30%"}>
        <PanelSection $bg="bg.surface">{explorer}</PanelSection>
      </Panel>

      <Separator>
        <ResizeHandle $orientation="horizontal" />
      </Separator>
      <Panel defaultSize={"40%"} minSize={"30%"}>
        <BundlerPanel $bg="bg.surface" $p="lg" $gap="md">
          {bundler}
        </BundlerPanel>
      </Panel>
    </Group>
  );
};

// 🌟 Typings for the Main Shell
interface WorkspaceLayoutProps {
  explorer: React.ReactNode;
  bundler: React.ReactNode;
  graph: React.ReactNode;
  codeViewer: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = (props) => {
  const mode = useResponsiveMode();

  if (mode === "mobile") {
    return <MobileWorkspaceLayout {...props} />;
  }

  return <DesktopWorkspaceLayout {...props} />;
};

const DesktopWorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  bundler,
  explorer,
  graph,
  codeViewer,
}) => {
  const viewMode = useViewMode();

  return (
    <Flex $fill $bg="bg.main">
      <Group orientation="horizontal">
        <Panel defaultSize={"20%"} minSize={"15%"}>
          <WorkspaceSidebarLayout bundler={bundler} explorer={explorer} />
        </Panel>

        <Separator>
          <ResizeHandle $orientation="vertical" />
        </Separator>

        <Panel defaultSize={"80%"} minSize={"30%"}>
          <CanvasArea>{graph}</CanvasArea>
        </Panel>

        {viewMode !== "none" && (
          <>
            <Separator>
              <ResizeHandle $orientation="vertical" />
            </Separator>

            <Panel defaultSize={"35%"} minSize={"20%"}>
              <PanelSection $bg="bg.surface">{codeViewer}</PanelSection>
            </Panel>
          </>
        )}
      </Group>
    </Flex>
  );
};
