import React from "react";
import { FolderOpen, Github, ArrowRight } from "lucide-react";
import { Flex, Text, Button, Input, Box } from "@shared/ui";
import { IS_TAURI } from "@app/constants";

interface WorkspaceCreateFormProps {
  newName: string;
  setNewName: (val: string) => void;
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const WorkspaceCreateForm: React.FC<WorkspaceCreateFormProps> = ({ 
  newName, setNewName, githubUrl, setGithubUrl, onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Flex $direction="column" $gap="lg">
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

        <Box $p="md" $bg="bg.overlay" $radius="md" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <Text $size="xs" $color="muted" style={{ lineHeight: 1.6 }}>
            {IS_TAURI 
              ? "We will open your native file browser to select a project folder for AST analysis." 
              : "We will clone this repository into a secure, temporary environment to build your graph."}
          </Text>
        </Box>

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