import styled, { useTheme } from "styled-components";
import { Plus, Check, Minus, Loader2 } from "lucide-react";
import { Button } from "@shared/ui";
import { useFolderHasFilesInGraph, useIsNodeInGraph } from "@core/workspace/hooks/use-workspace-slice";
import { useExplorerActions } from "@features/explorer/hooks/use-explorer-actions";

const ActionButton = styled(Button)`
  opacity: 0;
  pointer-events: none;
  padding: 4px;
  transition: opacity 0.2s ease;
`;

export const NodeActions = ({
  path,
  isFolder,
}: {
  path: string;
  isFolder: boolean;
}) => {
  const theme = useTheme();
  const inGraph = useIsNodeInGraph(path);
  const hasFilesInGraph = useFolderHasFilesInGraph(path);
  const { toggleFile, toggleFolder, isFolderToggling } = useExplorerActions();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isFolder) {
      toggleFolder(path, hasFilesInGraph);
    } else {
      toggleFile(path);
    }
  };

  return (
   <ActionButton
      className= {`node-actions ${path === "axon-tutorial/src" ? "tour-add-btn" : ""}`}
      $variant="icon"
      onClick={handleToggle}
      disabled={isFolderToggling}
      title={isFolder ? (hasFilesInGraph ? "Remove all from graph" : "Add all to graph") : (inGraph ? "Remove from graph" : "Add to graph")}
    >
      {isFolderToggling ? (
         <Loader2 size={14} className="animate-spin" color={theme.colors.palette.primary.main} />
      ) : isFolder ? (
        hasFilesInGraph ? (
          <Minus size={14} color={theme.colors.palette.success.main} />
        ) : (
          <Plus size={14} color={theme.colors.text.muted} />
        )
      ) : inGraph ? (
        <Check size={14} color={theme.colors.palette.success.main} />
      ) : (
        <Plus size={14} color={theme.colors.text.muted} />
      )}
    </ActionButton>
  );
};
