import React, { useCallback, useState } from "react";
import { Clock, FolderOpen, ArrowLeft, X, Plus } from "lucide-react";
import {
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalBody,
  Flex,
  Text,
  Button,
  Box,
} from "@shared/ui";
import { useTheme } from "styled-components";
import { open as openTauriDialog } from "@tauri-apps/plugin-dialog";
import { WorkspaceList } from "./workspace-list";
import { WorkspaceCreateForm } from "./workspace-create-form";
import { useAllWorkspacesQuery } from "../hooks/use-workspace-queries";
import { IS_TAURI } from "@app/constants";
import { useWorkspaceActions } from "../hooks/use-workspace-actions";

interface Props {
  onClose?: () => void;
}

export const WorkspaceLoader: React.FC<Props> = ({ onClose }) => {
  const theme = useTheme();
  const { workspaces } = useAllWorkspacesQuery();

  const [newName, setNewName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [mode, setMode] = useState<"list" | "create">(
    workspaces.length > 0 ? "list" : "create",
  );

  const { createWorkspace } = useWorkspaceActions();

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (IS_TAURI) {
        try {
          const selectedPath = await openTauriDialog({
            directory: true,
            multiple: false,
            title: "Select Project Root for Axon",
          });

          if (selectedPath && typeof selectedPath === "string") {
            const finalName =
              newName.trim() ||
              selectedPath.split(/[/\\]/).pop() ||
              "Untitled Project";
            await createWorkspace.handle({
              name: finalName,
              projectRoot: selectedPath,
            });
            onClose?.();
          }
        } catch (err) {
          console.error("Failed to pick directory:", err);
        }
      } else {
        if (!githubUrl.trim()) return;

        const urlParts = githubUrl.trim().split("/");
        const repoName = urlParts.pop() || "GitHub Repository";
        const finalName = newName.trim() || repoName;

        await createWorkspace.handle({
          name: finalName,
          projectRoot: githubUrl.trim(),
        });
        onClose?.();
      }
    },
    [IS_TAURI, newName, githubUrl, createWorkspace.handle, onClose],
  );

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard $width="500px" onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Flex $align="center" $gap="sm">
            {mode === "list" ? (
              <Clock size={20} color={theme.colors.palette.primary.main} />
            ) : (
              <FolderOpen size={20} color={theme.colors.palette.primary.main} />
            )}
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
              <Button $variant="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            )}
          </Flex>
        </ModalHeader>

        <ModalBody $p="xl">
          {mode === "list" ? (
            <WorkspaceList />
          ) : (
            <WorkspaceCreateForm
              newName={newName}
              setNewName={setNewName}
              githubUrl={githubUrl}
              setGithubUrl={setGithubUrl}
              onSubmit={handleCreate}
            />
          )}
          {mode === "list" ? (
            <Box $p="lg 0 0 0" style={{ borderTop: "1px solid #2b2b2b" }}>
              <Button
                $variant="primary"
                $fill
                onClick={() => setMode("create")}
              >
                <Plus size={18} /> New Workspace
              </Button>
            </Box>
          ) : null}
        </ModalBody>
      </ModalCard>
    </ModalOverlay>
  );
};
