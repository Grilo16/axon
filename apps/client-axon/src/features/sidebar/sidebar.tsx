import { VscAdd } from "react-icons/vsc";
import { HelpCircle, LogOut } from "lucide-react";
import { Flex, Box, Text } from "@shared/ui";
import { SidebarIcon } from "./sidebar-icon";

/**
 * Extracts a 2-letter abbreviation for the workspace icon.
 */
export function getInitials(name: string): string {
  const clean = (name ?? "").trim();
  if (!clean) return "WS";
  
  const parts = clean.split(/[\s\-_./]+/).filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onCreateClick: () => void;
  onTourClick: () => void;
  onLogoutClick: () => void;
}

export const WorkspaceSidebar = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateClick,
  onTourClick,
  onLogoutClick,
}: WorkspaceSidebarProps) => {
  return (
    <Flex
      id="tour-sidebar-workspaces"
      $direction="column"
      $align="center"
      $gap="md" 
      $fill
    >
      {workspaces.map((ws) => (
        <SidebarIcon
          key={ws.id}
          icon={<Text $size="lg" $weight="bold">{getInitials(ws.name)}</Text>}
          title={ws.name}
          $active={ws.id === activeWorkspaceId}
          onClick={() => onSelectWorkspace(ws.id)}
        />
      ))}

      <Box
        $bg="border.subtle"
        style={{ width: 32, height: 2, borderRadius: 1 }}
      />

      <SidebarIcon
        title="Create New Workspace"
        onClick={onCreateClick}
        icon={<VscAdd size={18} />}
      />

      <Box style={{ flex: 1 }} />

      <SidebarIcon
        title="Take a Tour"
        onClick={onTourClick}
        icon={<HelpCircle size={16} />}
      />

      <SidebarIcon
        title="Log Out"
        $isDanger
        onClick={onLogoutClick}
        icon={<LogOut size={16} />}
      />
    </Flex>
  );
};