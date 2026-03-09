import styled, { useTheme } from "styled-components";
import { Plus, Check, Minus } from "lucide-react";
import { Button } from "@shared/ui";
import { useFolderHasFilesInGraph, useIsNodeInGraph } from "@features/core/workspace/hooks/use-workspace-slice";
import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";

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
  const {addTargetFiles} = useActiveBundleActions()

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    addTargetFiles([path]);
  };

  return (
    <ActionButton
      className="node-actions"
      $variant="icon"
      onClick={handleToggle}
    >
      { isFolder ? (
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
