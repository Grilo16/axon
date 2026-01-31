import { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { useWorkspace } from '@features/workspace/useWorkspace';
import { useAxonCore } from '@features/axon/useAxonCore';
import type { AxonNode, AxonEdge } from '@axon-types/axonTypes';

export const useGraphLayout = () => {
  const { groups, projectRoot, workspaceId } = useWorkspace();
  const { scanGroup } = useAxonCore();

  // React Flow Internal State
  const [nodes, setNodes, onNodesChange] = useNodesState<AxonNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AxonEdge>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setNodes([]);
    setEdges([]);
  }, [workspaceId, setNodes, setEdges]);

  const refreshGraph = useCallback(async () => {
    if (!projectRoot || groups.length === 0) return;
    
    setIsScanning(true);
    let newNodes: AxonNode[] = [];
    let newEdges: AxonEdge[] = [];
    let xOffset = 0;

    for (const group of groups) {
      // 1. Defaults (Config Mode)
      let width = 280;
      let height = 200;
      let children: AxonNode[] = [];
      let groupEdges: AxonEdge[] = [];

      // 2. Scan if Active
      if (group.entryPoint) {
        try {
          const result = await scanGroup({
            groupId: group.id,
            projectRoot,
            entryPoint: group.entryPoint,
            depth: group.depth || 3,
            flatten: !!group.flatten, // Ensure boolean
          });

          if (result.nodes.length > 0) {
            // 3. Auto-Layout Calculation (Bounding Box)
            const xs = result.nodes.map(n => n.position.x);
            const ys = result.nodes.map(n => n.position.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const padding = 40;
            const headerHeight = 60;
            
            width = (maxX - minX) + (padding * 2);
            height = (maxY - minY) + (padding * 2) + headerHeight;

            // Normalize children positions relative to parent
            children = result.nodes.map(n => ({
              ...n,
              parentId: group.id,
              extent: 'parent', // Trap inside group
              position: {
                x: n.position.x - minX + padding,
                y: n.position.y - minY + headerHeight
              },
              data: { ...n.data } // Ensure data reference is fresh
            }));
            
            groupEdges = result.edges;
          }
        } catch (err) {
          console.warn(`[Layout] Skipped group ${group.name}:`, err);
        }
      }

      // 4. Create Container Node
      const groupNode: AxonNode = {
        id: group.id,
        type: 'groupNode',
        position: { x: xOffset, y: 0 },
        data: {
          label: group.name,
          entryPoint: group.entryPoint || null,
          depth: group.depth || 3
        },
        style: { width, height },
        selected: false, // selection handled by React Flow
      };

      newNodes.push(groupNode, ...children);
      newEdges.push(...groupEdges);
      
      // 5. Shift next group to the right
      xOffset += width + 100; 
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setIsScanning(false);
  }, [groups, projectRoot, scanGroup, setNodes, setEdges]);

  // Sync Logic: Re-run layout whenever groups change deep inside Redux
  // We keep this ONE effect because the trigger comes from outside React Flow (Redux)
  useEffect(() => {
    refreshGraph();
  }, [refreshGraph]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isScanning,
    setEdges, // Exposed for manual connections if needed
  };
};