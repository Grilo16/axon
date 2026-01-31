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
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled(Surface)`
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(Surface)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 74px;
`;

const StatLabel = styled(Subtext)`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatMeta = styled(Subtext)`
  font-size: 12px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 12px 0;
`;

const ConfirmBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ConfirmTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  background: ${({ theme, $primary, $danger }) =>
    $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : "transparent"};
  color: ${({ theme, $primary, $danger }) =>
    $danger || $primary ? "white" : theme.colors.text.secondary};
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.border};
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  gap: 8px;
  align-items: center;

  &:hover {
    filter: brightness(1.05);
    background: ${({ theme, $primary, $danger }) =>
      $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.bg.overlay};
    color: ${({ theme, $primary, $danger }) =>
      $danger || $primary ? "white" : theme.colors.text.primary};
  }
`;

const fmtDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const LibraryHubPage = () => {
  const navigate = useNavigate();
  const { workspaces, activeId, open, remove } = useLibrary();
  const { toggle: toggleTheme } = useTheme();

  const palette = useToggle();
  const [pendingDelete, setPendingDelete] = useState<WorkspaceData | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        palette.open();
      }
      if (e.key === "Escape") {
        palette.close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [palette]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w: WorkspaceData) => w.id === activeId) ?? null,
    [workspaces, activeId]
  );

  const stats = useMemo(() => {
    const total = workspaces.length;
    const groups = workspaces.reduce((acc: number, w: WorkspaceData) => acc + (w.groups?.length ?? 0), 0);

    const mostRecent = [...workspaces]
      .filter((w: WorkspaceData) => Boolean(w.lastOpened))
      .sort((a: WorkspaceData, b: WorkspaceData) => +new Date(b.lastOpened) - +new Date(a.lastOpened))[0];

    return {
      total,
      groups,
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
          <StatLabel>Total Groups</StatLabel>
          <StatValue>{stats.groups}</StatValue>
          <StatMeta>Across your library</StatMeta>
        </StatCard>

        <StatCard $variant="surface" $padding={3} $radius="md">
          <StatLabel>Active</StatLabel>
          <StatValue>{stats.activeName}</StatValue>
          <StatMeta>Currently selected</StatMeta>
        </StatCard>

        <StatCard $variant="surface" $padding={3} $radius="md">
          <StatLabel>Most Recent</StatLabel>
          <StatValue>{stats.recent}</StatValue>
          <StatMeta>Latest open time</StatMeta>
        </StatCard>
      </StatRow>

      <ContentGrid>
        <Panel $variant="surface" $padding={3} $radius="md">
          <Heading style={{ marginBottom: 6 }}>Your Workspaces</Heading>
          <Subtext>Open, delete, or use the palette to teleport.</Subtext>

          <Divider />

          <WorkspaceGrid
            workspaces={workspaces}
            activeId={activeId}
            onOpen={openWorkspace}
            onDelete={requestDelete}
          />
        </Panel>

        <Panel $variant="surface" $padding={3} $radius="md">
          <Heading style={{ marginBottom: 6 }}>Create</Heading>
          <Subtext>Spin up a new workspace in seconds.</Subtext>

          <Divider />

          <CreateWorkspaceCard />
        </Panel>
      </ContentGrid>

      <WorkspaceCommandPalette
        isOpen={palette.isOpen}
        onClose={palette.close}
        workspaces={workspaces}
        activeId={activeId}
        onOpen={(id) => {
          palette.close();
          openWorkspace(id);
        }}
        onDelete={(ws) => {
          palette.close();
          requestDelete(ws);
        }}
      />

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete workspace?"
      >
        <ConfirmBody>
          <ConfirmTitle>
            Delete <span style={{ color: "inherit" }}>{pendingDelete?.name ?? "this workspace"}</span>?
          </ConfirmTitle>
          <Subtext>
            This removes it from your saved library. (Your files on disk are untouched.)
          </Subtext>

          <ConfirmActions>
            <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button $danger onClick={confirmDelete}>
              <VscTrash />
              Delete
              <VscChevronRight />
            </Button>
          </ConfirmActions>
        </ConfirmBody>
      </Modal>
    </Page>
  );
};
