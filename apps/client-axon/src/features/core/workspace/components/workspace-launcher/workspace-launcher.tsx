import type { WorkspaceRecord } from "@shared/types/axon-core/workspace-api";
import { ActivePill, WorkspaceIcon } from "./workspace-launcher.styles";
import { useWorkspaceManager } from "../../hooks/use-workspace-manager";

function getInitials(name: string) {
  const clean = (name ?? "").trim();
  if (!clean) return "WS";
  const parts = clean.split(/[\s\-_./]+/).filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
interface props {
  workspace: WorkspaceRecord;
}

export const WorkspaceLauncher = ({ workspace }: props) => {
  const { id, name } = workspace;
  const { activeWorkspace, open } = useWorkspaceManager();
  const isActive = id === activeWorkspace?.id;
  return (
    <WorkspaceIcon
      key={id}
      $active={isActive}
      onClick={() => {
        open(id);
      }}
      title={name}
    >
      {isActive && <ActivePill />}
      {getInitials(name)}
    </WorkspaceIcon>
  );
};
