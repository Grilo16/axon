import React from "react";
import { Trash2 } from "lucide-react";
import { useStore, Panel } from "@xyflow/react";

import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { Flex, Card, Text, Button } from "@shared/ui";

export const GraphToolbar: React.FC = () => {
  const visibleNodeCount = useStore((s) => s.nodeLookup.size);
  const visibleEdgeCount = useStore((s) => s.edges.length);
  const { activePaths, setPaths } = useBundleSession();

  const handleClearGraph = () => {
    setPaths([]);
  };

  return (
    <Panel position="top-right" style={{ margin: 16 }}>
      <Card $elevation="lg">
        <Flex $direction="column" $gap="sm" $p="sm" style={{ minWidth: 280 }}>
          
          <Flex $justify="space-between" $gap="md">
            <Text $size="sm" $color="muted">Seeds: {activePaths.length}</Text>
            <Text $size="sm" $color="muted">Nodes: {visibleNodeCount}</Text>
            <Text $size="sm" $color="muted">Edges: {visibleEdgeCount}</Text>
          </Flex>

          <Flex $gap="sm" $wrap="wrap">
            <Button 
              $variant="ghost" 
              onClick={handleClearGraph} 
              title="Clear all nodes from canvas"
              style={{ padding: '4px 8px', height: 30, fontSize: 12 }}
            >
              <Trash2 size={14} /> Clear
            </Button>
          </Flex>

        </Flex>
      </Card>
    </Panel>
  );
};