import { memo } from "react";
import styled from "styled-components";
import { FileCode, X } from "lucide-react";
import { useGraphInteractions } from "../../hooks/use-graph-interactions";
import { Flex, Text, Button } from "@shared/ui";

type Props = {
  fileId: string;
  label: string;
  isZoomedOut: boolean;
};

const HeaderRow = styled(Flex)<{ $isZoomedOut: boolean }>`
  border-bottom: ${({ $isZoomedOut, theme }) => $isZoomedOut ? 'none' : `1px solid ${theme.colors.border.default}`};
  border-radius: ${({ $isZoomedOut, theme }) => $isZoomedOut ? theme.radii.lg : `${theme.radii.lg} ${theme.radii.lg} 0 0`};
`;

const FileIcon = styled(FileCode)`
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const FileNodeHeader = memo(({ fileId, label, isZoomedOut }: Props) => {
  const { removeNodesFromBundle } = useGraphInteractions();

  return (
    <HeaderRow
      $isZoomedOut={isZoomedOut}
      $align="center"
      $justify="space-between"
      $gap="sm"
      $bg={isZoomedOut ? "transparent" : "bg.surfaceHover"}
      $p={isZoomedOut ? "lg md" : "sm md"}
    >
      <Flex $align="center" $gap="sm" style={{ minWidth: 0, flex: 1 }}>
        {!isZoomedOut && <FileIcon size={14} />}
        <Text 
          $size={isZoomedOut ? "h1" : "md"} 
          $weight="bold" 
          $color="primary" 
          $truncate
          title={label}
        >
          {label}
        </Text>
      </Flex>

      <Flex className="nodrag" $align="center">
        <Button 
          $variant="icon" 
          title="Close Node" 
          onClick={() => removeNodesFromBundle([fileId])} // 🌟 Use the new FSD method
        >
          <X size={14} />
        </Button>
      </Flex>
    </HeaderRow>
  );
});

FileNodeHeader.displayName = "FileNodeHeader";