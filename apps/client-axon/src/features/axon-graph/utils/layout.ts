import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';

const elk = new ELK();

const NODE_WIDTH = 250;
const ROW_HEIGHT = 24;
const BASE_HEIGHT = 60;

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  const elkNodesMap = new Map<string, any>();

  // 1. Build the Node Map
  nodes.forEach((node) => {
    if (node.type === 'folderNode') {
      elkNodesMap.set(node.id, {
        id: node.id,
        layoutOptions: {
          'elk.padding': '[top=40,left=16,bottom=16,right=16]', 
        },
        children: [],
      });
    } else {
      const symbolCount = (node.data as any).symbols?.filter((s: any) => !s.parent).length || 0;
      const MAX_SYMBOLS_HEIGHT = 150; 
      const symbolsHeight = Math.min(symbolCount * ROW_HEIGHT, MAX_SYMBOLS_HEIGHT);
      
      const estimatedHeight = BASE_HEIGHT + symbolsHeight;
      
      elkNodesMap.set(node.id, {
        id: node.id,
        width: NODE_WIDTH,
        height: estimatedHeight,
      });
    }
  });

  // 2. Nest the Nodes
  const rootNodes: any[] = [];
  nodes.forEach((node) => {
    const elkNode = elkNodesMap.get(node.id);
    if (node.parentId) {
      const parent = elkNodesMap.get(node.parentId);
      if (parent) {
        parent.children.push(elkNode);
      }
    } else {
      rootNodes.push(elkNode);
    }
  });

  // 3. Map the Edges
  const elkEdges = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  // 4. Configure the Main Graph Layout
  const graph = {
    id: 'root',
    children: rootNodes,
    edges: elkEdges,
  };
  const layoutedGraph = await elk.layout(graph);
  const finalNodes: Node[] = [];
  const flatten = (elkNode: any) => {
    const originalNode = nodes.find(n => n.id === elkNode.id);
    if (originalNode) {
      finalNodes.push({
        ...originalNode,
        position: { x: elkNode.x, y: elkNode.y }, 
        style: originalNode.type === 'folderNode' 
          ? { width: elkNode.width, height: elkNode.height } 
          : undefined,
      });
    }
    if (elkNode.children) {
      elkNode.children.forEach((c: any) => flatten(c));
    }
  };

  layoutedGraph.children?.forEach((c: any) => flatten(c));

  return { nodes: finalNodes, edges };
};