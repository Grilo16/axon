import  { useState } from "react";
import { Clock, FolderOpen, ArrowLeft, X } from "lucide-react";
import { ModalOverlay, ModalCard, ModalHeader, ModalBody, Flex, Text, Button } from "@shared/ui";
import { useWorkspaceManager } from "../../hooks/use-workspace-manager";
import { WorkspaceList } from "./workspace-list";
import { WorkspaceCreateForm } from "./workspace-create-form";

export const WorkspaceLoader = ({ onClose }: { onClose?: () => void }) => {
  const { workspaces, open, remove } = useWorkspaceManager();
  const [mode, setMode] = useState<"list" | "create">(workspaces.length > 0 ? "list" : "create");

  const sortedWorkspaces = [...workspaces].sort(
    (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
  );

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard $width="500px" onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Flex $align="center" $gap="sm">
            {mode === "list" ? <Clock size={20} color="#3b82f6" /> : <FolderOpen size={20} color="#3b82f6" />}
            <Text $weight="bold" $size="lg">
              {mode === "list" ? "Recent Workspaces" : "Create Workspace"}
            </Text>
          </Flex>
          <Flex $gap="xs">
            {mode === "create" && workspaces.length > 0 && (
              <Button $variant="ghost" onClick={() => setMode("list")}>
                <ArrowLeft size={16} /> Back
              </Button>
            )}
            {onClose && (
              <Button $variant="icon" onClick={onClose}><X size={18} /></Button>
            )}
          </Flex>
        </ModalHeader>

        <ModalBody $p="xl">
          {mode === "list" ? (
            <WorkspaceList 
              workspaces={sortedWorkspaces} 
              onOpen={(id) => { open(id); onClose?.(); }}
              onRemove={remove}
              onSwitchToCreate={() => setMode("create")}
            />
          ) : (
            <WorkspaceCreateForm onDone={onClose} />
          )}
        </ModalBody>
      </ModalCard>
    </ModalOverlay>
  );
};