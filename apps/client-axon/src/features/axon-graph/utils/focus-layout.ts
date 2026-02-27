import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs";
import type { AppEdge, AppNode } from "../types";

const elk = new ELK();

const FILE_NODE_WIDTH = 300;
const BASE_HEIGHT = 110;
const SYMBOL_ROW_HEIGHT = 20;
const MAX_SYMBOL_ROWS = 6;

function round(value: number | undefined): number {
  return Math.round(value ?? 0);
}

function estimateNodeHeight(node: AppNode): number {
  const symbols = node.data.symbols ?? [];
  const topLevelCount = symbols.filter((s) => !s.parent).length;
  const rows = Math.min(topLevelCount, MAX_SYMBOL_ROWS);
  return BASE_HEIGHT + rows * SYMBOL_ROW_HEIGHT + 8;
}

// ... Keep the rest of the file exactly as it was!
function applyNodeSize(node: AppNode): AppNode {
  return { ...node, style: { ...(node.style ?? {}), width: FILE_NODE_WIDTH, height: estimateNodeHeight(node) } };
}

export async function layoutVisibleGraph(
  rawNodes: AppNode[],
  edges: AppEdge[],
  options: { previousNodes?: AppNode[]; forceRelayout?: boolean } = {},
): Promise<{ nodes: AppNode[]; edges: AppEdge[] }> {
  const nodes = rawNodes.map(applyNodeSize);

  if (nodes.length === 0) return { nodes: [], edges };

  const prevById = new Map(options.previousNodes?.map((n) => [n.id, n]));

  const sortedNodes = [...nodes].sort((a, b) => {
    const aKey = a.data.path ?? a.data.label ?? a.id;
    const bKey = b.data.path ?? b.data.label ?? b.id;
    return aKey.localeCompare(bKey);
  });

  const elkNodes: ElkNode[] = sortedNodes.map((node) => {
    const prev = prevById.get(node.id);
    const elkNode: ElkNode = {
      id: node.id,
      width: FILE_NODE_WIDTH,
      height: typeof node.style?.height === "number" ? node.style.height : estimateNodeHeight(node),
    };

    if (prev && typeof prev.position?.x === "number" && typeof prev.position?.y === "number") {
      elkNode.x = prev.position.x;
      elkNode.y = prev.position.y;
    }
    return elkNode;
  });

  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id, sources: [edge.source], targets: [edge.target],
  }));

  const graph: ElkNode = {
    id: "root", children: elkNodes, edges: elkEdges,
    layoutOptions: {
      "elk.algorithm": "layered", "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "72", "elk.layered.spacing.nodeNodeBetweenLayers": "130",
      "elk.layered.spacing.edgeNodeBetweenLayers": "50",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.favorStraightEdges": "true",
      "elk.edgeRouting": "SPLINES", "elk.padding": "[top=40,left=40,bottom=40,right=40]",
    },
  };

  const layouted = await elk.layout(graph);
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const finalNodes: AppNode[] = [];

  for (const elkNode of layouted.children ?? []) {
    const original = byId.get(elkNode.id);
    if (!original) continue;

    const finalHeight = round(elkNode.height) || estimateNodeHeight(original);

    finalNodes.push({
      ...original,
      width: FILE_NODE_WIDTH,
      height: finalHeight,
      measured: { width: FILE_NODE_WIDTH, height: finalHeight },
      position: { x: round(elkNode.x), y: round(elkNode.y) },
      style: { ...(original.style ?? {}), width: FILE_NODE_WIDTH, height: finalHeight },
    });
  }

  return { nodes: finalNodes, edges };
}