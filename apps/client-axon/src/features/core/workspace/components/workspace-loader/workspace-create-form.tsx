import React, { useState } from "react";
import { FolderOpen, Github, ArrowRight } from "lucide-react";
import { open as openTauriDialog } from "@tauri-apps/plugin-dialog";

import { Flex, Text, Button, Input, Box } from "@shared/ui";
import { useWorkspaceManager } from "../../hooks/use-workspace-manager";
import { IS_TAURI } from "@app/constants";

interface WorkspaceCreateFormProps {
  onDone?: () => void;
}

export const WorkspaceCreateForm: React.FC<WorkspaceCreateFormProps> = ({ onDone }) => {
  const { create } = useWorkspaceManager();
  
  // Form State
  const [newName, setNewName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (IS_TAURI) {
      try {
        const selectedPath = await openTauriDialog({
          directory: true,
          multiple: false,
          title: "Select Project Root for Axon",
        });

        if (selectedPath && typeof selectedPath === "string") {
          const finalName = newName.trim() || selectedPath.split(/[/\\]/).pop() || "Untitled Project";
          create(finalName, selectedPath);
          onDone?.();
        }
      } catch (err) {
        console.error("Failed to pick directory:", err);
      }
    } else {
      // --- WEB LOGIC (GitHub) ---
      if (!githubUrl.trim()) return;
      
      const urlParts = githubUrl.trim().split('/');
      const repoName = urlParts.pop() || "GitHub Repository";
      const finalName = newName.trim() || repoName;
      
      create(finalName, githubUrl.trim());
      onDone?.();
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <Flex $direction="column" $gap="lg">
        
        {/* Workspace Name Input */}
        <Flex $direction="column" $gap="xs">
          <Text $size="xs" $weight="bold" $color="muted" $uppercase>
            Workspace Name (Optional)
          </Text>
          <Input 
            autoFocus 
            $size="md"
            type="text" 
            placeholder="e.g. Frontend Architecture" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
        </Flex>

        {/* GitHub Input - Only shown in Web Mode */}
        {!IS_TAURI && (
          <Flex $direction="column" $gap="xs">
            <Text $size="xs" $weight="bold" $color="muted" $uppercase>
              GitHub Repository URL
            </Text>
            <Input 
              type="url" 
              $size="md"
              required 
              placeholder="https://github.com/facebook/react" 
              value={githubUrl} 
              onChange={(e) => setGithubUrl(e.target.value)} 
            />
          </Flex>
        )}

        {/* Information Box */}
        <Box $p="md" $bg="bg.overlay" $radius="md" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <Text $size="xs" $color="muted" style={{ lineHeight: 1.6 }}>
            {IS_TAURI 
              ? "We will open your native file browser to select a project folder for AST analysis." 
              : "We will clone this repository into a secure, temporary environment to build your graph."}
          </Text>
        </Box>

        {/* Submit Action */}
        <Button type="submit" $variant="primary" $fill $p="lg">
          <Flex $align="center" $gap="sm">
            {IS_TAURI ? <FolderOpen size={18} /> : <Github size={18} />}
            <Text $weight="bold">
              {IS_TAURI ? "Choose Directory" : "Clone Repository"}
            </Text>
            <ArrowRight size={16} />
          </Flex>
        </Button>

      </Flex>
    </form>
  );
};