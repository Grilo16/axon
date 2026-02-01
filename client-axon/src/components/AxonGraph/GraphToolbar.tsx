import { useState } from "react";
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
    filter: none;
  }
`;

const PreviewActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const CopyButton = styled.button`
  background: ${({ theme }) => theme.colors.bg.overlay};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 12px;

  &:hover {
    filter: brightness(1.08);
  }
`;

const PreviewBox = styled.pre`
  margin: 0;
  background: ${({ theme }) => theme.colors.bg.main};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  line-height: 1.45;
  max-height: 55vh;
  overflow: auto;
  white-space: pre-wrap;
`;

export const GraphToolbar = ({
  onRescan,
  isScanning,
}: {
  onRescan: () => void;
  isScanning: boolean;
}) => {
  const { projectRoot, config, scanConfig } = useWorkspace();
  const { generateCombinedPrompt } = useAxonCore();
  const toast = useToast();

  const [isBundling, setIsBundling] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);

  const canBundle =
    !!projectRoot && !!config && !!scanConfig?.entryPoint && (scanConfig?.depth ?? 0) > 0;

  const handleBundle = async () => {
    if (!projectRoot) {
      toast.warning("No workspace loaded", "Open or create a workspace first.");
      return;
    }
    if (!scanConfig?.entryPoint) {
      toast.warning("No entrypoint", "Choose an entry file to scan first.");
      return;
    }
    if (!config) {
      toast.danger("Missing config", "Root config is unavailable; try reloading the app.");
      return;
    }

    setIsBundling(true);
    const loadingId = toast.loading(
      "Bundling prompt…",
      `Generating markdown from ${scanConfig.entryPoint} (depth ${scanConfig.depth ?? 3})…`
    );

    try {
      // Keep using the combined endpoint for compatibility; we just pass 1 group.
      const markdown = await generateCombinedPrompt({
        projectRoot,
        groups: [
          {
            entryPoint: scanConfig.entryPoint,
            depth: scanConfig.depth ?? 3,
            flatten: !!scanConfig.flatten,
          },
        ],
        options: config,
      });

      await navigator.clipboard.writeText(markdown);
      setPreviewMarkdown(markdown);

      toast.dismiss(loadingId);
      toast.success("Copied to clipboard", "Your prompt markdown is ready.", {
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

          <ToolButton $primary onClick={handleBundle} disabled={isBundling || !canBundle}>
            {isBundling ? <VscLoading className="spin" /> : <VscExport />}
            {isBundling ? "Bundling…" : "Bundle & Copy"}
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

        <PreviewBox>{previewMarkdown ?? ""}</PreviewBox>
      </Modal>
    </>
  );
};
