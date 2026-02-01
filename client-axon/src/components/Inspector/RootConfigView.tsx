import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useWorkspace } from "@features/workspace/useWorkspace";
import { Heading, Subtext } from "@components/ui/Typography";
import { VscSearch, VscSettingsGear } from "react-icons/vsc";
import { PromptRuleEditor } from "./PromptRuleEditor";
import { useToggle } from "@app/hooks";
import { useFileSystem } from "@features/axon/useFileSystem";
import { FileSelectorModal } from "@components/FileSelector/FileSelectorModal";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

const InfoBox = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
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
  const { config, setOptions, projectRoot, scanConfig, setScan } =
    useWorkspace();

  const { isOpen, toggle, open } = useToggle();
  const fs = useFileSystem(projectRoot || null);

  const [entryPoint, setEntryPoint] = useState(scanConfig?.entryPoint ?? "");
  const [depth, setDepth] = useState<number>(scanConfig?.depth ?? 3);
  const [flatten, setFlatten] = useState<boolean>(scanConfig?.flatten ?? true);

  useEffect(() => {
    setEntryPoint(scanConfig?.entryPoint ?? "");
    setDepth(scanConfig?.depth ?? 3);
    setFlatten(scanConfig?.flatten ?? true);
  }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);

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
                open();
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
        <InfoBox style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
          {projectRoot}
        </InfoBox>
      </Section>

      <PromptRuleEditor
        options={config}
        setOptions={(patch) => setOptions(patch)}
        hint="Pro tip: you can author rules directly from the graph by clicking symbols on FileNodes."
      />

      <FileSelectorModal
        isOpen={isOpen}
        toggle={toggle}
        fs={fs}
        mode="file"
        onSelect={(path) => {
          setEntryPoint(path);
          setScan({ entryPoint: path });
        }}
      />
    </Container>
  );
};
