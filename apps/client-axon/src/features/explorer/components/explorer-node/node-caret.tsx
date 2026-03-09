import { useTheme } from "styled-components";
import { ChevronRight, Loader2 } from "lucide-react";
import { Flex } from "@shared/ui";
import { useExplorerDirectory } from "@features/explorer/hooks/use-explorer-directory";

export const NodeCaret = ({
  path,
  isFolder,
  isOpen,
  onToggle,
}: {
  path: string;
  isFolder: boolean;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) => {
  const theme = useTheme();
  const { isLoading } = useExplorerDirectory(path, isOpen);

  if (!isFolder)
    return (
      <Flex
        $align="center"
        $justify="center"
        style={{ width: 16, height: 16 }}
      />
    );

  return (
    <Flex
      $align="center"
      $justify="center"
      onClick={onToggle}
      style={{ width: 16, height: 16 }}
    >
      {isLoading ? (
        <Loader2
          size={12}
          className="animate-spin"
          color={theme.colors.palette.primary.main}
        />
      ) : (
        <ChevronRight
          size={14}
          color={theme.colors.text.muted}
          style={{
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      )}
    </Flex>
  );
};
