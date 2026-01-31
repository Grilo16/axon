import type { AxonNode, AxonEdge } from "@axon-types/axonTypes";

export type GraphHighlightResult = {
  focusId: string;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  distances: Map<string, number>;
  relatedGroupIds: Set<string>;
};

type ComputeArgs = {
  focusId: string;
  nodes: AxonNode[];
  edges: AxonEdge[];
  depth: number;
};

export function computeGraphHighlight({
  focusId,
  nodes,
  edges,
  depth,
}: ComputeArgs): GraphHighlightResult | null {
  const focusNode = nodes.find((n) => n.id === focusId);
  if (!focusNode) return null;

  const highlightedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();
  const distances = new Map<string, number>();
  const relatedGroupIds = new Set<string>();

  // If user clicked a GROUP node: highlight its children (no BFS)
  if (focusNode.type === "groupNode") {
    highlightedNodeIds.add(focusNode.id);
    distances.set(focusNode.id, 0);

    const children = nodes.filter((n) => n.parentId === focusNode.id);
    for (const child of children) {
      highlightedNodeIds.add(child.id);
      distances.set(child.id, 1);
    }

    for (const e of edges) {
      if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
        highlightedEdgeIds.add(e.id);
      }
    }

    relatedGroupIds.add(focusNode.id);
    return { focusId, highlightedNodeIds, highlightedEdgeIds, distances, relatedGroupIds };
  }

  // Otherwise: BFS from a FILE node across edges (undirected neighborhood)
  const adj = new Map<string, string[]>();
  const addAdj = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  };

  for (const e of edges) {
    addAdj(e.source, e.target);
    addAdj(e.target, e.source);
  }

  const q: string[] = [focusId];
  distances.set(focusId, 0);
  highlightedNodeIds.add(focusId);

  while (q.length) {
    const cur = q.shift()!;
    const curD = distances.get(cur)!;
    if (curD >= depth) continue;

    const nbrs = adj.get(cur) ?? [];
    for (const n of nbrs) {
      if (!distances.has(n)) {
        distances.set(n, curD + 1);
        highlightedNodeIds.add(n);
        q.push(n);
      }
    }
  }

  // Highlight edges connecting highlighted nodes
  for (const e of edges) {
    if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
      highlightedEdgeIds.add(e.id);
    }
  }

  // Keep group containers visible for highlighted file nodes
  for (const n of nodes) {
    if (n.type === "fileNode" && highlightedNodeIds.has(n.id) && n.parentId) {
      relatedGroupIds.add(n.parentId);
    }
  }

  return { focusId, highlightedNodeIds, highlightedEdgeIds, distances, relatedGroupIds };
}
