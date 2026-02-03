import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";

import { FileNode } from "./FileNode";
import { GroupNode } from "./GroupNode";
import { GraphToolbar } from "./GraphToolbar";
import { BiColorEdge } from "./BiColorEdge";
import { ProjectExplorerSidebar, type BundleTarget } from "./ProjectExplorerSidebar";

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
import type { AxonEdge, AxonNode } from "@axon-types/axonTypes";

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

  .react-flow__node.axon-hover {
    opacity: 1 !important;
    filter: drop-shadow(0 0 10px rgba(102, 204, 255, 0.32));
  }
`;

const Shell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const GraphPane = styled.div`
  flex: 1;
  height: 100%;
  min-width: 0;
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

function normalizeSlashes(p: string) {
  return (p ?? "").replace(/\\/g, "/");
}

function stripProjectRoot(absPath: string, projectRoot: string) {
  const abs = normalizeSlashes(absPath);
  const root = normalizeSlashes(projectRoot).replace(/\/+$/, "");
  if (!root) return abs;
  if (abs === root) return "";
  if (abs.startsWith(root + "/")) return abs.slice(root.length + 1);
  if (abs.startsWith(root)) return abs.slice(root.length).replace(/^\/+/, "");
  return abs;
}

function baseName(p: string) {
  const s = normalizeSlashes(p).replace(/\/+$/, "");
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(i + 1) : s;
}

export function toEntryPoint(node: any, projectRoot: string | null) {
  const data: any = node?.data ?? {};
  const raw =
    typeof data.path === "string" && data.path
      ? data.path
      : typeof node?.id === "string"
      ? node.id
      : "";
  if (!raw) return "";
  if (!projectRoot) return normalizeSlashes(raw);
  const rel = stripProjectRoot(raw, projectRoot);
  return rel || normalizeSlashes(raw);
}

const HIGHLIGHT_MAX_DEPTH = 6;

function computeMultiHighlight(
  targets: { nodeId: string; depth: number }[],
  nodes: Node[],
  edges: Edge[]
) {
  const byId = new Map<string, any>();
  const parentById = new Map<string, string | undefined>();

  for (const n of nodes as any[]) {
    byId.set(n.id, n);
    parentById.set(n.id, n.parentId);
  }

  const highlightedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();
  const relatedGroupIds = new Set<string>();
  const focusNodeIds = new Set<string>();

  /**
   * IMPORTANT:
   * The backend "bundle" only follows imports from an entrypoint outward.
   * So our highlight should mirror that: walk OUTGOING edges only (source -> target),
   * and do NOT include "parents" (incoming edges).
   */
  const outgoing = new Map<string, string[]>();
  const addOut = (a: string, b: string) => {
    if (!outgoing.has(a)) outgoing.set(a, []);
    outgoing.get(a)!.push(b);
  };

  for (const e of edges as any[]) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;

    const s = byId.get(e.source);
    const t = byId.get(e.target);

    // ignore folder/group nodes in traversal
    if (s?.type === "groupNode" || t?.type === "groupNode") continue;

    addOut(String(e.source), String(e.target));
  }

  for (const t of targets) {
    const focusId = String(t.nodeId);
    const focus = byId.get(focusId);
    if (!focus || focus.type === "groupNode") continue;

    focusNodeIds.add(focusId);

    const depth = Math.max(
      1,
      Math.min(HIGHLIGHT_MAX_DEPTH, Math.floor(Number(t.depth) || 1))
    );

    const dist = new Map<string, number>();
    const q: string[] = [focusId];
    dist.set(focusId, 0);
    highlightedNodeIds.add(focusId);

    while (q.length) {
      const cur = q.shift()!;
      const d = dist.get(cur)!;
      if (d >= depth) continue;

      for (const nxt of outgoing.get(cur) ?? []) {
        if (dist.has(nxt)) continue;
        dist.set(nxt, d + 1);
        highlightedNodeIds.add(nxt);
        q.push(nxt);
      }
    }
  }

  if (!highlightedNodeIds.size) return null;

  // Highlight edges that connect highlighted nodes in the OUTGOING direction.
  for (const e of edges as any[]) {
    if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
      highlightedEdgeIds.add(e.id);
    }
  }

  // Keep folder containers visible by including ancestors of highlighted nodes.
  for (const nId of highlightedNodeIds) {
    for (const a of collectAncestors(nId, parentById)) relatedGroupIds.add(a);
    const p = parentById.get(nId);
    if (p) relatedGroupIds.add(p);
  }

  return { highlightedNodeIds, highlightedEdgeIds, relatedGroupIds, focusNodeIds };
}

export const GraphCanvas = () => {
  const dispatch = useAppDispatch();

  const { projectRoot, workspaceId, scanConfig, setScan } = useWorkspace();
  const { nodes, edges, onNodesChange, onEdgesChange, isScanning, refreshGraph, graphRevision } =
    useGraphLayout();

  const [bundleTargets, setBundleTargets] = useState<BundleTarget[]>([]);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);

  const rfRef = useRef<ReactFlowInstance<AxonNode, AxonEdge> | null>(null);

  const fitViewNow = useCallback((duration = 350) => {
    const inst = rfRef.current;
    if (!inst) return;
    try {
      inst.fitView({ padding: 0.18, duration, includeHiddenNodes: true });
    } catch {
      // noop
    }
  }, []);


  useEffect(() => {
    // Clear bundle selection when switching workspaces/roots.
    setBundleTargets([]);
    setHoverNodeId(null);
  }, [workspaceId, projectRoot]);

  useEffect(() => {
    // Fit view when the graph changes as a result of a scan/layout, not on every minor UI update.
    if (!nodes.length) return;
    // graphRevision is bumped by the layout hook after a scan completes.
    fitViewNow(420);
  }, [graphRevision, nodes.length, fitViewNow]);

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

  // Disable manual edge creation in the UI: edges come from scans.
  const onConnect = undefined;

  const handleNodeClick = useCallback(
    (evt: any, node: any) => {
      const isFile = node?.type === "fileNode";
      dispatch(setSelectedNode(isFile ? node.id : null));
      setHoverNodeId(null);

      if (!isFile) return;

      const entryPoint = toEntryPoint(node, projectRoot);
      if (!entryPoint) return;
    

      const data: any = node?.data ?? {};
      const label =
        (typeof data.label === "string" && data.label) ||
        (typeof data.path === "string" && data.path
          ? baseName(stripProjectRoot(data.path, projectRoot ?? ""))
          : "") ||
        baseName(entryPoint);

      const fallbackDepth = Math.max(1, Number(scanConfig?.depth) || 3);
      const defaultDepth = Math.max(1, Math.min(25, Math.floor(fallbackDepth)));

      const next: BundleTarget = {
        nodeId: String(node.id),
        entryPoint,
        depth: defaultDepth,
        label,
      };

      const isMulti = !!(evt?.ctrlKey || evt?.metaKey);

      setBundleTargets((prev) => {
        const exists = prev.some((p) => p.entryPoint === entryPoint);
        if (isMulti) {
          // toggle in/out
          return exists ? prev.filter((p) => p.entryPoint !== entryPoint) : [...prev, next];
        }
        // single select
        return [next];
      });
    },
    [dispatch, projectRoot, scanConfig?.depth]
  );

  const onPaneClick = useCallback(() => {
    // Clicking empty canvas clears the node inspector selection, but keeps the bundle selection.
    dispatch(setSelectedNode(null));
  }, [dispatch]);

  const focusTargets = useMemo(
    () => (bundleTargets ?? []).map((t) => ({ nodeId: t.nodeId, depth: t.depth })),
    [bundleTargets]
  );

  const highlight = useMemo(() => {
    if (!focusTargets.length) return null;
    return computeMultiHighlight(focusTargets, nodes as any, edges as any);
  }, [focusTargets, nodes, edges]);

  const displayNodes = useMemo(() => {
    const applyHover = (arr: any[]) => {
      if (!hoverNodeId) return arr;
      return arr.map((n) => {
        const hover = n?.type === "fileNode" && String(n.id) === String(hoverNodeId);
        if (!hover) return n;
        const cls = `${n.className ?? ""} axon-hover`.trim();
        return { ...n, className: cls };
      });
    };

    if (!highlight) {
      return applyHover(nodes as any[]);
    }

    const { highlightedNodeIds, relatedGroupIds, focusNodeIds } = highlight;

    const mapped = (nodes as any[]).map((n) => {
      const isGroup = n.type === "groupNode";
      const isFocus = focusNodeIds.has(n.id);

      const isHot = highlightedNodeIds.has(n.id) || (isGroup && relatedGroupIds.has(n.id));

      let tag = "";
      if (!isHot) tag = "axon-dim";
      else tag = "axon-highlight";
      if (isFocus) tag = "axon-focus";

      const combined = n.className ? `${n.className} ${tag}` : tag;
      return { ...n, className: combined };
    });

    return applyHover(mapped);
  }, [nodes, highlight, hoverNodeId]);

  const displayEdges = useMemo(() => {
    if (!highlight) {
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
  }, [edges, highlight]);

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
              <Button $primary onClick={runFirstScan} disabled={!entryDraft.trim() || isScanning}>
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

      <Shell>
          <ProjectExplorerSidebar
          nodes={nodes as any}
          projectRoot={projectRoot ?? null}
          bundleTargets={bundleTargets}
          setBundleTargets={setBundleTargets as any}
          defaultDepth={Math.max(1, Number(scanConfig?.depth) || 3)}
          onActivateFile={(nodeId) => dispatch(setSelectedNode(nodeId))}
          onHoverFile={(nodeId) => setHoverNodeId(nodeId)}
        />
        <GraphPane>
          <ReactFlow
        key={`${workspaceId ?? "ws"}:${graphRevision}`}
        nodes={displayNodes as any}
        edges={displayEdges as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesConnectable={false}
        // NOTE: onlyRenderVisibleElements can cause edge 'trails/ghosts' with custom SVG gradients in some setups.
        // We leave it off for correctness.
        defaultEdgeOptions={{ type: "axonBiColor" }}
minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        onInit={(inst) => {
          rfRef.current = inst;
          // Fit once after mount (scan/layout uses graphRevision key so this runs after each scan).
          requestAnimationFrame(() => fitViewNow(420));
        }}
      >
        <GraphToolbar
          onRescan={() => refreshGraph()}
          isScanning={isScanning}
          bundleTargets={bundleTargets as any}
        />

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
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#444" />
        )}
          </ReactFlow>
        </GraphPane>

      
      </Shell>
    </CanvasContainer>
  );
};
