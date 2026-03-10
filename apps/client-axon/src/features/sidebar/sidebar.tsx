import { Flex, Box, Text } from "@shared/ui";
import { SidebarIcon } from "./sidebar-icon";

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
  bottomActions?: React.ReactNode; 
}

export const WorkspaceSidebar = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  bottomActions,
}: WorkspaceSidebarProps) => {
  return (
    <Flex
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

      <Box style={{ flex: 1 }} />

      {/* 🌟 Render the injected actions at the bottom */}
      {bottomActions && (
        <>
          <Box $bg="border.subtle" style={{ width: 32, height: 2, borderRadius: 1, marginBottom: 8 }} />
          {bottomActions}
        </>
      )}
    </Flex>
  );
};