import {
  useFolderHasFilesInGraph,
  useIsNodeInGraph,
} from "@core/workspace/hooks/use-workspace-slice";
import { Text } from "@shared/ui";

export const NodeLabel = ({ path, name }: { path: string; name: string }) => {
  const inGraph = useIsNodeInGraph(path);
  const hasFilesInGraph = useFolderHasFilesInGraph(path);
  const isHighlighted = inGraph || hasFilesInGraph;

  return (
    <Text
      $size="md"
      $color={isHighlighted ? "primary" : "secondary"}
      $weight={isHighlighted ? "semibold" : "regular"}
      $truncate
      title={name}
      style={{ flex: 1 }}
    >
      {name}
    </Text>
  );
};
