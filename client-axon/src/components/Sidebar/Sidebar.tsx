import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLibrary } from '@features/workspace/useLibrary';
import { VscAdd, VscSymbolStructure } from 'react-icons/vsc';

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  width: 100%;
  height: 100%;
`;

const Separator = styled.div`
  width: 32px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: 1px;
`;

// The "Server Icon" style (Discord/Slack like)
const WorkspaceIcon = styled.div<{ $active?: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: ${({ $active }) => ($active ? '12px' : '50%')}; /* Morph shape */
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.palette.primary : theme.colors.bg.overlay};
  color: ${({ theme, $active }) => 
    $active ? '#fff' : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;

  &:hover {
    border-radius: 12px;
    background-color: ${({ theme, $active }) => 
      $active ? theme.colors.palette.primary : theme.colors.palette.secondary};
    color: white;
  }
`;

// A subtle "Active Indicator" pill on the left
const ActivePill = styled.div`
  position: absolute;
  left: -10px;
  width: 4px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 0 4px 4px 0;
`;


export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaces, activeId, open } = useLibrary();

  const hubActive = location.pathname.startsWith("/hub");

  return (
    <Container>
      {/* NEW: Hub */}
      <WorkspaceIcon
        $active={hubActive}
        title="Library Hub (Ctrl+K)"
        onClick={() => navigate("/hub")}
      >
        {hubActive ? <ActivePill /> : null}
        <VscSymbolStructure />
      </WorkspaceIcon>

      <Separator />

      {/* existing workspace icons */}
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
            {/* your existing initials function */}
            {/* getInitials(ws.name) */}
          </WorkspaceIcon>
        );
      })}

      <Separator />

      {/* existing add button */}
      <WorkspaceIcon
        title="Create workspace"
        onClick={() => navigate("/")}
      >
        <VscAdd />
      </WorkspaceIcon>
    </Container>
  );
};