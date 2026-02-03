import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useWorkspace } from "@features/workspace/useWorkspace";
import { Heading, Subtext } from "@components/ui/Typography";
import { VscSearch, VscSettingsGear, VscFolderOpened } from "react-icons/vsc";
import { PromptRuleEditor } from "./PromptRuleEditor";
import { useToggle } from "@app/hooks";
import { useFileSystem } from "@features/axon/useFileSystem";
import { FileSelectorModal } from "@components/FileSelector/FileSelectorModal";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SmallHint = styled(Subtext)`
  font-size: 11px;
  max-width: 100%;
`;


const InputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1 1 280px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 10px;
  border-radius: 6px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.palette.primary};
    outline: none;
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex: 0 0 auto;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  user-select: none;
  color: ${({ theme }) => theme.colors.text.secondary};

  input {
    transform: translateY(1px);
  }
`;

export const RootConfigView = () => {
  const { config, setOptions, projectRoot, scanConfig, setScan, setProjectRoot } =
    useWorkspace();

  const entryPicker = useToggle();
  const rootPicker = useToggle();

  const fs = useFileSystem(projectRoot || null);
  const rootFs = useFileSystem("/");

  const [entryPoint, setEntryPoint] = useState(scanConfig?.entryPoint ?? "");
  const [depth, setDepth] = useState<number>(scanConfig?.depth ?? 3);
  const [flatten, setFlatten] = useState<boolean>(scanConfig?.flatten ?? true);
  const [rootDraft, setRootDraft] = useState(projectRoot ?? "");

  useEffect(() => {
    setEntryPoint(scanConfig?.entryPoint ?? "");
    setDepth(scanConfig?.depth ?? 3);
    setFlatten(scanConfig?.flatten ?? true);
  }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);

  useEffect(() => {
    setRootDraft(projectRoot ?? "");
    if (projectRoot) {
      // keep the entry-point browser rooted to the current workspace root
      fs.cd(projectRoot);
    }
  }, [projectRoot]);

  const canBrowse = useMemo(() => Boolean(projectRoot), [projectRoot]);

  const commitScanSettings = () => {
    setScan({
      entryPoint: entryPoint.trim(),
      depth: Math.max(1, Number.isFinite(depth) ? depth : 3),
      flatten: !!flatten,
    });
  };

  if (!config) return null;

  return (
    <Container>
      <div>
        <Heading>
          <VscSettingsGear /> Global Settings
        </Heading>
        <Subtext>
          Single scan from an entrypoint. Groups in the graph are created
          automatically from folders.
        </Subtext>
      </div>

      <Section>
        <Label>Scan Settings</Label>

        <div>
          <Subtext style={{ marginBottom: 8 }}>Entry Point</Subtext>
          <InputRow>
            <Input
              value={entryPoint}
              onChange={(e) => setEntryPoint(e.target.value)}
              onBlur={commitScanSettings}
              placeholder="src/main.rs"
            />
            <Button
              onClick={() => {
                if (!canBrowse) return;
                fs.refresh();
                entryPicker.open();
              }}
              disabled={!canBrowse}
              title={canBrowse ? "Browse files" : "Open a workspace first"}
            >
              <VscSearch />
              Browse
            </Button>
          </InputRow>
        </div>

        <div>
          <Subtext style={{ marginBottom: 8 }}>Depth</Subtext>
          <Input
            type="number"
            min={1}
            max={25}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            onBlur={commitScanSettings}
          />
        </div>

        <CheckboxLabel>
          <input
            type="checkbox"
            checked={flatten}
            onChange={(e) => {
              setFlatten(e.target.checked);
              setScan({ flatten: e.target.checked });
            }}
          />
          Flatten directory structure during scan
        </CheckboxLabel>
      </Section>

      <Section>
        <Label>Project Root</Label>
        <Subtext style={{ marginBottom: 8 }}>Workspace folder</Subtext>
        <InputRow>
          <Input
            value={rootDraft}
            readOnly
            onClick={() => {
              rootFs.cd(rootDraft || "/");
              rootPicker.open();
            }}
            style={{ cursor: "default", fontFamily: "monospace" }}
            title="Click to browse and change the workspace root"
          />
          <Button
            onClick={() => {
              rootFs.cd(rootDraft || "/");
              rootPicker.open();
            }}
            title="Browse for a new workspace root folder"
          >
            <VscFolderOpened />
            Browse
          </Button>
        </InputRow>
        <SmallHint>
          Changing the root will clear the current entrypoint and you&#39;ll need to scan again.
        </SmallHint>
      </Section>

      <PromptRuleEditor
        options={config}
        setOptions={(patch) => setOptions(patch)}
        hint="Pro tip: you can author rules directly from the graph by clicking symbols on FileNodes."
      />

      <FileSelectorModal
        isOpen={entryPicker.isOpen}
        toggle={entryPicker.toggle}
        fs={fs}
        mode="file"
        onSelect={(path) => {
          setEntryPoint(path);
          setScan({ entryPoint: path });
        }}
      />

      <FileSelectorModal
        isOpen={rootPicker.isOpen}
        toggle={rootPicker.toggle}
        fs={rootFs}
        mode="directory"
        onSelect={(path) => {
          setRootDraft(path);
          setProjectRoot(path);
          // entrypoints are relative to the current root; clear it on change
          setEntryPoint("");
          setScan({ entryPoint: "" });
        }}
      />
    </Container>
  );
};
