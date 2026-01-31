import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  type Connection,
  type NodeMouseHandler,
  useOnSelectionChange,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styled, { useTheme } from 'styled-components';

import { FileNode } from './FileNode';
import { GroupNode } from './GroupNode';
import { NodeContextMenu } from './NodeContextMenu';
import { GraphToolbar } from './GraphToolbar';

import { useWorkspace } from '@features/workspace/useWorkspace';
import { nanoid } from '@reduxjs/toolkit';
import { useGraphLayout } from '@features/visualizer/useGraphLayout';
import { useAppDispatch } from '@app/hooks';
import { setSelectedNode } from '@features/workspace/workspacesSlice';
import { Surface } from '@components/ui/Surface';
import { Subtext } from '@components/ui/Typography';
import { VscClose, VscFolderOpened } from 'react-icons/vsc';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.bg.main};

  /* Force React Flow to inherit theme fonts */
  .react-flow__node {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    transition: opacity 140ms ease, filter 140ms ease;
  }

  .react-flow__edge-path {
    transition: opacity 140ms ease, stroke 140ms ease, stroke-width 140ms ease;
  }

  /* Focus classes (we set node.className dynamically) */
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
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const FocusTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FocusTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FocusPath = styled(Subtext)`
  margin-top: 6px;
  font-size: 12px;
  word-break: break-all;
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

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.colors.palette.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    filter: brightness(1.06);
  }
`;

const GhostBtn = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

/** Selection listener that also updates local focus id */
const SelectionListener = ({ onSelected }: { onSelected: (id: string | null) => void }) => {
  const dispatch = useAppDispatch();

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const selectedId = nodes.length > 0 ? nodes[0].id : null;
      dispatch(setSelectedNode(selectedId));
      onSelected(selectedId);
    },
  });

  return null;
};

// ---------------------------
// Highlight computation (BFS)
// ---------------------------
function computeHighlight(
  focusId: string,
  nodes: any[],
  edges: any[],
  depth: number
) {
  const focus = nodes.find((n) => n.id === focusId);
  if (!focus) return null;

  const highlightedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();
  const distances = new Map<string, number>();
  const relatedGroupIds = new Set<string>();

  // Group node: just highlight itself + children
  if (focus.type === 'groupNode') {
    highlightedNodeIds.add(focusId);
    distances.set(focusId, 0);

    const children = nodes.filter((n) => n.parentId === focusId);
    for (const c of children) {
      highlightedNodeIds.add(c.id);
      distances.set(c.id, 1);
    }

    for (const e of edges) {
      if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
        highlightedEdgeIds.add(e.id);
      }
    }

    relatedGroupIds.add(focusId);
    return { highlightedNodeIds, highlightedEdgeIds, distances, relatedGroupIds };
  }

  // File node: BFS on an undirected adjacency graph
  const adj = new Map<string, string[]>();
  const add = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  };

  for (const e of edges) {
    add(e.source, e.target);
    add(e.target, e.source);
  }

  const q: string[] = [focusId];
  highlightedNodeIds.add(focusId);
  distances.set(focusId, 0);

  while (q.length) {
    const cur = q.shift()!;
    const d = distances.get(cur)!;
    if (d >= depth) continue;

    for (const n of adj.get(cur) ?? []) {
      if (!distances.has(n)) {
        distances.set(n, d + 1);
        highlightedNodeIds.add(n);
        q.push(n);
      }
    }
  }

  for (const e of edges) {
    if (highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target)) {
      highlightedEdgeIds.add(e.id);
    }
  }

  // Keep parent group nodes visible for highlighted file nodes
  for (const n of nodes) {
    if (highlightedNodeIds.has(n.id) && n.parentId) {
      relatedGroupIds.add(n.parentId);
    }
  }

  return { highlightedNodeIds, highlightedEdgeIds, distances, relatedGroupIds };
}

export const GraphCanvas = () => {
  const theme = useTheme();
  const { createGroup } = useWorkspace();

  // 1. Load Logic
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useGraphLayout();

  // 2. Local View State (Context Menu + Focus)
  const [menu, setMenu] = useState<{ x: number; y: number; node: any } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [highlightDepth, setHighlightDepth] = useState<number>(2);

  // 3. Memoized Node Types
  const nodeTypes = useMemo(
    () => ({
      fileNode: FileNode,
      groupNode: GroupNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    if (node.type === 'fileNode') {
      setMenu({ x: event.clientX, y: event.clientY, node });
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setMenu(null);
    // Optional: clicking empty space clears focus
    // setFocusId(null);
  }, []);

  const handleExtractGroup = (node: any) => {
    const path = node.data.path;
    if (path) {
      createGroup({
        id: nanoid(),
        name: `${node.data.label} Scope`,
        entryPoint: path,
        depth: 2,
        isActive: true,
        flatten: true,
      });
    }
    setMenu(null);
  };

  // ---------------------------
  // Highlight result
  // ---------------------------
  const highlight = useMemo(() => {
    if (!focusId) return null;
    return computeHighlight(focusId, nodes as any[], edges as any[], highlightDepth);
  }, [focusId, nodes, edges, highlightDepth]);

  const focusNode = useMemo(() => {
    if (!focusId) return null;
    return (nodes as any[]).find((n) => n.id === focusId) ?? null;
  }, [nodes, focusId]);

  const focusLabel = (focusNode?.data as any)?.label as string | undefined;
  const focusPath = (focusNode?.data as any)?.path as string | undefined;

  // ---------------------------
  // Derived nodes (dim / highlight)
  // ---------------------------
  const displayNodes = useMemo(() => {
    if (!highlight) return nodes;

    const { highlightedNodeIds, relatedGroupIds } = highlight;

    return (nodes as any[]).map((n) => {
      const base = n.className ? `${n.className} ` : '';

      const isFocus = n.id === focusId;
      const isGroup = n.type === 'groupNode';
      const isHighlighted = highlightedNodeIds.has(n.id);
      const isRelatedGroup = isGroup && relatedGroupIds.has(n.id);

      // If grouped nodes are DOM children, dimming the parent group will dim its children.
      // So: only dim group nodes that are NOT related to the highlighted set.
      const shouldDim = isGroup ? !isRelatedGroup && !isHighlighted : !isHighlighted;

      const className = isFocus
        ? `${base}axon-focus`
        : shouldDim
          ? `${base}axon-dim`
          : `${base}axon-highlight`;

      return { ...n, className };
    });
  }, [nodes, highlight, focusId]);

  // ---------------------------
  // Derived edges (dim + import/export colors)
  // ---------------------------
  const displayEdges = useMemo(() => {
    const neutral = theme.colors.border;
    const importColor = theme.colors.palette.primary; // outgoing from focus
    const exportColor = theme.colors.palette.accent;  // incoming to focus

    if (!highlight || !focusId) {
      return (edges as any[]).map((e) => ({
        ...e,
        animated: false,
        style: {
          ...(e.style ?? {}),
          stroke: neutral,
          strokeWidth: 1.3,
          opacity: 0.55,
        },
      }));
    }

    const { highlightedEdgeIds, distances } = highlight;

    return (edges as any[]).map((e) => {
      const hot = highlightedEdgeIds.has(e.id);

      // classify edges relative to the BFS layers
      const ds = distances.get(e.source);
      const dt = distances.get(e.target);

      let stroke = neutral;

      // strongest signal: directly relative to focus
      if (hot) {
        if (e.source === focusId) stroke = importColor;
        else if (e.target === focusId) stroke = exportColor;
        else if (ds !== undefined && dt !== undefined) {
          // secondary signal: outward vs inward by BFS distance
          if (ds < dt) stroke = importColor;
          else if (ds > dt) stroke = exportColor;
          else stroke = theme.colors.text.muted;
        }
      }

      return {
        ...e,
        animated: hot,
        style: {
          ...(e.style ?? {}),
          stroke,
          strokeWidth: hot ? 2.2 : 1.1,
          opacity: hot ? 0.95 : 0.06,
        },
      };
    });
  }, [edges, highlight, theme, focusId]);

  const clearFocus = useCallback(() => setFocusId(null), []);

  const extractHighlightedToGroup = useCallback(() => {
    if (!focusNode || focusNode.type !== 'fileNode') return;
    const path = (focusNode.data as any)?.path;
    const label = (focusNode.data as any)?.label ?? 'Selection';
    if (!path) return;

    createGroup({
      id: nanoid(),
      name: `${label} (depth ${highlightDepth})`,
      entryPoint: path,
      depth: highlightDepth,
      isActive: true,
      flatten: true,
    });
  }, [focusNode, createGroup, highlightDepth]);

  return (
    <CanvasContainer>
      <ReactFlow
        nodes={displayNodes as any}
        edges={displayEdges as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
      >
        <SelectionListener onSelected={setFocusId} />
        <GraphToolbar />

        {/* Focus control panel */}
        <Panel position="top-left">
          <FocusCard $variant="overlay" $padding={2} $radius="md" $border>
            <FocusTitleRow>
              <div>
                <FocusTitle>{focusId ? (focusLabel ?? 'Focus') : 'Focus'}</FocusTitle>
                <Subtext style={{ marginTop: 4 }}>
                  {focusId
                    ? `Highlight depth: ${highlightDepth}`
                    : 'Click a node to highlight connected files'}
                </Subtext>
                {focusId && focusPath ? <FocusPath>{focusPath}</FocusPath> : null}
              </div>

              <GhostBtn onClick={clearFocus} title="Clear focus" disabled={!focusId}>
                <VscClose />
              </GhostBtn>
            </FocusTitleRow>

            <div>
              <Subtext>Depth</Subtext>
              <Row style={{ marginTop: 6 }}>
                <Slider
                  type="range"
                  min={1}
                  max={5}
                  value={highlightDepth}
                  disabled={!focusId}
                  onChange={(e) => setHighlightDepth(Number(e.target.value))}
                />
                <Pill>{highlightDepth}</Pill>
              </Row>
            </div>

            <BtnRow>
              <PrimaryBtn
                onClick={extractHighlightedToGroup}
                disabled={!focusId || !focusPath}
                title="Create a new Scope group from this focus + depth"
              >
                <VscFolderOpened />
                Extract as Group
              </PrimaryBtn>

              <GhostBtn onClick={clearFocus} disabled={!focusId} title="Clear focus">
                <VscClose />
              </GhostBtn>
            </BtnRow>

            {highlight ? (
              <Subtext>
                {highlight.highlightedNodeIds.size} nodes · {highlight.highlightedEdgeIds.size} edges
              </Subtext>
            ) : null}
          </FocusCard>
        </Panel>

        {menu && (
          <NodeContextMenu
            top={menu.y}
            left={menu.x}
            node={menu.node}
            onClose={() => setMenu(null)}
            onExtractGroup={handleExtractGroup}
          />
        )}

        <Controls style={{ background: '#2d2d2d', fill: '#fff', border: 'none' }} />
        <MiniMap
          zoomable
          pannable
          style={{ background: '#252526', border: '1px solid #454545' }}
          nodeColor={(n) => (n.type === 'groupNode' ? '#2d2d2d' : '#007acc')}
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#444" />
      </ReactFlow>
    </CanvasContainer>
  );
};
