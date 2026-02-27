import { useState, useCallback, useRef, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  type NodeChange,
} from "@xyflow/react";
import type { AppNode, AppEdge } from "../types";
import { layoutVisibleGraph } from "../utils/focus-layout";

// IMPORT THE REDUX HOOK
import { useWorkspaceSession } from "@features/core/workspace";

export function useGraphLayout() {
  const [nodes, setNodes] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  const [isLayouting, setIsLayouting] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  // Grab the Global Selection State
  const { selectedPaths } = useWorkspaceSession();

  const nodesRef = useRef<AppNode[]>([]);
  const edgesRef = useRef<AppEdge[]>([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const selectedPathsRef = useRef<string[]>([]);
  useEffect(() => {
    selectedPathsRef.current = selectedPaths;
  }, [selectedPaths]);
  // --- THE 3-TIER HIGHLIGHT ALGORITHM ---
  const applyHighlights = useCallback(
    (
      currentNodes: AppNode[],
      currentEdges: AppEdge[],
      selectedPaths: string[],
    ) => {
      // Scenario A: Nothing selected. Everything is fully visible.
      if (selectedPaths.length === 0) {
        return {
          nodes: currentNodes.map((n) => ({
            ...n,
            selected: false,
            className: "",
          })),
          edges: currentEdges.map((e) => ({ ...e, className: "" })),
        };
      }

      // --- THE FOLDER MAGIC ---
      // Helper to check if a node is selected (Exact match OR child of a selected folder)
      const isNodeSelected = (nodeId: string) => {
        return selectedPaths.some((path) => {
          if (nodeId === path) return true;

          // Normalize slashes for cross-platform Tauri compatibility (Windows \ vs Mac /)
          const normalizedNode = nodeId.replace(/\\/g, "/");
          const normalizedPath = path.replace(/\\/g, "/");

          return normalizedNode.startsWith(normalizedPath + "/");
        });
      };

      // Figure out exactly which nodes on the canvas should be active
      const activelySelectedNodes = new Set<string>();
      currentNodes.forEach((n) => {
        if (isNodeSelected(n.id)) activelySelectedNodes.add(n.id);
      });

      // Scenario B: Find all 1st-degree connected nodes
      const firstDegreeNodes = new Set<string>();
      const highlightedEdges = new Set<string>();

      currentEdges.forEach((e) => {
        if (activelySelectedNodes.has(e.source)) {
          highlightedEdges.add(e.id);
          firstDegreeNodes.add(e.target);
        } else if (activelySelectedNodes.has(e.target)) {
          highlightedEdges.add(e.id);
          firstDegreeNodes.add(e.source);
        }
      });

      // Scenario C: Apply the visual tiers and the `selected` drag property
      return {
        nodes: currentNodes.map((n) => {
          const isSelected = activelySelectedNodes.has(n.id);
          const isFirstDegree = !isSelected && firstDegreeNodes.has(n.id);

          let targetClass = "";
          if (!isSelected) {
            targetClass = isFirstDegree ? "semi-dimmed-node" : "dimmed-node";
          }

          return {
            ...n,
            selected: isSelected, // MAGIC: All files in the folder are now draggable as a group!
            className: targetClass,
          };
        }),
        edges: currentEdges.map((e) => {
          return {
            ...e,
            className: highlightedEdges.has(e.id) ? "" : "dimmed-edge",
          };
        }),
      };
    },
    [],
  );

  // --- REACT TO REDUX SELECTION CHANGES ---
  useEffect(() => {
    setNodes(
      (prevNodes) =>
        applyHighlights(prevNodes, edgesRef.current, selectedPaths).nodes,
    );
    setEdges(
      (prevEdges) =>
        applyHighlights(nodesRef.current, prevEdges, selectedPaths).edges,
    );
  }, [selectedPaths, applyHighlights, setNodes, setEdges]);

  // --- LAYOUT ENGINE ---
  const applyLayout = useCallback(
    async (
      rawNodes: AppNode[],
      rawEdges: AppEdge[],
      forceRelayout: boolean,
    ) => {
      if (rawNodes.length === 0) {
        setNodes([]);
        setEdges([]);
        setLayoutError(null);
        setIsLayouting(false);
        return;
      }

      const shouldShowSpinner = forceRelayout || nodesRef.current.length === 0;
      if (shouldShowSpinner) setIsLayouting(true);
      setLayoutError(null);

      try {
        const layouted = await layoutVisibleGraph(rawNodes, rawEdges, {
          previousNodes: nodesRef.current,
          forceRelayout,
        });

        const highlighted = applyHighlights(
          layouted.nodes,
          layouted.edges,
          selectedPathsRef.current,
        );
        setNodes(highlighted.nodes);
        setEdges(highlighted.edges);
      } catch (error) {
        console.error("[Axon Focus Graph] Layout failed:", error);
        setLayoutError(
          error instanceof Error ? error.message : "Unknown layout error",
        );
      } finally {
        if (shouldShowSpinner) setIsLayouting(false);
      }
    },
    [setNodes, setEdges, applyHighlights],
  );

  // --- REDUX PROTECTION ---
  const onNodesChangeSafe = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      // We strip out React Flow's native selection changes so Redux remains the single source of truth
      const layoutChanges = changes.filter((c) => c.type !== "select");
      setNodes((prev) => applyNodeChanges(layoutChanges, prev) as AppNode[]);
    },
    [setNodes],
  );

  return {
    nodes,
    edges,
    isLayouting,
    layoutError,
    onNodesChange: onNodesChangeSafe,
    onEdgesChange,
    applyLayout,
  };
}
