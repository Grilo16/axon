import { useState } from "react";
import styled from "styled-components";
import { VscAdd } from "react-icons/vsc";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { WorkspaceLoader } from "@features/core/workspace";
import { LibraryHubModal } from "./library-hub-modal"; 
import { WorkspaceLauncher } from "@features/core/workspace/components/workspace-launcher/workspace-launcher";
import type { WorkspaceRecord } from "@shared/types/axon-core/workspace-api";

const Container = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding-top: 16px; padding-inline: 4px; width: 100%; height: 100%;
`;
const Separator = styled.div`
  width: 32px; height: 2px; background-color: ${({ theme }) => theme.colors.bg.overlay}; border-radius: 1px;
`;
const WorkspaceIcon = styled.div<{ $active?: boolean }>`
  width: 42px; height: 42px; position: relative;
  border-radius: ${({ $active }) => ($active ? "12px" : "50%")};
  background-color: ${({ theme, $active }) => $active ? theme.colors.palette.primary : theme.colors.bg.overlay};
  color: ${({ theme, $active }) => $active ? "#fff" : theme.colors.text.secondary};
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 13px; cursor: pointer; transition: all 0.2s ease; user-select: none;
  &:hover {
    border-radius: 12px;
    background-color: ${({ theme, $active }) => $active ? theme.colors.palette.primary : theme.colors.palette.secondary};
    color: #fff;
  }
`;
const ActivePill = styled.div`
  position: absolute; left: -10px; width: 4px; height: 24px;
  background-color: ${({ theme }) => theme.colors.text.primary}; border-radius: 0 4px 4px 0;
`;


export const Sidebar = () => {
  const { workspaces } = useWorkspaceManager();

  const [isLoaderOpen, setIsLoaderOpen] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);

  return (
    <>
      <Container>
        {/* Hub */}
        {/* <WorkspaceIcon $active={isHubOpen} title="Library Hub" onClick={() => setIsHubOpen(true)}>
          {isHubOpen && <ActivePill />}
          <VscSymbolStructure size={18} />
        </WorkspaceIcon>

        <Separator /> */}

        {/* Workspace icons */}
        {workspaces.map((ws: WorkspaceRecord) => {
          return (
            <WorkspaceLauncher workspace={ws}/> 
          );
        })}

        <Separator />

        <WorkspaceIcon 
          title="Create New Workspace" 
          $active={isLoaderOpen}
          onClick={() => setIsLoaderOpen(true)}
        >
          {isLoaderOpen && <ActivePill />}
          <VscAdd size={18} />
        </WorkspaceIcon>
      </Container>

      {isLoaderOpen && <WorkspaceLoader onClose={() => setIsLoaderOpen(false)} />}
      {isHubOpen && <LibraryHubModal onClose={() => setIsHubOpen(false)} />}
    </>
  );
};