import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { Surface } from "@components/ui/Surface";
import { Heading, Subtext } from "@components/ui/Typography";
import { Modal } from "@components/ui/Modal";
import { CreateWorkspaceCard } from "@components/CreateWorkspaceCard";

import { useLibrary } from "@features/workspace/useLibrary";
import { useTheme } from "@features/theme/useTheme";
import { useToggle } from "@app/hooks";

import { VscColorMode, VscSearch, VscTrash, VscChevronRight } from "react-icons/vsc";
import type { WorkspaceData } from "@features/workspace/workspacesSlice";
import { WorkspaceCommandPalette, WorkspaceGrid} from "@components/LibraryHub";

const Page = styled.div`
  height: 100%;
  width: 100%;
  padding: 24px;
  overflow: auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Hint = styled(Subtext)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
`;

const Kbd = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Surface)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatMeta = styled(Subtext)`
  margin: 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 10px;
`;

const DangerText = styled.div`
  color: ${({ theme }) => theme.colors.palette.danger};
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const DangerButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const LibraryHubPage = () => {
  const navigate = useNavigate();
  const { workspaces, activeId, open, remove } = useLibrary();
  const { toggle: toggleTheme } = useTheme();
  const palette = useToggle()
  const deleteModal = useToggle();

  const [pendingDelete, setPendingDelete] = useState<WorkspaceData | null>(null);

  useEffect(() => {
    if (!pendingDelete) deleteModal.close();
  }, [pendingDelete, deleteModal]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w: WorkspaceData) => w.id === activeId) ?? null,
    [workspaces, activeId]
  );

  const stats = useMemo(() => {
    const total = workspaces.length;

    const mostRecent = [...workspaces]
      .filter((w: WorkspaceData) => Boolean(w.lastOpened))
      .sort((a: WorkspaceData, b: WorkspaceData) => +new Date(b.lastOpened) - +new Date(a.lastOpened))[0];

    return {
      total,
      activeName: activeWorkspace?.name ?? "None",
      recent: mostRecent?.lastOpened ? fmtDateTime(mostRecent.lastOpened) : "—",
    };
  }, [workspaces, activeWorkspace]);

  const openWorkspace = (id: string) => {
    open(id);
    navigate("/workspace");
  };

  const requestDelete = (ws: WorkspaceData) => setPendingDelete(ws);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    remove(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <Page>
      <TopBar>
        <TitleBlock>
          <Heading style={{ marginBottom: 0 }}>Library Hub</Heading>
          <Subtext>
            Jump between workspaces, see what’s “hot”, and fly with <strong>Ctrl</strong>+<strong>K</strong>.
          </Subtext>
        </TitleBlock>

        <Actions>
          <Hint>
            <Kbd>Ctrl</Kbd> <span>+</span> <Kbd>K</Kbd>
          </Hint>

          <IconButton title="Search workspaces (Ctrl+K)" onClick={palette.open}>
            <VscSearch />
          </IconButton>

          <IconButton title="Toggle theme" onClick={toggleTheme}>
            <VscColorMode />
          </IconButton>
        </Actions>
      </TopBar>

      <StatRow>
        <StatCard $variant="surface" $padding={3} $radius="md">
          <StatLabel>Workspaces</StatLabel>
          <StatValue>{stats.total}</StatValue>
          <StatMeta>All saved projects</StatMeta>
        </StatCard>

        <StatCard $variant="surface" $padding={3} $radius="md">
          <StatLabel>Active</StatLabel>
          <StatValue>{stats.activeName}</StatValue>
          <StatMeta>Currently selected</StatMeta>
        </StatCard>

        <StatCard $variant="surface" $padding={3} $radius="md">
          <StatLabel>Most Recent</StatLabel>
          <StatValue>{stats.recent}</StatValue>
          <StatMeta>Last opened workspace</StatMeta>
        </StatCard>

        <StatCard $variant="surface" $padding={3} $radius="md">
          <StatLabel>Quick Create</StatLabel>
          <StatValue style={{ fontSize: 14, fontWeight: 800 }}>New</StatValue>
          <StatMeta>Create a new workspace</StatMeta>
        </StatCard>
      </StatRow>

      <SectionHeader>
        <Heading style={{ marginBottom: 0, fontSize: 16 }}>Your Workspaces</Heading>
        <Subtext style={{ margin: 0 }}>
          Click to open · <strong>Ctrl</strong>+<strong>K</strong> to search
        </Subtext>
      </SectionHeader>

      <WorkspaceGrid
        workspaces={workspaces}
        activeId={activeId}
        onOpen={openWorkspace}
        onDelete={requestDelete}
      />

      <SectionHeader>
        <Heading style={{ marginBottom: 0, fontSize: 16 }}>Create</Heading>
        <Subtext style={{ margin: 0 }}>
          Start a new workspace from any folder
        </Subtext>
      </SectionHeader>

      <CreateWorkspaceCard />

      <WorkspaceCommandPalette
        onDelete={() => {}}
        activeId={activeId}
        isOpen={palette.isOpen}
        onClose={palette.close}
        workspaces={workspaces}
        onOpen={openWorkspace}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setPendingDelete(null)}
        title="Delete Workspace?"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DangerText>
            <VscTrash /> This cannot be undone.
          </DangerText>
          <Subtext style={{ margin: 0 }}>
            Delete <strong>{pendingDelete?.name}</strong>?
          </Subtext>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <DangerButton onClick={() => setPendingDelete(null)}>
              Cancel
            </DangerButton>
            <DangerButton onClick={confirmDelete}>
              Delete <VscChevronRight />
            </DangerButton>
          </div>
        </div>
      </Modal>
    </Page>
  );
};
