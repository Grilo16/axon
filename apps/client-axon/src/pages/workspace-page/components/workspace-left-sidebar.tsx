import { Panel, Group, Separator } from "react-resizable-panels"; 

import { BundleCompact } from "@features/core/bundles/components/bundle-compact";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector";
import { BundleDetails } from "@features/core/bundles/components/bundle-details";

import { PanelSection, ResizeHandle } from "@shared/ui";
import { FileExplorer } from "@features/explorer";

export const WorkspaceLeftSidebar = () => {
  return (
    <Group orientation="vertical">
      
      {/* Top: Explorer */}
      <Panel defaultSize={"60%"} minSize={"30%"}>
        <PanelSection $bg="bg.surface">
          <FileExplorer />
        </PanelSection>
      </Panel>

      <Separator>
        <ResizeHandle $orientation="horizontal" />
      </Separator>

      {/* Bottom: Bundler UI */}
      <Panel defaultSize={"40%"} minSize={"30%"}>
        <PanelSection 
          $bg="bg.surface" 
          $p="lg" 
          $gap="md" 
          style={{ borderTop: '1px solid #333' }}
        >
          <BundleSelector />
          <BundleCompact />
          <BundleDetails />
        </PanelSection>
      </Panel>

    </Group>
  );
};