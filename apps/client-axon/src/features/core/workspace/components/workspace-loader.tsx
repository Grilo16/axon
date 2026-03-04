import React, { useState } from "react";
import { FolderOpen, Plus, Clock, Trash2, ArrowLeft, ChevronRight, X, Github } from "lucide-react";
import * as S from "./workspace-loader.styles";
import { open } from "@tauri-apps/plugin-dialog";
import { useWorkspaceManager } from "../hooks/use-workspace-manager";
import { IS_TAURI } from "@app/constants";

interface Props {
  onClose?: () => void;
}


export const WorkspaceLoader: React.FC<Props> = ({ onClose }) => {
  const { workspaces, create, open: openWorkspace, remove } = useWorkspaceManager();
  const [mode, setMode] = useState<"list" | "create">(workspaces.length > 0 ? "list" : "create");
  
  // Form State
  const [newName, setNewName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const sortedWorkspaces = [...workspaces].sort(
    (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (IS_TAURI) {
      // --- DESKTOP LOGIC (Tauri) ---
      try {
        const selectedPath = await open({
          directory: true,
          multiple: false,
          title: "Select Project Root for Axon",
        });

        if (selectedPath && typeof selectedPath === "string") {
          const finalName = newName.trim() || selectedPath.split(/[/\\]/).pop() || "Untitled Project";
          create(finalName, selectedPath); // projectRoot becomes the local path
          onClose?.();
        }
      } catch (err) {
        console.error("Failed to pick directory:", err);
      }
    } else {
      // --- WEB LOGIC (Axum/GitHub) ---
      if (!githubUrl.trim()) return;
      
      const urlParts = githubUrl.trim().split('/');
      const repoName = urlParts.pop() || "GitHub Repository";
      const finalName = newName.trim() || repoName;
      
      create(finalName, githubUrl.trim()); // projectRoot becomes the GitHub URL
      onClose?.();
    }
  };

  const handleOpenWorkspace = (id: string) => {
    openWorkspace(id);
    onClose?.();
  };

  return (
    <S.Overlay onClick={onClose}>
      <S.Card onClick={(e) => e.stopPropagation()}>
        <S.Header>
          <S.Title>
            {mode === "list" ? <Clock size={20} className="text-blue-500" /> : <FolderOpen size={20} className="text-blue-500" />}
            {mode === "list" ? "Recent Workspaces" : "Create Workspace"}
          </S.Title>
          <div style={{ display: 'flex', gap: '8px' }}>
            {mode === "create" && workspaces.length > 0 && (
              <S.ButtonGhost type="button" onClick={() => setMode("list")}>
                <ArrowLeft size={16} /> Back
              </S.ButtonGhost>
            )}
            {onClose && (
              <S.ButtonGhost type="button" onClick={onClose}>
                <X size={18} />
              </S.ButtonGhost>
            )}
          </div>
        </S.Header>

        <S.Content>
          {mode === "list" && (
            <>
              <S.List>
                {/* ... existing List render logic ... */}
                {sortedWorkspaces.map((ws) => (
                  <S.Row key={ws.id} onClick={() => handleOpenWorkspace(ws.id)}>
                    <S.RowIcon><FolderOpen size={16} /></S.RowIcon>
                    <S.RowInfo>
                      <S.RowName>{ws.name}</S.RowName>
                      <S.RowPath>{ws.projectRoot}</S.RowPath>
                    </S.RowInfo>
                    <S.DeleteButton onClick={(e) => { e.stopPropagation(); remove(ws.id); }}>
                      <Trash2 size={16} />
                    </S.DeleteButton>
                    <ChevronRight size={16} className="text-gray-600" />
                  </S.Row>
                ))}
              </S.List>
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #2b2b2b" }}>
                <S.ButtonMain onClick={() => setMode("create")}>
                  <Plus size={18} /> New Workspace
                </S.ButtonMain>
              </div>
            </>
          )}

          {mode === "create" && (
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px" }}>
              <S.InputGroup>
                <S.Label>Workspace Name (Optional)</S.Label>
                <S.Input 
                  autoFocus 
                  type="text" 
                  placeholder="e.g. Frontend Architecture" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                />
              </S.InputGroup>

              {/* ✨ CONDITIONAL RENDERING MAGIC ✨ */}
              {!IS_TAURI && (
                <S.InputGroup>
                  <S.Label>GitHub Repository URL</S.Label>
                  <S.Input 
                    type="url" 
                    required 
                    placeholder="https://github.com/facebook/react" 
                    value={githubUrl} 
                    onChange={(e) => setGithubUrl(e.target.value)} 
                  />
                </S.InputGroup>
              )}

              <S.HelperText>
                {IS_TAURI 
                  ? "Clicking continue will open your native file browser to select a project folder." 
                  : "We will clone this repository into a secure, temporary environment for analysis."}
              </S.HelperText>

              <S.ButtonMain type="submit">
                {IS_TAURI ? <FolderOpen size={18} /> : <Github size={18} />}
                {IS_TAURI ? " Choose Directory..." : " Clone Repository"}
              </S.ButtonMain>
            </form>
          )}
        </S.Content>
      </S.Card>
    </S.Overlay>
  );
};