import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { AxonGraphView } from "@shared/types/axon-core/graph";
import { getLayoutedElements } from "../utils/layout";
import * as S from "../styles";
import { FileNode } from "./file-node";
import { FolderNode } from "./folder-node";
import { Loader2 } from "lucide-react";
import { BiColorEdge } from "./bi-color-edge";

const nodeTypes = {
  fileNode: FileNode,
  folderNode: FolderNode,
};

const edgeTypes = {
 axonBiColor: BiColorEdge,
}

interface Props {
  graphData: AxonGraphView | null;
}

export const GraphCanvas: React.FC<Props> = ({ graphData }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLayouting, setIsLayouting] = useState(false);

  useEffect(() => {
    const runLayout = async () => {
      if (!graphData || graphData.nodes.length === 0) return;
      setIsLayouting(true);

      const folderMap = new Map<string, Node>();
      const flowNodes: Node[] = [];

      graphData.nodes.forEach((file) => {
        const parts = file.path.replace(/\\/g, '/').split('/');
        parts.pop(); 
        let currentPath = '';
        parts.forEach((folderName) => {
          const parentPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

          if (!folderMap.has(currentPath)) {
            folderMap.set(currentPath, {
              id: currentPath,
              type: 'folderNode',
              data: { label: folderName },
              position: { x: 0, y: 0 }, 
              ...(parentPath ? { parentId: parentPath } : {}), 
            });
          }
        });

        flowNodes.push({
          id: file.id.toString(),
          type: 'fileNode',
          data: file,
          position: { x: 0, y: 0 },
          ...(currentPath ? { parentId: currentPath } : {}),
        });
      });

      const rawEdges: Edge[] = graphData.edges.map(e => ({
        id: e.id,
        source: e.source.toString(),
        target: e.target.toString(),
        // type: 'smoothstep', // Keep the neat circuit-board edges!
        animated: true,
        style: { stroke: '#4b5563', strokeWidth: 1.5 },
      }));

      const allNodes = [...Array.from(folderMap.values()), ...flowNodes];
      
      // AWAIT ELK ENGINE
      const layouted = await getLayoutedElements(allNodes, rawEdges);
      
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setIsLayouting(false);
    };

    runLayout();
  }, [graphData]);
  if (!graphData || nodes.length === 0) return null;

  return (
    <S.GraphContainer>
        {isLayouting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 text-blue-400">
          <Loader2 size={32} className="animate-spin mb-4" />
          <span className="font-bold tracking-widest uppercase text-xs">Computing ELK Layout...</span>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{ type: "axonBiColor" }}
        colorMode="dark"
        minZoom={0.05}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={2}
          color="#222"
        />
        <Controls
          style={{ background: "#222", border: "1px solid #444", fill: "#ccc" }}
        />
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{ background: "#111" }}
        />
      </ReactFlow>
    </S.GraphContainer>
  );
};
