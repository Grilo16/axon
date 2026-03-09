import { FolderOpen, Trash2, ChevronRight } from "lucide-react";
import { Flex, Text, Button, Box } from "@shared/ui";
import styled from "styled-components";
import { useAllWorkspacesQuery } from "../hooks/use-workspace-queries";
import { useWorkspaceDispatchers } from "../hooks/use-workspace-slice";
import { useWorkspaceActions } from "../hooks/use-workspace-actions";

const WorkspaceRow = styled(Flex)`
  cursor: pointer;
  border: 1px solid transparent;
  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    border-color: ${({ theme }) => theme.colors.border.subtle};
  }
`;

export const WorkspaceList = () => {
  const { workspaces } = useAllWorkspacesQuery();
  const { switchWorkspace } = useWorkspaceDispatchers()
  const { deleteWorkspace } = useWorkspaceActions()
  
  return (
  <Flex $direction="column" $gap="md">
    <Flex $direction="column" $gap="xs">
      {workspaces.map((ws) => (
        <WorkspaceRow 
          key={ws.id} 
          $p="md" 
          $radius="md" 
          $align="center" 
          $gap="md"
          onClick={() => switchWorkspace(ws.id)}
        >
          <Box $p="sm" $bg="bg.overlay" $radius="sm">
            <FolderOpen size={16} color="#60a5fa" />
          </Box>
          <Flex $direction="column" style={{ flex: 1, minWidth: 0 }}>
            <Text $weight="bold" $size="md">{ws.name}</Text>
            <Text $size="xs" $color="muted" $truncate>{ws.projectRoot}</Text>
          </Flex>
          <Button $variant="icon" onClick={(e) => { e.stopPropagation(); deleteWorkspace.handle(ws.id); }}>
            <Trash2 size={16} />
          </Button>
          <ChevronRight size={16} color="#444" />
        </WorkspaceRow>
      ))}
    </Flex>
   
  </Flex>
  )
}