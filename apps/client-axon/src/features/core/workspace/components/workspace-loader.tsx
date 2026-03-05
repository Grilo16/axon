import React from "react";
import { Clock, FolderOpen, ArrowLeft, X } from "lucide-react";
import { ModalOverlay, ModalCard, ModalHeader, ModalBody, Flex, Text, Button } from "@shared/ui";
import { useTheme } from "styled-components";

import { useWorkspaceLoader } from "../hooks/use-workspace-loader";
import { WorkspaceList } from "./workspace-list";
import { WorkspaceCreateForm } from "./workspace-create-form";

interface Props {
  onClose?: () => void;
}

export const WorkspaceLoader: React.FC<Props> = ({ onClose }) => {
  const theme = useTheme();
  const state = useWorkspaceLoader(onClose);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard $width="500px" onClick={(e) => e.stopPropagation()}>
        
        <ModalHeader>
          <Flex $align="center" $gap="sm">
            {state.mode === "list" ? (
              <Clock size={20} color={theme.colors.palette.primary.main} />
            ) : (
              <FolderOpen size={20} color={theme.colors.palette.primary.main} />
            )}
            <Text $weight="bold" $size="lg">
              {state.mode === "list" ? "Recent Workspaces" : "Create Workspace"}
            </Text>
          </Flex>
          
          <Flex $gap="xs">
            {state.mode === "create" && state.workspaces.length > 0 && (
              <Button $variant="ghost" onClick={() => state.setMode("list")}>
                <ArrowLeft size={16} /> Back
              </Button>
            )}
            {onClose && (
              <Button $variant="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            )}
          </Flex>
        </ModalHeader>

        <ModalBody $p="xl">
          {state.mode === "list" ? (
            <WorkspaceList 
              workspaces={state.workspaces} 
              onOpen={state.handleOpenWorkspace}
              onRemove={state.handleRemoveWorkspace}
              onSwitchToCreate={() => state.setMode("create")}
            />
          ) : (
            <WorkspaceCreateForm 
              newName={state.newName}
              setNewName={state.setNewName}
              githubUrl={state.githubUrl}
              setGithubUrl={state.setGithubUrl}
              onSubmit={state.handleCreate}
            />
          )}
        </ModalBody>
        
      </ModalCard>
    </ModalOverlay>
  );
};