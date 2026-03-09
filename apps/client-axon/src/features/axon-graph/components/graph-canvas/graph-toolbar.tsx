import React from "react";
import { Trash2 } from "lucide-react";
import { useStore, Panel } from "@xyflow/react";

import { Flex, Card, Text, Button } from "@shared/ui";
import { useActiveBundleQuery } from "@features/core/bundles/hooks/use-bundle-queries";
import { useActiveBundleActions } from "@features/core/bundles/hooks/use-active-bundle-actions";

export const GraphToolbar: React.FC = () => {
  const visibleNodeCount = useStore((s) => s.nodeLookup.size);
  const visibleEdgeCount = useStore((s) => s.edges.length);
  const {activeBundle} = useActiveBundleQuery()
  const {clearTargetFiles} = useActiveBundleActions()

  

  return (
    <Panel position="top-right" style={{ margin: 16 }}>
      <Card $elevation="lg">
        <Flex $direction="column" $gap="sm" $p="sm" style={{ minWidth: 280 }}>
          
          <Flex $justify="space-between" $gap="md">
            <Text $size="sm" $color="muted">Seeds: {activeBundle?.options?.targetFiles.length}</Text>
            <Text $size="sm" $color="muted">Nodes: {visibleNodeCount}</Text>
            <Text $size="sm" $color="muted">Edges: {visibleEdgeCount}</Text>
          </Flex>

          <Flex $gap="sm" $wrap="wrap">
            <Button 
              $variant="ghost" 
              onClick={clearTargetFiles} 
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