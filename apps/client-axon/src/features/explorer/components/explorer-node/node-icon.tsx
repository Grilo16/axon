import { useTheme } from "styled-components";
import { Folder, FolderOpen, FileCode } from "lucide-react";
import { Flex } from "@shared/ui";
import { useIsNodeInGraph } from "@core/workspace/hooks/use-workspace-slice";

export const NodeIcon = ({
  path,
  isFolder,
  isOpen,
}: {
  path: string;
  isFolder: boolean;
  isOpen: boolean;
}) => {
  const theme = useTheme();
    const inGraph = useIsNodeInGraph(path);
  

  return (
    <Flex $align="center" $justify="center" style={{ width: 16, height: 16 }}>
      {isFolder ? (
        isOpen ? (
          <FolderOpen size={14} color={theme.colors.palette.primary.light} />
        ) : (
          <Folder size={14} color={theme.colors.text.muted} />
        )
      ) : (
        <FileCode
          size={14}
          color={
            inGraph
              ? theme.colors.palette.success.main
              : theme.colors.text.disabled
          }
        />
      )}
    </Flex>
  );
};
