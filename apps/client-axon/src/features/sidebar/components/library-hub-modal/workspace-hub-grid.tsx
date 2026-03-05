import { Grid } from "@shared/ui";
import { WorkspaceHubCard } from "./workspace-hub-card";
import type { WorkspaceRecord } from "@shared/types/axon-core/workspace-api";

interface WorkspaceHubGridProps {
  workspaces: WorkspaceRecord[];
  activeWorkspaceId?: string;
  allBundles: any[]; // Replace 'any' with your actual Bundle type
  onSelectWorkspace: (id: string) => void;
}

export const WorkspaceHubGrid = ({ 
  workspaces, 
  activeWorkspaceId, 
  allBundles, 
  onSelectWorkspace 
}: WorkspaceHubGridProps) => {
  return (
    <Grid $columns="repeat(auto-fill, minmax(320px, 1fr))" $gap="lg">
      {workspaces.map(ws => {
        const wsBundles = allBundles.filter(b => b.workspaceId === ws.id);
        const totalRules = wsBundles.reduce((acc, b) => acc + b.options.rules.length, 0);
        const isActive = activeWorkspaceId === ws.id;

        return (
          <WorkspaceHubCard 
            key={ws.id}
            workspace={ws}
            isActive={isActive}
            bundleCount={wsBundles.length}
            totalRules={totalRules}
            onClick={() => onSelectWorkspace(ws.id)}
          />
        );
      })}
    </Grid>
  );
};