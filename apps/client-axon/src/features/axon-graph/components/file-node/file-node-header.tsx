import { memo } from "react";
import { FileCode, X } from "lucide-react";
import { useGraphInteractions } from "../../hooks/use-graph-interactions";
import { Flex, Text, Button } from "@shared/ui";

type Props = {
  fileId: string;
  label: string;
  isZoomedOut: boolean;
};

export const FileNodeHeader = memo(({ fileId, label, isZoomedOut }: Props) => {
  const { removeNodesFromBundle } = useGraphInteractions();

  return (
    <Flex 
      $align="center" 
      $justify="space-between" 
      $gap="sm"
      $bg={isZoomedOut ? "transparent" : "bg.surfaceHover"}
      $p={isZoomedOut ? "lg md" : "sm md"}
      style={{
        borderBottom: isZoomedOut ? 'none' : '1px solid #333',
        borderRadius: isZoomedOut ? '8px' : '8px 8px 0 0'
      }}
    >
      <Flex $align="center" $gap="sm" style={{ minWidth: 0, flex: 1 }}>
        {!isZoomedOut && <FileCode size={14} color="#9ca3af" />}
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
    </Flex>
  );
});

FileNodeHeader.displayName = "FileNodeHeader";