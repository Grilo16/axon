import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkerType, useEdgesState, useNodesState } from "@xyflow/react";
import type { AxonEdge, AxonNode } from "@axon-types/axonTypes";
import { useAxonCore } from "@features/axon/useAxonCore";
import { useWorkspace } from "@features/workspace/useWorkspace";

/**
 * Hierarchical folder layout:
 * - Build a folder tree from file paths.
 * - Lay out (a) child folders and (b) direct files in each folder using a grid-like pack.
 * - Produce nested ReactFlow "group nodes" (folders) with consistent padding/margins.
 *
 * Fixes:
 * - Cleaner tree/grid nesting inside folders
 * - Avoids "leftover edges" by clearing + filtering edges and ignoring stale scan results
 * - More stable layout for large graphs
 */

const GROUP_PADDING = 44;
/** Reserved vertical space for folder header + path line (matches GroupNode UI). */
const GROUP_TOP_INSET = 86;

const SECTION_GAP_Y = 28;

/** Grid packing for file nodes inside a folder */
const FILE_GAP_X = 44;
const FILE_GAP_Y = 34;
const FILE_MAX_COLS = 4;

/** Grid packing for child folders inside a folder */
const FOLDER_GAP_X = 54;
const FOLDER_GAP_Y = 48;
const FOLDER_MAX_COLS = 3;

/** Top-level packing for root folders/files */
const ROOT_GAP_X = 80;
const ROOT_GAP_Y = 70;
const ROOT_MAX_COLS = 2;

const FALLBACK_NODE_W = 280;
const FALLBACK_NODE_H = 240;

function normalizePath(p: string) {
  return (p ?? "").replace(/\\/g, "/");
}

function stripProjectRoot(absPath: string, projectRoot: string) {
  const a = normalizePath(absPath);
  const r = normalizePath(projectRoot);

  const aLow = a.toLowerCase();
  const rLow = r.toLowerCase();

  if (r && aLow.startsWith(rLow)) {
    let rel = a.slice(r.length);
    if (rel.startsWith("/")) rel = rel.slice(1);
    return rel;
  }
  return a;
}

function dirname(relPath: string) {
  const p = normalizePath(relPath);
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

function parentFolder(folder: string) {
  if (!folder) return "";
  const p = normalizePath(folder);
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

function folderDepth(folder: string) {
  if (!folder) return 0;
  return normalizePath(folder).split("/").filter(Boolean).length;
}

function folderId(folder: string) {
  return `folder:${normalizePath(folder)}`;
}

function folderLabel(folder: string) {
  const p = normalizePath(folder);
  const parts = p.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? p ?? "folder";
}

function coerceNum(v: unknown, fallback: number) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function approxNodeSize(n: any) {
  const mw = n?.measured?.width;
  const mh = n?.measured?.height;

  const sw = n?.style?.width;
  const sh = n?.style?.height;

  const w = coerceNum(mw ?? sw, FALLBACK_NODE_W);
  const h = coerceNum(mh ?? sh, FALLBACK_NODE_H);

  return { w, h };
}

function chooseCols(n: number, maxCols: number) {
  if (n <= 1) return 1;
  const squareish = Math.ceil(Math.sqrt(n));
  return Math.min(maxCols, Math.max(1, squareish));
}

function gridPack<T>(args: {
  items: T[];
  cols: number;
  startX: number;
  startY: number;
  gapX: number;
  gapY: number;
  getW: (t: T) => number;
  getH: (t: T) => number;
}) {
  const { items, startX, startY, gapX, gapY, getW, getH } = args;

  if (items.length === 0) {
    return { w: 0, h: 0, pos: new Map<T, { x: number; y: number }>() };
  }

  const cols = Math.min(Math.max(1, args.cols), items.length);
  const rows = Math.ceil(items.length / cols);

  const colW = Array.from({ length: cols }, () => 0);
  const rowH = Array.from({ length: rows }, () => 0);

  for (let i = 0; i < items.length; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    colW[c] = Math.max(colW[c], getW(items[i]));
    rowH[r] = Math.max(rowH[r], getH(items[i]));
  }

  const colX = Array.from({ length: cols }, () => 0);
  const rowY = Array.from({ length: rows }, () => 0);

  colX[0] = startX;
  for (let c = 1; c < cols; c++) colX[c] = colX[c - 1] + colW[c - 1] + gapX;

  rowY[0] = startY;
  for (let r = 1; r < rows; r++) rowY[r] = rowY[r - 1] + rowH[r - 1] + gapY;

  const pos = new Map<T, { x: number; y: number }>();
  for (let i = 0; i < items.length; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    pos.set(items[i], { x: colX[c], y: rowY[r] });
  }

  const w = colW.reduce((a, b) => a + b, 0) + gapX * (cols - 1);
  const h = rowH.reduce((a, b) => a + b, 0) + gapY * (rows - 1);

  return { w, h, pos };
}

type Layout = {
  width: number;
  height: number;
  childFolderPos: Map<string, { x: number; y: number }>;
  filePos: Map<string, { x: number; y: number }>;
  directFileCount: number;
};

type FileItem = {
  id: string;
  relPath: string;
  folder: string;
  raw: any;
  w: number;
  h: number;
};

export const useGraphLayout = () => {
  const { projectRoot, workspaceId, scanConfig /* { entryPoint, depth, flatten } */ } = useWorkspace();
  const { scanGroup } = useAxonCore();

  const [nodes, setNodes, onNodesChange] = useNodesState<AxonNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AxonEdge>([]);
  const [isScanning, setIsScanning] = useState(false);

  

  // Forces a clean ReactFlow remount on successful scans (helps clear rare render artifacts).
  const [graphRevision, setGraphRevision] = useState(0);
// Prevent stale async scan results from overwriting newer scans.
  const scanSeq = useRef(0);

  useEffect(() => {
    // Cancel any in-flight scan results and reset graph when switching workspaces.
    scanSeq.current += 1;
    setNodes([]);
    setEdges([]);
    setGraphRevision((r) => r + 1);
  }, [workspaceId, setNodes, setEdges]);

const canScan = useMemo(() => {
    return !!projectRoot && !!workspaceId && !!scanConfig?.entryPoint;
  }, [projectRoot, workspaceId, scanConfig?.entryPoint]);

  const refreshGraph = useCallback(
    async (override?: Partial<{ entryPoint: string; depth: number; flatten: boolean }>) => {
      if (!projectRoot || !workspaceId) return;

      const entryPoint = override?.entryPoint ?? scanConfig?.entryPoint ?? "";
      const depth = override?.depth ?? scanConfig?.depth ?? 3;
      const flatten = override?.flatten ?? scanConfig?.flatten ?? false;

      if (!entryPoint) return;

      const mySeq = ++scanSeq.current;

      setIsScanning(true);
      // Clear immediately to avoid "leftover edges" while new scan is inflight.
      setEdges([]);

      try {
        const result = await scanGroup({
          groupId: workspaceId, // re-using backend "groupId" as workspace scan id
          projectRoot,
          entryPoint,
          depth,
          flatten,
        });

        // If a newer scan started, ignore this one.
        if (mySeq !== scanSeq.current) return;

        const rawNodes = (result.nodes ?? []) as any[];
        const rawEdges = (result.edges ?? []) as any[];

        // Build file items + folder tree
        const files: FileItem[] = [];
        const folders = new Set<string>();
        folders.add(""); // pseudo root

        const filesByFolder = new Map<string, FileItem[]>();

        const addFolderChain = (folder: string) => {
          let f = normalizePath(folder);
          while (f) {
            folders.add(f);
            f = parentFolder(f);
          }
        };

        for (const n of rawNodes) {
          const absPath = n?.data?.path ? String(n.data.path) : "";
          if (!absPath) continue;

          const rel = stripProjectRoot(absPath, projectRoot);
          const folder = dirname(rel);
          const { w, h } = approxNodeSize(n);

          const item: FileItem = {
            id: String(n.id),
            relPath: rel,
            folder,
            raw: n,
            w,
            h,
          };
          files.push(item);

          if (!filesByFolder.has(folder)) filesByFolder.set(folder, []);
          filesByFolder.get(folder)!.push(item);

          addFolderChain(folder);
        }

        // childrenByFolder: immediate folder nesting
        const childrenByFolder = new Map<string, string[]>();
        for (const f of folders) childrenByFolder.set(f, []);
        for (const f of folders) {
          if (!f) continue;
          const p = parentFolder(f);
          if (!childrenByFolder.has(p)) childrenByFolder.set(p, []);
          childrenByFolder.get(p)!.push(f);
        }

        // stable ordering
        for (const [k, list] of childrenByFolder.entries()) {
          const uniq = Array.from(new Set(list));
          uniq.sort((a, b) => a.localeCompare(b));
          childrenByFolder.set(k, uniq);
        }
        for (const [k, list] of filesByFolder.entries()) {
          list.sort((a, b) => a.relPath.localeCompare(b.relPath));
          filesByFolder.set(k, list);
        }

        const layoutByFolder = new Map<string, Layout>();

        const layoutFolder = (folder: string): Layout => {
          const cached = layoutByFolder.get(folder);
          if (cached) return cached;

          const isRoot = folder === "";
          const padding = isRoot ? 0 : GROUP_PADDING;
          const topInset = isRoot ? 0 : GROUP_TOP_INSET;

          const children = childrenByFolder.get(folder) ?? [];
          const directFiles = filesByFolder.get(folder) ?? [];

          // Layout children first (bottom-up)
          for (const c of children) layoutFolder(c);

          const childFolderPos = new Map<string, { x: number; y: number }>();
          const filePos = new Map<string, { x: number; y: number }>();

          const startX = padding;
          const startY = topInset + padding;

          // --- Child folders grid ---
          const childPack = gridPack({
            items: children,
            cols: chooseCols(children.length, isRoot ? ROOT_MAX_COLS : FOLDER_MAX_COLS),
            startX,
            startY,
            gapX: isRoot ? ROOT_GAP_X : FOLDER_GAP_X,
            gapY: isRoot ? ROOT_GAP_Y : FOLDER_GAP_Y,
            getW: (folderKey) => layoutByFolder.get(folderKey)!.width,
            getH: (folderKey) => layoutByFolder.get(folderKey)!.height,
          });

          for (const fKey of children) {
            const p = childPack.pos.get(fKey);
            if (p) childFolderPos.set(fKey, p);
          }

          // --- Direct files grid (placed below children, if any) ---
          const directIds = directFiles.map((f) => f.id);
          const dimById = new Map<string, { w: number; h: number }>();
          for (const f of directFiles) dimById.set(f.id, { w: f.w, h: f.h });

          const fileStartY =
            startY + (childPack.h > 0 ? childPack.h + (directIds.length > 0 ? SECTION_GAP_Y : 0) : 0);

          const filePack = gridPack({
            items: directIds,
            cols: chooseCols(directIds.length, FILE_MAX_COLS),
            startX,
            startY: fileStartY,
            gapX: FILE_GAP_X,
            gapY: FILE_GAP_Y,
            getW: (id) => dimById.get(id)?.w ?? FALLBACK_NODE_W,
            getH: (id) => dimById.get(id)?.h ?? FALLBACK_NODE_H,
          });

          for (const id of directIds) {
            const p = filePack.pos.get(id);
            if (p) filePos.set(id, p);
          }

          const contentW = Math.max(childPack.w, filePack.w);
          const contentHeight =
            (childPack.h > 0 ? childPack.h : 0) +
            (childPack.h > 0 && filePack.h > 0 ? SECTION_GAP_Y : 0) +
            (filePack.h > 0 ? filePack.h : 0);

          const width = isRoot ? contentW : Math.max(260, padding * 2 + contentW);
          const height = isRoot ? contentHeight : Math.max(160, topInset + padding * 2 + contentHeight);

          const layout: Layout = {
            width,
            height,
            childFolderPos,
            filePos,
            directFileCount: directFiles.length,
          };

          layoutByFolder.set(folder, layout);
          return layout;
        };

        const rootLayout = layoutFolder("");

        // Build group nodes (all folders except root)
        const groupNodes: AxonNode[] = [];

        // Parents first (ReactFlow nesting expects parent earlier)
        const folderList = Array.from(folders)
          .filter((f) => f !== "")
          .sort((a, b) => folderDepth(a) - folderDepth(b) || a.localeCompare(b));

        for (const f of folderList) {
          const layout = layoutByFolder.get(f)!;
          const parent = parentFolder(f);
          const parentIsRoot = parent === "";
          const parentLayout = layoutByFolder.get(parent) ?? rootLayout;
          const parentPos = parentLayout.childFolderPos.get(f);

          groupNodes.push({
            id: folderId(f),
            type: "groupNode",
            position: parentPos ?? { x: 0, y: 0 },
            ...(parentIsRoot ? {} : { parentId: folderId(parent), extent: "parent" as const }),
            style: { width: layout.width, height: layout.height },
            data: {
              label: folderLabel(f),
              folderPath: f,
              folderDepth: folderDepth(f),
              fileCount: filesByFolder.get(f)?.length ?? 0,
            } as any,
            selectable: true,
            draggable: true,
          });
        }

        // Build file nodes
        const fileNodes: AxonNode[] = files.map((f) => {
          const base = {
            ...f.raw,
            id: f.id,
            type: "fileNode",
          } as any;

          if (!f.folder) {
            // Root-level file (no parent group)
            const p = rootLayout.filePos.get(f.id) ?? { x: 0, y: 0 };
            return { ...base, position: p } as AxonNode;
          }

          const folderLayout = layoutByFolder.get(f.folder);
          const p = folderLayout?.filePos.get(f.id) ?? {
            x: GROUP_PADDING,
            y: GROUP_TOP_INSET + GROUP_PADDING,
          };

          return {
            ...base,
            parentId: folderId(f.folder),
            extent: "parent",
            position: p,
          } as AxonNode;
        });

        const allNodeIds = new Set<string>();
        for (const n of groupNodes) allNodeIds.add(n.id);
        for (const n of fileNodes) allNodeIds.add(n.id);

        // Style + sanitize edges (filter anything referring to missing nodes)
        const edgesStyled: AxonEdge[] = rawEdges
          .map((e, idx) => {
            const source = String(e?.source ?? "");
            const target = String(e?.target ?? "");
            const id = e?.id ? String(e.id) : `e:${source}->${target}:${idx}`;

            return {
              ...e,
              id,
              source,
              target,
              type: "axonBiColor",
              sourceHandle: "out",
              targetHandle: "in",
              markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
              animated: false,
              style: {
                ...(e?.style ?? {}),
                strokeWidth: 1.2,
                opacity: 0.55,
              },
            } as AxonEdge;
          })
          .filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target));

        setNodes([...groupNodes, ...fileNodes]);
        setEdges(edgesStyled as any);
        setGraphRevision((r) => r + 1);
      } catch (err) {
        console.error("[useGraphLayout] scan failed:", err);
      } finally {
        if (mySeq === scanSeq.current) setIsScanning(false);
      }
    },
    [
      projectRoot,
      workspaceId,
      scanConfig?.entryPoint,
      scanConfig?.depth,
      scanConfig?.flatten,
      scanGroup,
      setNodes,
      setEdges,
    ]
  );

  useEffect(() => {
    if (!canScan) return;
    refreshGraph();
  }, [canScan, refreshGraph]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isScanning,
    refreshGraph,
    setEdges,
    graphRevision,
  };
};
