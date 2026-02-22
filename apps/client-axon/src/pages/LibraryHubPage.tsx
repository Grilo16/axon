import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { Surface } from "@components/ui/Surface";
import { Heading, Subtext } from "@components/ui/Typography";
import { Modal } from "@components/ui/Modal";
import { CreateWorkspaceCard } from "@components/CreateWorkspaceCard";

import { WorkspaceCommandPalette, WorkspaceGrid } from "@components/LibraryHub";

import { useLibrary } from "@features/workspace/useLibrary";
import { useTheme } from "@features/theme/useTheme";
import { useToggle } from "@app/hooks";

import {
  VscColorMode,
  VscSearch,
  VscTrash,
  VscChevronRight,
  VscRocket,
  VscFolderOpened,
} from "react-icons/vsc";
import type { WorkspaceData } from "@features/workspace/workspacesSlice";
import { FileExplorer } from "@features/explorer/components/file-explorer";
import { useExplorer } from "@features/explorer/hooks/use-explorer";

const Page = styled.div`
  height: 100%;
  width: 100%;
  padding: 22px;
  overflow: auto;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.55;
    background:
      radial-gradient(
        800px 450px at 20% 0%,
        rgba(0, 122, 204, 0.18),
        transparent 60%
      ),
      radial-gradient(
        900px 520px at 100% 20%,
        rgba(16, 185, 129, 0.14),
        transparent 62%
      );
  }
`;

const Shell = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Hero = styled(Surface)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 780px) {
    flex-direction: column;
  }
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
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  background: ${({ theme }) => theme.colors.bg.overlay};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;

  &:hover {
    filter: brightness(1.08);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Hint = styled(Subtext)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  margin: 0;
`;

const Kbd = styled.span`
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

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
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatMeta = styled(Subtext)`
  margin: 0;
`;

const Pill = styled.div<{ $accent?: "primary" | "success" }>`
  font-size: 11px;
  font-weight: 850;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme, $accent }) =>
    $accent === "primary"
      ? theme.colors.palette.primary
      : $accent === "success"
        ? theme.colors.palette.success
        : theme.colors.text.secondary};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 14px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const PanelCard = styled(Surface)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

const DangerText = styled.div`
  color: ${({ theme }) => theme.colors.palette.danger};
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const DangerButton = styled.button<{ $primary?: boolean }>`
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.palette.danger : theme.colors.bg.overlay};
  border: 1px solid
    ${({ theme, $primary }) =>
      $primary ? theme.colors.palette.danger : theme.colors.border};
  color: ${({ theme, $primary }) =>
    $primary ? "#fff" : theme.colors.text.primary};
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 850;

  &:hover {
    filter: brightness(1.06);
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

  const palette = useToggle();
  const deleteModal = useToggle();

  const {
    isOpen: paletteIsOpen,
    open: openPalette,
    close: closePalette,
  } = palette;
  const {
    isOpen: deleteIsOpen,
    open: openDelete,
    close: closeDelete,
  } = deleteModal;

  const [pendingDelete, setPendingDelete] = useState<WorkspaceData | null>(
    null,
  );

  // Ctrl/Cmd+K opens palette; Esc closes overlays.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        openPalette();
      }
      if (e.key === "Escape") {
        if (paletteIsOpen) closePalette();
        if (deleteIsOpen) setPendingDelete(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette, closePalette, paletteIsOpen, deleteIsOpen]);

  useEffect(() => {
    if (pendingDelete) openDelete();
    else closeDelete();
  }, [pendingDelete, openDelete, closeDelete]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w: WorkspaceData) => w.id === activeId) ?? null,
    [workspaces, activeId],
  );

  const stats = useMemo(() => {
    const total = workspaces.length;

    const mostRecent = [...workspaces]
      .filter((w: WorkspaceData) => Boolean(w.lastOpened))
      .sort(
        (a: WorkspaceData, b: WorkspaceData) =>
          +new Date(b.lastOpened) - +new Date(a.lastOpened),
      )[0];

    return {
      total,
      activeName: activeWorkspace?.name ?? "None",
      recent: mostRecent?.lastOpened ? fmtDateTime(mostRecent.lastOpened) : "—",
    };
  }, [workspaces, activeWorkspace]);

  const openWorkspace = useCallback(
    (id: string) => {
      closePalette();
      open(id);
      navigate("/workspace");
    },
    [open, navigate, closePalette],
  );

  const requestDelete = useCallback(
    (ws: WorkspaceData) => {
      closePalette();
      setPendingDelete(ws);
    },
    [closePalette],
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    remove(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, remove]);

  const scrollToCreate = useCallback(() => {
    const el = document.getElementById("axon-create");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const explorer = useExplorer("G:/");


  return (
    <Page>
      <Shell>
        <Hero $variant="surface" $padding={3} $radius="md">
          <TitleBlock>
            <Heading style={{ marginBottom: 0 }}>Library Hub</Heading>
            <Subtext style={{ margin: 0 }}>
              Jump between workspaces, and use <strong>Ctrl</strong>+
              <strong>K</strong> to fly.
            </Subtext>
          </TitleBlock>

          <Actions>
            <Hint>
              <Kbd>Ctrl</Kbd> <span>+</span> <Kbd>K</Kbd>
            </Hint>

            <IconButton
              title="Search workspaces (Ctrl+K)"
              onClick={openPalette}
            >
              <VscSearch />
            </IconButton>

            <IconButton title="Toggle theme" onClick={toggleTheme}>
              <VscColorMode />
            </IconButton>
          </Actions>
        </Hero>

<div style={{height: "20rem"}}>

          <FileExplorer
            explorer={explorer}
            options={{
              filesSelectable: true,
              foldersSelectable: false,  
              multiSelect: false,
            }}
            />
            </div>
        <StatRow>
          <StatCard $variant="surface" $padding={3} $radius="md">
            <StatTop>
              <StatLabel>Workspaces</StatLabel>
              <Pill $accent="primary">
                <VscFolderOpened /> saved
              </Pill>
            </StatTop>
            <StatValue>{stats.total}</StatValue>
            <StatMeta>All saved projects</StatMeta>
          </StatCard>

          <StatCard $variant="surface" $padding={3} $radius="md">
            <StatTop>
              <StatLabel>Active</StatLabel>
              <Pill $accent="success">selected</Pill>
            </StatTop>
            <StatValue title={stats.activeName}>{stats.activeName}</StatValue>
            <StatMeta>Currently selected</StatMeta>
          </StatCard>

          <StatCard $variant="surface" $padding={3} $radius="md">
            <StatTop>
              <StatLabel>Most Recent</StatLabel>
              <Pill>last opened</Pill>
            </StatTop>
            <StatValue style={{ fontSize: 16, fontWeight: 900 }}>
              {stats.recent}
            </StatValue>
            <StatMeta>Most recently opened workspace</StatMeta>
          </StatCard>

          <StatCard
            $variant="surface"
            $padding={3}
            $radius="md"
            onClick={scrollToCreate}
            style={{ cursor: "pointer" }}
            title="Jump to Create"
          >
            <StatTop>
              <StatLabel>Quick Create</StatLabel>
              <Pill $accent="primary">
                <VscRocket /> new
              </Pill>
            </StatTop>
            <StatValue style={{ fontSize: 14, fontWeight: 900 }}>
              Create workspace
            </StatValue>
            <StatMeta>Start a new workspace from any folder</StatMeta>
          </StatCard>
        </StatRow>

        <MainGrid>
          <PanelCard $variant="surface" $padding={3} $radius="md">
            <PanelHeader>
              <Heading style={{ marginBottom: 0, fontSize: 16 }}>
                Your Workspaces
              </Heading>
              <Subtext style={{ margin: 0 }}>
                Click to open · <strong>Ctrl</strong>+<strong>K</strong> to
                search
              </Subtext>
            </PanelHeader>

            <WorkspaceGrid
              workspaces={workspaces}
              activeId={activeId}
              onOpen={openWorkspace}
              onDelete={requestDelete}
            />
          </PanelCard>

          <div id="axon-create">
            <PanelCard $variant="surface" $padding={3} $radius="md">
              <PanelHeader>
                <Heading style={{ marginBottom: 0, fontSize: 16 }}>
                  Create
                </Heading>
                <Subtext style={{ margin: 0 }}>Start a new workspace</Subtext>
              </PanelHeader>

              <CreateWorkspaceCard />
            </PanelCard>
          </div>
        </MainGrid>

        <WorkspaceCommandPalette
          onDelete={requestDelete}
          activeId={activeId}
          isOpen={paletteIsOpen}
          onClose={closePalette}
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

            {pendingDelete?.projectRoot ? (
              <Subtext style={{ margin: 0, opacity: 0.75 }}>
                <span
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  }}
                >
                  {pendingDelete.projectRoot}
                </span>
              </Subtext>
            ) : null}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <DangerButton onClick={() => setPendingDelete(null)}>
                Cancel
              </DangerButton>
              <DangerButton $primary onClick={confirmDelete}>
                Delete <VscChevronRight />
              </DangerButton>
            </div>
          </div>
        </Modal>
      </Shell>
    </Page>
  );
};
