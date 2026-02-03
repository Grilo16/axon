import { memo, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import type { Node } from "@xyflow/react";
import {
  VscChevronDown,
  VscChevronRight,
  VscFile,
  VscFolder,
  VscClose,
  VscTrash,
} from "react-icons/vsc";
import { Surface } from "@components/ui/Surface";

export type BundleTarget = {
  nodeId: string;
  entryPoint: string;
  depth: number;
  label?: string;
};

type Props = {
  nodes: Node[];
  projectRoot: string | null;
  bundleTargets: BundleTarget[];
  setBundleTargets: (updater: (prev: BundleTarget[]) => BundleTarget[]) => void;
  defaultDepth: number;
  onActivateFile?: (nodeId: string) => void;
  onHoverFile?: (nodeId: string | null) => void;
};

type TreeDir = {
  kind: "dir";
  name: string;
  path: string; // slash path from root, e.g. "src/components"
  children: Array<TreeDir | TreeFile>;
};

type TreeFile = {
  kind: "file";
  name: string;
  path: string; // relative path, e.g. "src/main.ts"
  nodeId: string;
};

const SidebarShell = styled(Surface)`
  width: 360px;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.main};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 10px 12px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Hint = styled.div`
  font-size: 11px;
  opacity: 0.7;
`;

const Section = styled.div`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 900;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SelectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 30vh;
  overflow: auto;
  padding-right: 2px;
`;

const SelectionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 72px 28px;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bg.surface};
`;

const SelectionPath = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SelName = styled.div`
  font-weight: 900;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SelPath = styled.div`
  font-size: 11px;
  opacity: 0.78;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DepthInput = styled.input`
  width: 72px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 8px 8px;
  background: ${({ theme }) => theme.colors.bg.main};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 800;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

const IconButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme }) => theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    filter: brightness(1.12);
  }
`;

const SearchWrap = styled.div`
  padding: 10px 12px 0 12px;
`;

const SearchInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 700;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

const PathHint = styled.div`
  font-size: 11px;
  opacity: 0.68;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ExplorerWrap = styled.div`
  flex: 1;
  overflow: auto;
  padding: 10px 8px 12px 8px;
`;

const Row = styled.div<{ $active?: boolean; $indent: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  margin-left: ${({ $indent }) => $indent * 12}px;

  ${({ $active, theme }) =>
    $active
      ? `background: ${theme.colors.bg.overlay}; border: 1px solid ${theme.colors.palette.primary}33;`
      : `border: 1px solid transparent;`}

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
  }
`;

const Name = styled.div`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
`;

const SmallButton = styled.button<{ $danger?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  padding: 6px 10px;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  ${({ $danger, theme }) =>
    $danger
      ? `
    border-color: ${theme.colors.palette.danger}55;
    background: ${theme.colors.bg.overlay};
  `
      : ""}

  &:hover {
    filter: brightness(1.08);
  }
`;

function normalizeSlashes(p: string) {
  return (p ?? "").replace(/\\/g, "/");
}

function baseName(p: string) {
  const s = normalizeSlashes(p).replace(/\/+$/, "");
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(i + 1) : s;
}

function dirname(p: string) {
  const s = normalizeSlashes(p);
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(0, i) : "";
}

function computeCommonRoot(paths: string[]) {
  const dirs = paths
    .map((p) => dirname(normalizeSlashes(p)))
    .filter(Boolean);
  if (!dirs.length) return "";

  const parts = dirs.map((d) => d.split("/").filter(Boolean));
  if (!parts.length) return "";

  const first = parts[0];
  let k = 0;
  while (k < first.length) {
    const seg = first[k];
    if (parts.some((p) => p[k] !== seg)) break;
    k++;
  }
  const root = first.slice(0, k).join("/");
  return root;
}

function smartRelPath(raw: string, projectRoot: string | null, fallbackRoot: string) {
  const abs = normalizeSlashes(raw);
  const root = projectRoot ? normalizeSlashes(projectRoot).replace(/\/+$/, "") : "";
  const fb = normalizeSlashes(fallbackRoot).replace(/\/+$/, "");

  const tryStrip = (base: string) => {
    if (!base) return "";
    if (abs === base) return "";
    if (abs.startsWith(base + "/")) return abs.slice(base.length + 1);
    if (abs.startsWith(base)) return abs.slice(base.length).replace(/^\/+/, "");
    return "";
  };

  const rel1 = tryStrip(root);
  if (rel1) return rel1;

  const rel2 = tryStrip(fb);
  if (rel2) return rel2;

  return abs;
}


function buildTree(files: { rel: string; nodeId: string }[]): TreeDir {
  const root: TreeDir = { kind: "dir", name: "", path: "", children: [] };

  const ensureDir = (parent: TreeDir, name: string, path: string) => {
    const existing = parent.children.find(
      (c) => c.kind === "dir" && (c as TreeDir).name === name
    ) as TreeDir | undefined;
    if (existing) return existing;
    const d: TreeDir = { kind: "dir", name, path, children: [] };
    parent.children.push(d);
    return d;
  };

  for (const f of files) {
    const parts = f.rel.split("/").filter(Boolean);
    if (!parts.length) continue;

    let cur = root;
    let curPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      if (isLast) {
        cur.children.push({
          kind: "file",
          name: part,
          path: f.rel,
          nodeId: f.nodeId,
        });
      } else {
        curPath = curPath ? `${curPath}/${part}` : part;
        cur = ensureDir(cur, part, curPath);
      }
    }
  }

  const sortDir = (d: TreeDir) => {
    d.children.sort((a: any, b: any) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const c of d.children) {
      if (c.kind === "dir") sortDir(c as TreeDir);
    }
  };
  sortDir(root);

  return root;
}

export const ProjectExplorerSidebar = memo((props: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set<string>([""]));
  const [query, setQuery] = useState<string>("");
  const theme = useTheme();
  const { nodes, projectRoot, bundleTargets, setBundleTargets, defaultDepth, onActivateFile, onHoverFile } =
    props;

  const fileNodes = useMemo(() => {
    const raw: { abs: string; nodeId: string }[] = [];
    for (const n of nodes as any[]) {
      if (n?.type !== "fileNode") continue;
      const data: any = n?.data ?? {};
      const p =
        typeof data.path === "string" && data.path
          ? data.path
          : typeof n?.id === "string"
          ? n.id
          : "";
      if (!p) continue;
      raw.push({ abs: normalizeSlashes(p), nodeId: String(n.id) });
    }

    const fallbackRoot = computeCommonRoot(raw.map((r) => r.abs));

    const out: { rel: string; nodeId: string }[] = [];
    for (const r of raw) {
      const rel = smartRelPath(r.abs, projectRoot, fallbackRoot);
      if (!rel) continue;
      out.push({ rel, nodeId: r.nodeId });
    }
    return out;
  }, [nodes, projectRoot]);

  const tree = useMemo(() => buildTree(fileNodes), [fileNodes]);

  const rootLabel = useMemo(() => {
    // Prefer workspace root name if it matches our file paths; otherwise use common-root name.
    const pr = projectRoot ? baseName(projectRoot) : "";
    // If many of the rel paths still contain a drive letter or start with 'Users'/'home', it's not stripped.
    const looksAbsolute = fileNodes.some((f) => /^(?:[a-zA-Z]:\/|\/)/.test(f.rel));
    if (pr && !looksAbsolute) return pr;
    // Fallback: use the top-level folder name in the tree if present.
    const firstDir = (tree.children.find((c) => c.kind === "dir") as any)?.name as string | undefined;
    if (firstDir) return firstDir;
    // Otherwise: best effort label.
    return pr || "Project";
  }, [projectRoot, fileNodes, tree]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as { rel: string; nodeId: string }[];
    return fileNodes.filter((f) => normalizeSlashes(f.rel).toLowerCase().includes(q));
  }, [query, fileNodes]);

  const selectedByRel = useMemo(() => {
    const m = new Map<string, BundleTarget>();
    for (const t of bundleTargets) m.set(normalizeSlashes(t.entryPoint), t);
    return m;
  }, [bundleTargets]);



  const toggleDir = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleFile = (nodeId: string, rel: string, multi: boolean) => {
    const entryPoint = normalizeSlashes(rel);
    
    const label = baseName(entryPoint);
    
    setBundleTargets((prev) => {
      const exists = prev.some((p) => normalizeSlashes(p.entryPoint) === entryPoint);
      const nextTarget: BundleTarget = {
        nodeId,
        entryPoint: nodeId,
        depth: Math.max(1, Math.min(25, Math.floor(defaultDepth || 3))),
        label,
      };

      if (multi) {
        return exists
          ? prev.filter((p) => normalizeSlashes(p.entryPoint) !== entryPoint)
          : [...prev, nextTarget];
      }
      return [nextTarget];
    });

    // Clear search after picking a result (so results don't stick around).
    setQuery("");
    onActivateFile?.(nodeId);
  };

  const renderDir = (d: TreeDir, indent: number) => {
    const isOpen = expanded.has(d.path || "");
    const displayName = d.path ? d.name : rootLabel;

    return (
      <div key={`dir:${d.path || "root"}`}>
        <Row $indent={indent} onClick={() => toggleDir(d.path || "")} title={d.path || "root"}>
          {isOpen ? <VscChevronDown /> : <VscChevronRight />}
          <VscFolder />
          <Name>{displayName}</Name>
        </Row>

        {isOpen &&
          d.children.map((c: any) => {
            if (c.kind === "dir") return renderDir(c as TreeDir, indent + 1);

            const f = c as TreeFile;
            const selected = selectedByRel.has(normalizeSlashes(f.path));
            return (
              <Row
                key={`file:${f.path}`}
                $indent={indent + 1}
                $active={selected}
                title={f.path}
                onMouseEnter={() => onHoverFile?.(f.nodeId)}
                onMouseLeave={() => onHoverFile?.(null)}
                onClick={(e) => {
                  const multi = !!((e as any).ctrlKey || (e as any).metaKey);
                  toggleFile(f.nodeId, f.path, multi);
                }}
              >
                <span style={{ width: 16, display: "grid", placeItems: "center" }}>
                  <VscFile />
                </span>
                <Name>{f.name}</Name>
              </Row>
            );
          })}
      </div>
    );
  };

  return (
    <SidebarShell $variant="overlay" $padding={0} $radius="none" $border={false} onMouseLeave={() => onHoverFile?.(null)}>
      <Header>
        <Title>Explorer</Title>
        <Hint>Click = select · Ctrl/Cmd+Click = multi</Hint>
      </Header>

      <Section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SectionTitle>Bundle selection</SectionTitle>

          {bundleTargets.length > 0 && (
            <SmallButton $danger onClick={() => setBundleTargets(() => [])} title="Clear selection">
              <VscTrash /> Clear
            </SmallButton>
          )}
        </div>

        {bundleTargets.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Select files in the graph or explorer to bundle their downstream imports.
          </div>
        ) : (
          <SelectionList>
            {bundleTargets.map((t) => (
              <SelectionRow key={t.entryPoint}>
                <SelectionPath>
                  <SelName title={t.entryPoint}>{t.label ?? baseName(t.entryPoint)}</SelName>
                  <SelPath title={t.entryPoint}>{t.entryPoint}</SelPath>
                </SelectionPath>

                <DepthInput
                  type="number"
                  min={1}
                  max={25}
                  value={t.depth}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(25, Math.floor(Number(e.target.value) || 1)));
                    setBundleTargets((prev) =>
                      prev.map((p) => (p.entryPoint === t.entryPoint ? { ...p, depth: v } : p))
                    );
                  }}
                />

                <IconButton
                  title="Remove"
                  onClick={() =>
                    setBundleTargets((prev) => prev.filter((p) => p.entryPoint !== t.entryPoint))
                  }
                >
                  <VscClose />
                </IconButton>
              </SelectionRow>
            ))}
          </SelectionList>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              style={{
                width: 18,
                height: 3,
                background: theme.colors.palette.primary,
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 11, opacity: 0.75 }}>outgoing</span>
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
            <span style={{ fontSize: 11, opacity: 0.75 }}>incoming</span>
          </div>
        </div>
      </Section>

      <SearchWrap>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files…"
        />
      </SearchWrap>

      <ExplorerWrap>
        {query.trim() ? (
          matches.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.7, padding: "8px 10px" }}>
              No matches.
            </div>
          ) : (
            matches.map((m) => {
              const rel = normalizeSlashes(m.rel);
              const name = baseName(rel);
              const selected = selectedByRel.has(rel);
              return (
                <Row
                  key={`search:${rel}`}
                  $indent={0}
                  $active={selected}
                  title={rel}
                  onMouseEnter={() => onHoverFile?.(m.nodeId)}
                  onMouseLeave={() => onHoverFile?.(null)}
                  onClick={(e) => {
                    const multi = !!((e as any).ctrlKey || (e as any).metaKey);
                    toggleFile(m.nodeId, rel, multi);
                  }}
                >
                  <span style={{ width: 16, display: "grid", placeItems: "center" }}>
                    <VscFile />
                  </span>
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Name>{name}</Name>
                    <PathHint>{rel}</PathHint>
                  </div>
                </Row>
              );
            })
          )
        ) : (
          renderDir(tree, 0)
        )}
      </ExplorerWrap>
    </SidebarShell>
  );
});
