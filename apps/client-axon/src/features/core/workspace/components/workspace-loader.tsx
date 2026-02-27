import React, { useState } from "react";
import { FolderOpen, Plus, Clock, Trash2, ArrowLeft, ChevronRight, X } from "lucide-react";
import * as S from "./workspace-loader.styles";
import { open } from "@tauri-apps/plugin-dialog";
import { useWorkspaceManager } from "../hooks/use-workspace-manager";

interface Props {
  onClose?: () => void; // ✨ Make it act as a closeable modal!
}

export const WorkspaceLoader: React.FC<Props> = ({ onClose }) => {
  const { workspaces, create, open: openWorkspace, remove } = useWorkspaceManager();
  const [mode, setMode] = useState<"list" | "create">(workspaces.length > 0 ? "list" : "create");
  const [newName, setNewName] = useState("");

  const sortedWorkspaces = [...workspaces].sort(
    (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Select Project Root for Axon",
      });

      if (selectedPath && typeof selectedPath === "string") {
        const finalName = newName.trim() || selectedPath.split(/[/\\]/).pop() || "Untitled Project";
        create(finalName, selectedPath);
        onClose?.(); // Close modal after creating
      }
    } catch (err) {
      console.error("Failed to pick directory:", err);
    }
  };

  const handleOpenWorkspace = (id: string) => {
    openWorkspace(id);
    onClose?.(); // Close modal after opening
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
            {/* ✨ The Close Button */}
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
                {sortedWorkspaces.map((ws) => (
                  <S.Row key={ws.id} onClick={() => handleOpenWorkspace(ws.id)}>
                    <S.RowIcon><FolderOpen size={16} /></S.RowIcon>
                    <S.RowInfo>
                      <S.RowName>{ws.name}</S.RowName>
                      <S.RowPath>{ws.projectRoot}</S.RowPath>
                    </S.RowInfo>
                    <S.DeleteButton onClick={(e) => { e.stopPropagation(); remove(ws.id); }} title="Remove from history">
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
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <S.InputGroup>
                <S.Label>Workspace Name</S.Label>
                <S.Input autoFocus type="text" placeholder="e.g. Frontend Architecture" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </S.InputGroup>
              <S.HelperText>Clicking continue will open your native file browser. Select the root folder of your project.</S.HelperText>
              <S.ButtonMain type="submit">
                <FolderOpen size={18} /> Choose Directory...
              </S.ButtonMain>
            </form>
          )}
        </S.Content>
      </S.Card>
    </S.Overlay>
  );
};