import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Modal } from "@components/ui/Modal";
import { Surface } from "@components/ui/Surface";
import { Subtext } from "@components/ui/Typography";
import { VscTrash, VscFolderOpened, VscGoToFile } from "react-icons/vsc";
import type { WorkspaceData } from "@features/workspace/workspacesSlice";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

const HintBar = styled(Subtext)`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 0;
`;

const Kbd = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
`;

const Results = styled(Surface)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 360px;
  overflow: auto;
`;

const Row = styled.button<{ $active?: boolean; $selected?: boolean }>`
  width: 100%;
  border: 1px solid transparent;
  background: ${({ theme, $selected }) => ($selected ? theme.colors.bg.overlay : "transparent")};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border-radius: 10px;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
  }

  ${({ theme, $selected }) => ($selected ? `border-color: ${theme.colors.palette.primary};` : "")}
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 800;
`;

const Meta = styled(Subtext)`
  font-size: 12px;
  margin: 2px 0 0;
`;

const Right = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const MiniBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const score = (q: string, ws: WorkspaceData) => {
  const query = q.trim().toLowerCase();
  if (!query) return 1;

  const name = ws.name.toLowerCase();
  const root = ws.projectRoot.toLowerCase();

  if (name.startsWith(query)) return 1000;
  if (name.includes(query)) return 700;

  if (root.startsWith(query)) return 400;
  if (root.includes(query)) return 250;

  let i = 0;
  for (const ch of name) {
    if (ch === query[i]) i += 1;
    if (i >= query.length) return 120;
  }

  return 0;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaces: WorkspaceData[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onDelete: (ws: WorkspaceData) => void;
}

export const WorkspaceCommandPalette = ({
  isOpen,
  onClose,
  workspaces,
  activeId,
  onOpen,
  onDelete,
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const scored = workspaces
      .map((ws) => ({ ws, s: score(q, ws) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);

    return scored.map((x) => x.ws);
  }, [q, workspaces]);

  useEffect(() => {
    if (!isOpen) return;
    setQ("");
    setCursor(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (cursor < 0) setCursor(0);
    if (cursor > results.length - 1) setCursor(Math.max(0, results.length - 1));
  }, [cursor, results.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const ws = results[cursor];
      if (ws) onOpen(ws.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette">
      <Wrap>
        <SearchRow>
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search workspaces…"
            aria-label="Search workspaces"
          />
        </SearchRow>

        <HintBar>
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate · <Kbd>Enter</Kbd> to open
          </span>
          <span>
            <Kbd>Esc</Kbd> to close
          </span>
        </HintBar>

        <Results $variant="surface" $radius="md" $padding={2}>
          {results.length === 0 ? (
            <Subtext style={{ padding: 10 }}>
              No matches. Try typing part of a workspace name or path.
            </Subtext>
          ) : (
            results.map((ws, idx) => {
              const selected = idx === cursor;
              const isActive = ws.id === activeId;

              return (
                <Row
                  key={ws.id}
                  $selected={selected}
                  $active={isActive}
                  onMouseEnter={() => setCursor(idx)}
                  onClick={() => onOpen(ws.id)}
                >
                  <VscFolderOpened />
                  <div>
                    <Name>
                      {ws.name}{" "}
                      {isActive ? <Subtext style={{ marginLeft: 8 }}>(active)</Subtext> : null}
                    </Name>
                    <Meta>{ws.projectRoot}</Meta>
                  </div>

                  <Right>
                    <span title="Enter to open">
                      <VscGoToFile />
                    </span>
                    <MiniBtn
                      title="Delete workspace"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(ws);
                      }}
                    >
                      <VscTrash />
                      <span style={{ fontSize: 12 }}>Delete</span>
                    </MiniBtn>
                  </Right>
                </Row>
              );
            })
          )}
        </Results>
      </Wrap>
    </Modal>
  );
};
