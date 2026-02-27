import React from "react";
import { 
  Trash2, Network, 
  RefreshCw, LayoutTemplate, Loader2 
} from "lucide-react";
import { useStore } from "@xyflow/react";

import * as S from "./graph-toolbar.styles";

// IMPORT OUR ARCHITECTURE
import { 
  useLoadWorkspaceMutation, 
  useLazyGetAllFilePathsQuery 
} from "@features/core/workspace/api/workspace-api";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";

type Props = {
  isLayouting: boolean;
  onRelayout: () => void;     // Canvas holds the layout engine
};

export const GraphToolbar: React.FC<Props> = ({
  isLayouting, 
  onRelayout 
}) => {
  // 1. React Flow Internal State (No more prop drilling!)
  const visibleNodeCount = useStore((s) => s.nodeLookup.size);
  const visibleEdgeCount = useStore((s) => s.edges.length);

  // 2. Workspace Session State
  const { activePaths, setPaths } = useBundleSession();
  const { activeWorkspace } = useWorkspaceManager();
  const { projectRoot } = activeWorkspace || {}

  // 3. Backend APIs
  const [triggerReload, { isLoading: isReloading }] = useLoadWorkspaceMutation();
  const [triggerGetPaths, { isLoading: isFetchingPaths }] = useLazyGetAllFilePathsQuery();

  // --- Handlers ---

  const handleClearGraph = () => {
    setPaths([]);
  };

  const handleLoadFullGraph = async () => {
    const input = prompt("Enter max files to load (leave blank for all):", "100");
    if (input === null) return; // User cancelled
    
    const limit = input.trim() ? parseInt(input, 10) : undefined;
    
   try {
      const allFiles = await triggerGetPaths({ limit }).unwrap();
      if (allFiles) {
        setPaths(allFiles); 
      }
    } catch (e) { console.error(e); }
  };

  const handleReloadWorkspace = async () => {
    if (!projectRoot) return;
    try {
      await triggerReload({ path: projectRoot }).unwrap();
    } catch (e) {
      console.error("Failed to reload workspace", e);
    }
  };

  const isBusy = isLayouting || isReloading || isFetchingPaths;

  return (
    <S.ToolbarPanel position="top-right">
      <S.ToolbarCard>
        <S.ToolbarStatsRow>
          <span>Seeds: {activePaths.length}</span>
          <span>Nodes: {visibleNodeCount}</span>
          <span>Edges: {visibleEdgeCount}</span>
        </S.ToolbarStatsRow>

        <S.ToolbarButtons>
          <S.ToolbarButton type="button" onClick={handleLoadFullGraph} disabled={isBusy} title="Load all files into the graph">
            {isFetchingPaths ? <Loader2 size={14} className="animate-spin" /> : <Network size={14} />} 
            Full Graph
          </S.ToolbarButton>

          <S.ToolbarButton type="button" onClick={onRelayout} disabled={isBusy} title="Re-run the layout engine">
            <LayoutTemplate size={14} /> Layout
          </S.ToolbarButton>

          <S.ToolbarButton type="button" onClick={handleReloadWorkspace} disabled={isBusy} title="Re-scan the workspace from disk">
            <RefreshCw size={14} className={isReloading ? "animate-spin" : ""} /> 
            Reload
          </S.ToolbarButton>

          <S.ToolbarButton type="button" onClick={handleClearGraph} disabled={isBusy} title="Clear all nodes from canvas">
            <Trash2 size={14} /> Clear
          </S.ToolbarButton>
        </S.ToolbarButtons>
      </S.ToolbarCard>
    </S.ToolbarPanel>
  );
};