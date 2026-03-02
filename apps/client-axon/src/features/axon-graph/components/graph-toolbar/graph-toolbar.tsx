import React from "react";
import { 
  Trash2,
} from "lucide-react";
import { useStore } from "@xyflow/react";

import * as S from "./graph-toolbar.styles";

import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";

type Props = {
};

export const GraphToolbar: React.FC<Props> = ({
}) => {
  const visibleNodeCount = useStore((s) => s.nodeLookup.size);
  const visibleEdgeCount = useStore((s) => s.edges.length);
  const { activePaths, setPaths } = useBundleSession();

  const handleClearGraph = () => {
    setPaths([]);
  };

  return (
    <S.ToolbarPanel position="top-right">
      <S.ToolbarCard>
        <S.ToolbarStatsRow>
          <span>Seeds: {activePaths.length}</span>
          <span>Nodes: {visibleNodeCount}</span>
          <span>Edges: {visibleEdgeCount}</span>
        </S.ToolbarStatsRow>

        <S.ToolbarButtons>
          <S.ToolbarButton type="button" onClick={handleClearGraph} title="Clear all nodes from canvas">
            <Trash2 size={14} /> Clear
          </S.ToolbarButton>
        </S.ToolbarButtons>
      </S.ToolbarCard>
    </S.ToolbarPanel>
  );
};