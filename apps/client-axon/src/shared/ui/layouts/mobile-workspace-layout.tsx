import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { FolderTree, Network, Code2, Boxes } from "lucide-react";
import { Flex } from "@shared/ui";
import { MobileTabContext, type MobileTab } from "@shared/hooks/use-mobile-tab";

interface MobileWorkspaceLayoutProps {
  explorer: React.ReactNode;
  bundler: React.ReactNode;
  graph: React.ReactNode;
  codeViewer: React.ReactNode;
}

const TabPanel = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

const BottomTabBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.bg.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 12px;
  min-width: 64px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.palette.primary.light : theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.typography.weights.semibold : theme.typography.weights.regular};
  transition: color 0.15s ease;

  &:active {
    color: ${({ theme }) => theme.colors.palette.primary.main};
  }
`;

const TABS: { key: MobileTab; label: string; icon: React.FC<{ size: number }> }[] = [
  { key: "explorer", label: "Files", icon: FolderTree },
  { key: "graph", label: "Graph", icon: Network },
  { key: "code", label: "Code", icon: Code2 },
  { key: "bundler", label: "Bundles", icon: Boxes },
];

export const MobileWorkspaceLayout: React.FC<MobileWorkspaceLayoutProps> = ({
  explorer,
  bundler,
  graph,
  codeViewer,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>("graph");

  const tabCtx = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  const panels: Record<MobileTab, React.ReactNode> = {
    explorer,
    graph,
    code: codeViewer,
    bundler,
  };

  return (
    <MobileTabContext.Provider value={tabCtx}>
      <Flex $direction="column" $fill $bg="bg.main">
        <TabPanel>{panels[activeTab]}</TabPanel>

        <BottomTabBar>
          {TABS.map(({ key, label, icon: Icon }) => (
            <TabButton
              key={key}
              $active={activeTab === key}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={20} />
              {label}
            </TabButton>
          ))}
        </BottomTabBar>
      </Flex>
    </MobileTabContext.Provider>
  );
};
