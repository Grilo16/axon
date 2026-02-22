import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useLibrary } from "@features/workspace/useLibrary";
import { VscAdd, VscSymbolStructure } from "react-icons/vsc";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  padding-inline: 4px;
  width: 100%;
  height: 100%;
`;

const Separator = styled.div`
  width: 32px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: 1px;
`;

const WorkspaceIcon = styled.div<{ $active?: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: ${({ $active }) => ($active ? "12px" : "50%")}; /* Morph shape */
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.palette.primary : theme.colors.bg.overlay};
  color: ${({ theme, $active }) =>
    $active ? "#fff" : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;

  &:hover {
    border-radius: 12px;
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.palette.primary : theme.colors.palette.secondary};
    color: #fff;
  }
`;

const ActivePill = styled.div`
  position: absolute;
  left: -10px;
  width: 4px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 0 4px 4px 0;
`;

function getInitials(name: string) {
  const clean = (name ?? "").trim();
  if (!clean) return "WS";

  // Split on whitespace and separators
  const parts = clean.split(/[\s\-_./]+/).filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();

  if (parts.length === 1) {
    // If single word, use first 2 chars
    return parts[0].slice(0, 2).toUpperCase();
  }

  // Two+ words => take first char of first two words
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaces, activeId, open } = useLibrary();

  const hubActive = location.pathname.startsWith("/hub");

  return (
    <Container>
      {/* Hub */}
      <WorkspaceIcon
        $active={hubActive}
        title="Library Hub (Ctrl+K)"
        onClick={() => navigate("/hub")}
      >
        {hubActive ? <ActivePill /> : null}
        <VscSymbolStructure />
      </WorkspaceIcon>

      <Separator />

      {/* Workspace icons */}
      {workspaces.map((ws: any) => {
        const isActive = ws.id === activeId;
        return (
          <WorkspaceIcon
            key={ws.id}
            $active={isActive}
            onClick={() => {
              open(ws.id);
              navigate("/workspace");
            }}
            title={ws.name}
          >
            {isActive ? <ActivePill /> : null}
            {getInitials(ws.name)}
          </WorkspaceIcon>
        );
      })}

      <Separator />

      {/* Add workspace */}
      <WorkspaceIcon title="Create workspace" onClick={() => navigate("/")}>
        <VscAdd />
      </WorkspaceIcon>
    </Container>
  );
};
