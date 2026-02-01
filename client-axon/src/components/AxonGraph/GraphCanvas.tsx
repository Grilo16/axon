import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled, { useTheme } from "styled-components";

import { FileNode } from "./FileNode";
import { GroupNode } from "./GroupNode";
import { GraphToolbar } from "./GraphToolbar";
import { BiColorEdge } from "./BiColorEdge";

import { useWorkspace } from "@features/workspace/useWorkspace";
import { useGraphLayout } from "@features/visualizer/useGraphLayout";
import { useAppDispatch } from "@app/hooks";
import { setSelectedNode } from "@features/workspace/workspacesSlice";

import { Surface } from "@components/ui/Surface";
import { Subtext } from "@components/ui/Typography";
import { FileSelectorModal } from "@components/FileSelector/FileSelectorModal";
import { useFileSystem } from "@features/axon/useFileSystem";
import { useToggle } from "@app/hooks";
import { VscFolderOpened, VscPlay } from "react-icons/vsc";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.bg.main};

  .react-flow__node {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    transition: opacity 140ms ease, filter 140ms ease;
  }

  .react-flow__edge-path {
    transition: opacity 140ms ease, stroke-width 140ms ease;
  }

  .react-flow__node.axon-dim {
    opacity: 0.12;
    filter: grayscale(0.15);
  }

  .react-flow__node.axon-highlight {
    opacity: 1;
  }

  .react-flow__node.axon-focus {
    opacity: 1;
    filter: drop-shadow(0 0 10px rgba(0, 122, 204, 0.35));
  }
`;

const FocusCard = styled(Surface)`
  width: 310px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Slider = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.palette.primary};
`;

const Pill = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
`;

const SetupOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 5;
`;

const SetupCard = styled(Surface)`
  width: min(720px, calc(100vw - 80px));
  pointer-events: auto;
`;

const SetupTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
`;

const SetupGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 10px;
  margin-top: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 10px 10px;
  background: ${({ theme }) => theme.colors.bg.main};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Button = styled.button<{ $primary?: boolean }>`
  border: 1px solid ${({ theme, $primary }) =>
    $primary ? "transparent" : theme.colors.border};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.palette.primary : "transparent"};
  color: ${({ theme, $primary }) => ($primary ? "#fff" : theme.colors.text.primary)};
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-weight: 800;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:enabled {
    filter: brightness(1.06);
  }
`;

const Inline = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 700;
  text-transform: uppercase;
`;

function collectAncestors(startId: string, parentById: Map<string, string | undefined>) {
  const out = new Set<string>();
  let cur: string | undefined = startId;
  while (cur) {
    const p = parentById.get(cur);
    if (!p) break;
    out.add(p);
    cur = p;
  }
  return out;
}

function computeHighlight(
  focusId: string,
  nodes: Node[],
  edges: Edge[],
  depth: number
) {
  const byId = new Map<string, any>();
  const parentById = new Map<string, string | undefined>();
  const childrenByParent = new Map<string, string[]>();

  for (const n of nodes as any[]) {
    byId.set(n.id, n);
    parentById.set(n.id, n.parentId);
    if (n.parentId) {
      if (!childrenByParent.has(n.parentId)) childrenByParent.set(n.parentId, []);
      childrenByParent.get(n.parentId)!.push(n.id);
    }
  }

  const focus = byId.get(focusId);
  if (!focus) return null;

  const highlightedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();
  const relatedGroupIds = new Set<string>();

  if (focus.type === "groupNode") {
    const q: string[] = [focusId];
    highlightedNodeIds.add(focusId);
    relatedGroupIds.add(focusId);

    while (q.length) {
      const cur = q.shift()!;
      const kids = childrenByParent.get(cur) ?? [];
      for (const k of kids) {
        highlightedNodeIds.add(k);
        q.push(k);
      }
    }

    for (const a of collectAncestors(focusId, parentById)) relatedGroupIds.add(a);

    for (const e of edges as any[]) {
      if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
        highlightedEdgeIds.add(e.id);
      }
    }

    return { highlightedNodeIds, highlightedEdgeIds, relatedGroupIds };
  }

  const adj = new Map<string, string[]>();
  const add = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  };

  for (const e of edges as any[]) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    const s = byId.get(e.source);
    const t = byId.get(e.target);
    if (s?.type === "groupNode" || t?.type === "groupNode") continue;

    add(e.source, e.target);
    add(e.target, e.source);
  }

  const dist = new Map<string, number>();
  const q: string[] = [focusId];
  dist.set(focusId, 0);
  highlightedNodeIds.add(focusId);

  while (q.length) {
    const cur = q.shift()!;
    const d = dist.get(cur)!;
    if (d >= depth) continue;

    for (const nxt of adj.get(cur) ?? []) {
      if (dist.has(nxt)) continue;
      dist.set(nxt, d + 1);
      highlightedNodeIds.add(nxt);
      q.push(nxt);
    }
  }

  for (const e of edges as any[]) {
    if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
      highlightedEdgeIds.add(e.id);
    }
  }

  for (const nId of highlightedNodeIds) {
    for (const a of collectAncestors(nId, parentById)) relatedGroupIds.add(a);
    const p = parentById.get(nId);
    if (p) relatedGroupIds.add(p);
  }

  return { highlightedNodeIds, highlightedEdgeIds, relatedGroupIds };
}

export const GraphCanvas = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { projectRoot, workspaceId, scanConfig, setScan } = useWorkspace();
  const { nodes, edges, onNodesChange, onEdgesChange, isScanning, refreshGraph, graphRevision } =
    useGraphLayout();

  const [focusId, setFocusId] = useState<string | null>(null);
  const [highlightDepth, setHighlightDepth] = useState<number>(2);

  const [entryDraft, setEntryDraft] = useState(scanConfig?.entryPoint ?? "");
  const [depthDraft, setDepthDraft] = useState<number>(scanConfig?.depth ?? 3);
  const [flattenDraft, setFlattenDraft] = useState<boolean>(!!scanConfig?.flatten);

  useEffect(() => {
    setEntryDraft(scanConfig?.entryPoint ?? "");
    setDepthDraft(scanConfig?.depth ?? 3);
    setFlattenDraft(!!scanConfig?.flatten);
  }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);

  const filePicker = useToggle();
  const fs = useFileSystem(projectRoot ?? null);

  const openPicker = useCallback(() => {
    if (projectRoot) fs.cd(projectRoot);
    filePicker.open();
  }, [projectRoot, fs, filePicker]);

  const nodeTypes = useMemo(
    () => ({
      fileNode: FileNode,
      groupNode: GroupNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      axonBiColor: BiColorEdge,
    }),
    []
  );

    // We disable manual edge creation in the UI (edges come from scans).
  // This prevents accidental duplicate edges when interacting with large graphs.
  const onConnect = undefined;


  const handleNodeClick = useCallback(
    (_: any, node: any) => {
      setFocusId(node?.id ?? null);

      const fileId = node?.type === "fileNode" ? node.id : null;
      dispatch(setSelectedNode(fileId));
    },
    [dispatch]
  );

  const clearFocus = useCallback(() => {
    setFocusId(null);
    dispatch(setSelectedNode(null));
  }, [dispatch]);

  const highlight = useMemo(() => {
    if (!focusId) return null;
    return computeHighlight(focusId, nodes as any, edges as any, highlightDepth);
  }, [focusId, nodes, edges, highlightDepth]);

  const displayNodes = useMemo(() => {
    if (!highlight || !focusId) return nodes;

    const { highlightedNodeIds, relatedGroupIds } = highlight;

    return (nodes as any[]).map((n) => {
      const isFocus = n.id === focusId;
      const isGroup = n.type === "groupNode";

      const isHot =
        highlightedNodeIds.has(n.id) || (isGroup && relatedGroupIds.has(n.id));

      let className = "";
      if (!isHot) className = "axon-dim";
      else className = "axon-highlight";
      if (isFocus) className = "axon-focus";

      return { ...n, className };
    });
  }, [nodes, highlight, focusId]);

  const displayEdges = useMemo(() => {
    if (!highlight || !focusId) {
      return (edges as any[]).map((e) => ({
        ...e,
        animated: false,
        style: {
          ...(e.style ?? {}),
          strokeWidth: 1.2,
          opacity: 0.55,
        },
      }));
    }

    const hotIds = highlight.highlightedEdgeIds;

    return (edges as any[]).map((e) => {
      const hot = hotIds.has(e.id);
      return {
        ...e,
        animated: hot,
        style: {
          ...(e.style ?? {}),
          strokeWidth: hot ? 2.4 : 1.1,
          opacity: hot ? 0.95 : 0.06,
        },
      };
    });
  }, [edges, highlight, focusId]);


  const isBigGraph = nodes.length > 450 || edges.length > 800;

  const runFirstScan = useCallback(async () => {
    if (!projectRoot) return;
    if (!entryDraft.trim()) return;

    setScan({
      entryPoint: entryDraft.trim(),
      depth: depthDraft,
      flatten: flattenDraft,
    });

    await refreshGraph({
      entryPoint: entryDraft.trim(),
      depth: depthDraft,
      flatten: flattenDraft,
    } as any);
  }, [projectRoot, entryDraft, depthDraft, flattenDraft, setScan, refreshGraph]);

  return (
    <CanvasContainer>
      {/* First scan overlay if entrypoint not set */}
      {projectRoot && !scanConfig?.entryPoint ? (
        <SetupOverlay>
          <SetupCard $variant="overlay" $padding={3} $radius="md" $border>
            <SetupTitle>Run your first scan</SetupTitle>
            <Subtext>
              Choose an entrypoint file + depth. The graph will populate and folders will group automatically.
            </Subtext>

            <SetupGrid>
              <div>
                <Label style={{ marginBottom: 6 }}>Entrypoint</Label>
                <Input
                  value={entryDraft}
                  onChange={(e) => setEntryDraft(e.target.value)}
                  placeholder="src/main.ts"
                />
              </div>

              <div>
                <Label style={{ marginBottom: 6 }}>Browse</Label>
                <Button onClick={openPicker}>
                  <VscFolderOpened />
                  Choose
                </Button>
              </div>

              <div>
                <Label style={{ marginBottom: 6 }}>Depth</Label>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  value={depthDraft}
                  onChange={(e) => setDepthDraft(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>

              <div>
                <Label style={{ marginBottom: 6 }}>Flatten</Label>
                <Inline style={{ height: 42 }}>
                  <input
                    type="checkbox"
                    checked={flattenDraft}
                    onChange={(e) => setFlattenDraft(e.target.checked)}
                  />
                  <Subtext>Optional</Subtext>
                </Inline>
              </div>
            </SetupGrid>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Button
                $primary
                onClick={runFirstScan}
                disabled={!entryDraft.trim() || isScanning}
              >
                <VscPlay />
                {isScanning ? "Scanning…" : "Scan"}
              </Button>
            </div>
          </SetupCard>

          <FileSelectorModal
            isOpen={filePicker.isOpen}
            toggle={filePicker.toggle}
            fs={fs}
            mode="file"
            onSelect={(path) => setEntryDraft(path)}
          />
        </SetupOverlay>
      ) : null}

      <ReactFlow
        key={`${workspaceId ?? "ws"}:${graphRevision}`}
        nodes={displayNodes as any}
        edges={displayEdges as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={clearFocus}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesConnectable={false}
        // NOTE: onlyRenderVisibleElements can cause edge 'trails/ghosts' with custom SVG gradients in some setups.
        // Leave it off for correctness; we keep other perf wins (minimap/background gating, lighter nodes).
        defaultEdgeOptions={{ type: "axonBiColor" }}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
      >
        <GraphToolbar onRescan={() => refreshGraph()} isScanning={isScanning} />

        <Panel position="top-left">
          <FocusCard $variant="overlay" $padding={2} $radius="md" $border>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: theme.colors.text.primary,
                }}
              >
                Focus
              </div>
              <Subtext>
                Click a file or folder to highlight. Click empty space to clear.
              </Subtext>
              {focusId ? (
                <Subtext style={{ margin: 0, opacity: 0.85 }}>
                  Focused: <span style={{ fontFamily: "monospace" }}>{focusId}</span>
                </Subtext>
              ) : null}
            </div>

            <div>
              <Subtext>Highlight depth</Subtext>
              <Row style={{ marginTop: 6 }}>
                <Slider
                  type="range"
                  min={1}
                  max={6}
                  value={highlightDepth}
                  onChange={(e) => setHighlightDepth(Number(e.target.value))}
                  disabled={!focusId}
                />
                <Pill>{highlightDepth}</Pill>
              </Row>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div
                  style={{
                    width: 18,
                    height: 3,
                    background: theme.colors.palette.primary,
                    borderRadius: 2,
                  }}
                />
                <Subtext>bottom (outgoing)</Subtext>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div
                  style={{
                    width: 18,
                    height: 3,
                    background: theme.colors.palette.success,
                    borderRadius: 2,
                  }}
                />
                <Subtext>top (incoming)</Subtext>
              </div>
            </div>
          </FocusCard>
        </Panel>

        <Controls style={{ background: "#2d2d2d", fill: "#fff", border: "none" }} />
        {!isBigGraph && (
          <MiniMap
            zoomable
            pannable
            style={{ background: "#252526", border: "1px solid #454545" }}
            nodeColor={(n) => (n.type === "groupNode" ? "#2d2d2d" : "#007acc")}
          />
        )}

        {!isBigGraph && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#444"
          />
        )}
      </ReactFlow>
    </CanvasContainer>
  );
};
