import { FolderOpen, Trash2, ChevronRight, Plus } from "lucide-react";
import { Flex, Text, Button, Box } from "@shared/ui";
import {type WorkspaceRecord } from "@shared/types/axon-core/workspace-api";
import styled from "styled-components";

const WorkspaceRow = styled(Flex)`
  cursor: pointer;
  border: 1px solid transparent;
  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    border-color: ${({ theme }) => theme.colors.border.subtle};
  }
`;

export const WorkspaceList = ({ 
  workspaces, 
  onOpen, 
  onRemove, 
  onSwitchToCreate 
}: { 
  workspaces: WorkspaceRecord[], 
  onOpen: (id: string) => void,
  onRemove: (id: string) => void,
  onSwitchToCreate: () => void
}) => (
  <Flex $direction="column" $gap="md">
    <Flex $direction="column" $gap="xs">
      {workspaces.map((ws) => (
        <WorkspaceRow 
          key={ws.id} 
          $p="md" 
          $radius="md" 
          $align="center" 
          $gap="md"
          onClick={() => onOpen(ws.id)}
        >
          <Box $p="sm" $bg="bg.overlay" $radius="sm">
            <FolderOpen size={16} color="#60a5fa" />
          </Box>
          <Flex $direction="column" style={{ flex: 1, minWidth: 0 }}>
            <Text $weight="bold" $size="md">{ws.name}</Text>
            <Text $size="xs" $color="muted" $truncate>{ws.projectRoot}</Text>
          </Flex>
          <Button $variant="icon" onClick={(e) => { e.stopPropagation(); onRemove(ws.id); }}>
            <Trash2 size={16} />
          </Button>
          <ChevronRight size={16} color="#444" />
        </WorkspaceRow>
      ))}
    </Flex>
    
    <Box $p="lg 0 0 0" style={{ borderTop: '1px solid #2b2b2b' }}>
      <Button $variant="primary" $fill onClick={onSwitchToCreate}>
        <Plus size={18} /> New Workspace
      </Button>
    </Box>
  </Flex>
);