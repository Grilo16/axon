import { useMemo, useState } from "react";
import styled from "styled-components";
import { Panel } from "@xyflow/react";
import { VscExport, VscLoading, VscSync } from "react-icons/vsc";
import { useWorkspace } from "@features/workspace/useWorkspace";
import { useAxonCore } from "@features/axon/useAxonCore";
import { useToast } from "@components/ui/Toast";
import { Modal } from "@components/ui/Modal";

const ToolbarContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ToolButton = styled.button<{ $primary?: boolean }>`
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.palette.primary : theme.colors.bg.surface};
  color: ${({ theme, $primary }) => ($primary ? "#fff" : theme.colors.text.primary)};
  border: 1px solid ${({ theme, $primary }) => ($primary ? "transparent" : theme.colors.border)};
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover:enabled {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScopeBadge = styled.span`
  margin-left: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.18);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const PreviewBox = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.main};
  color: ${({ theme }) => theme.colors.text.primary};
  max-height: 62vh;
  overflow: auto;
`;

const PreviewActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`;

const CopyButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    filter: brightness(1.08);
  }
`;

export type BundleTarget = {
  entryPoint: string;
  depth: number;
  label?: string;
};

export const GraphToolbar = ({
  onRescan,
  isScanning,
  bundleTargets,
}: {
  onRescan: () => void;
  isScanning: boolean;
  bundleTargets?: BundleTarget[] | null;
}) => {
  const { projectRoot, config, scanConfig } = useWorkspace();
  const { generateCombinedPrompt } = useAxonCore();
  const toast = useToast();

  const [isBundling, setIsBundling] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);

  const [lastBundleMeta, setLastBundleMeta] = useState<{
    scope: "selection" | "entrypoint";
    groups: { entryPoint: string; depth: number }[];
  } | null>(null);

  const defaultGroup = useMemo(() => {
    const ep = scanConfig?.entryPoint?.trim();
    if (!ep) return null;
    return {
      entryPoint: ep,
      depth: Math.max(1, Number(scanConfig?.depth) || 1),
      flatten: !!scanConfig?.flatten,
    };
  }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);

  const selectionGroups = useMemo(() => {
    const items = (bundleTargets ?? []).filter((t) => (t?.entryPoint ?? "").trim().length > 0);
    if (!items.length) return [];
    const dedup = new Map<string, BundleTarget>();
    for (const t of items) dedup.set(t.entryPoint.trim(), t);
    return Array.from(dedup.values()).map((t) => ({
      entryPoint: t.entryPoint.trim(),
      depth: Math.max(1, Number(t.depth) || 1),
      flatten: !!scanConfig?.flatten,
    }));
  }, [bundleTargets, scanConfig?.flatten]);

  const activeScope: "selection" | "entrypoint" = selectionGroups.length ? "selection" : "entrypoint";

  const groupsToBundle = useMemo(() => {
    if (selectionGroups.length) return selectionGroups;
    return defaultGroup ? [defaultGroup] : [];
  }, [selectionGroups, defaultGroup]);

  const canBundle = useMemo(() => {
    if (!projectRoot) return false;
    if (!config) return false;
    return groupsToBundle.length > 0;
  }, [projectRoot, config, groupsToBundle.length]);

  const bundleTitle = useMemo(() => {
    if (selectionGroups.length) return `Bundle ${selectionGroups.length} entrypoints`;
    if (defaultGroup?.entryPoint) return `Bundle from ${defaultGroup.entryPoint}`;
    return "Bundle & Copy";
  }, [selectionGroups.length, defaultGroup?.entryPoint]);

  const handleBundle = async () => {
    if (!projectRoot) {
      toast.warning("No workspace loaded", "Open or create a workspace first.");
      return;
    }

    if (!groupsToBundle.length) {
      toast.warning(
        "Nothing selected",
        "Select a file node (Ctrl/Cmd+Click to multi-select) or choose an entry file to scan first."
      );
      return;
    }

    if (!config) {
      toast.danger("Missing config", "Root config is unavailable; try reloading the app.");
      return;
    }

    setIsBundling(true);

    const scopeText = activeScope === "selection" ? "selection" : "entrypoint";
    const loadingId = toast.loading(
      "Bundling prompt…",
      selectionGroups.length
        ? `Generating markdown from ${groupsToBundle.length} entrypoints [${scopeText}]…`
        : `Generating markdown from ${groupsToBundle[0].entryPoint} (depth ${groupsToBundle[0].depth}) [${scopeText}]…`
    );

    try {
      const markdown = await generateCombinedPrompt({
        projectRoot,
        groups: groupsToBundle,
        options: config,
      });

      await navigator.clipboard.writeText(markdown);

      setPreviewMarkdown(markdown);
      setLastBundleMeta({
        scope: activeScope,
        groups: groupsToBundle.map((g) => ({ entryPoint: g.entryPoint, depth: g.depth })),
      });

      toast.dismiss(loadingId);

      toast.success("Bundled & copied", "Prompt is in your clipboard.", {
        actionLabel: "Preview",
        onAction: () => setPreviewOpen(true),
        duration: 4500,
      });
    } catch (err) {
      console.error("Bundle failed", err);
      toast.dismiss(loadingId);
      toast.danger("Bundle failed", "Check the console for details and try again.", {
        duration: 6500,
      });
    } finally {
      setIsBundling(false);
    }
  };

  const handleCopyAgain = async () => {
    if (!previewMarkdown) return;
    await navigator.clipboard.writeText(previewMarkdown);
    toast.success("Copied again", "Bundle text is back in your clipboard.");
  };

  return (
    <>
      <Panel position="top-right">
        <ToolbarContainer>
          <ToolButton onClick={onRescan} disabled={isScanning || !scanConfig?.entryPoint}>
            <VscSync />
            {isScanning ? "Scanning…" : "Rescan"}
          </ToolButton>

          <ToolButton $primary onClick={handleBundle} disabled={isBundling || !canBundle} title={bundleTitle}>
            {isBundling ? <VscLoading className="spin" /> : <VscExport />}
            {isBundling ? "Bundling…" : "Bundle & Copy"}
            {activeScope === "selection" ? <ScopeBadge>selection</ScopeBadge> : <ScopeBadge>app</ScopeBadge>}
          </ToolButton>
        </ToolbarContainer>
      </Panel>

      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Bundled Prompt Preview">
        <PreviewActions>
          <CopyButton onClick={handleCopyAgain}>Copy</CopyButton>
          <span style={{ opacity: 0.8, fontSize: 12 }}>
            This is exactly what was copied to your clipboard.
          </span>
        </PreviewActions>

        {lastBundleMeta ? (
          <div style={{ marginBottom: 10, opacity: 0.85, fontSize: 12 }}>
            Scope: <strong>{lastBundleMeta.scope}</strong> · Groups:{" "}
            <strong>{lastBundleMeta.groups.length}</strong>
            <div style={{ marginTop: 6, fontFamily: "monospace", opacity: 0.9 }}>
              {lastBundleMeta.groups.slice(0, 6).map((g) => (
                <div key={g.entryPoint}>
                  {g.entryPoint} <span style={{ opacity: 0.8 }}>· depth {g.depth}</span>
                </div>
              ))}
              {lastBundleMeta.groups.length > 6 ? (
                <div style={{ opacity: 0.8 }}>…and {lastBundleMeta.groups.length - 6} more</div>
              ) : null}
            </div>
          </div>
        ) : null}

        <PreviewBox>{previewMarkdown ?? ""}</PreviewBox>
      </Modal>
    </>
  );
};
