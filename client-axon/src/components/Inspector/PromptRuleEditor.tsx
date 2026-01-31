import { useMemo, useState } from "react";
import styled from "styled-components";
import type { PromptOptions } from "@axon-types/axonTypes";
import { Subtext } from "@components/ui/Typography";
import { VscAdd, VscTrash } from "react-icons/vsc";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
`;

const Label = styled.div`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SmallHint = styled(Subtext)`
  font-size: 11px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 4px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px;
  border-radius: 4px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.palette.primary};
    outline: none;
  }
`;

const Button = styled.button<{ $tone?: "primary" | "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "danger" ? theme.colors.palette.danger : theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme, $tone }) =>
    $tone === "danger"
      ? theme.colors.palette.danger
      : theme.colors.text.primary};

  &:hover {
    border-color: ${({ theme, $tone }) =>
      $tone === "danger"
        ? theme.colors.palette.danger
        : theme.colors.palette.primary};
  }
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div<{ $tone?: "target" | "redact" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};

  ${({ $tone, theme }) =>
    $tone === "redact"
      ? `
    border-color: ${theme.colors.palette.danger};
  `
      : $tone === "target"
        ? `
    border-color: ${theme.colors.palette.accent};
  `
        : ""}
`;

const ChipText = styled.span`
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ChipX = styled.button<{ $tone?: "target" | "redact" }>`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  cursor: pointer;
  color: ${({ theme, $tone }) =>
    $tone === "redact"
      ? theme.colors.palette.danger
      : $tone === "target"
        ? theme.colors.palette.accent
        : theme.colors.text.secondary};

  &:hover {
    border-color: ${({ theme, $tone }) =>
      $tone === "redact"
        ? theme.colors.palette.danger
        : $tone === "target"
          ? theme.colors.palette.accent
          : theme.colors.palette.primary};
  }
`;

function normalizeMany(raw: string): string[] {
  // supports comma/newline separated lists
  return raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function upsertMany(existing: string[], toAdd: string[]) {
  const set = new Set(existing);
  for (const item of toAdd) set.add(item);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function removeOne(existing: string[], item: string) {
  return existing.filter((x) => x !== item);
}

export function PromptRuleEditor(props: {
  options: PromptOptions;
  setOptions: (patch: Partial<PromptOptions>) => void;
  hint?: string;
}) {
  const { options, setOptions, hint } = props;

  const [targetInput, setTargetInput] = useState("");
  const [redactInput, setRedactInput] = useState("");

  const targetLabel = useMemo(() => {
    if (options.skeletonMode === "keepOnly")
      return "Keep only (fileName:Target)";
    if (options.skeletonMode === "stripOnly")
      return "Strip only (fileName:Target)";
    return "Targets (fileName:Target)";
  }, [options.skeletonMode]);

  const targetToneHint = useMemo(() => {
    if (options.skeletonMode === "all") {
      return "In “Signatures” mode, everything is skeletonized; targets are effectively ignored.";
    }
    if (options.skeletonMode === "keepOnly") {
      return "Only these targets will keep implementation detail; everything else is skeletonized.";
    }
    return "Only these targets will be skeletonized; everything else stays intact.";
  }, [options.skeletonMode]);

  return (
    <Wrap>
      <Section>
        <LabelRow>
          <Label>Skeleton Strategy</Label>
          <SmallHint>{targetToneHint}</SmallHint>
        </LabelRow>

        <Select
          value={options.skeletonMode}
          onChange={(e) => setOptions({ skeletonMode: e.target.value })}
        >
          <option value="all">Signatures</option>
          <option value="stripOnly">
            Strip Only (Implementation & Signatures)
          </option>
          <option value="keepOnly">Keep Essential Only</option>
        </Select>

        {hint ? <SmallHint>{hint}</SmallHint> : null}
      </Section>

      <Section>
        <LabelRow>
          <Label>{targetLabel}</Label>
          <SmallHint>Example: inventorySlice.ts:addItem</SmallHint>
        </LabelRow>

        <Row>
          <Input
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            placeholder="App.tsx:App"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const next = upsertMany(
                  options.skeletonTargets,
                  normalizeMany(targetInput),
                );
                setOptions({ skeletonTargets: next });
                setTargetInput("");
              }
            }}
          />
          <Button
            onClick={() => {
              const next = upsertMany(
                options.skeletonTargets,
                normalizeMany(targetInput),
              );
              setOptions({ skeletonTargets: next });
              setTargetInput("");
            }}
          >
            <VscAdd /> Add
          </Button>
          <Button
            $tone="danger"
            onClick={() => setOptions({ skeletonTargets: [] })}
            title="Clear skeleton targets"
          >
            <VscTrash /> Clear
          </Button>
        </Row>

        <ChipList>
          {options.skeletonTargets.map((t) => (
            <Chip key={t} $tone="target">
              <ChipText>{t}</ChipText>
              <ChipX
                $tone="target"
                aria-label={`remove ${t}`}
                onClick={() =>
                  setOptions({
                    skeletonTargets: removeOne(options.skeletonTargets, t),
                  })
                }
              >
                ×
              </ChipX>
            </Chip>
          ))}
        </ChipList>
      </Section>

      <Section>
        <LabelRow>
          <Label>Redactions (fileName:Target)</Label>
          <SmallHint>Example: App.tsx:Hideme</SmallHint>
        </LabelRow>

        <Row>
          <Input
            value={redactInput}
            onChange={(e) => setRedactInput(e.target.value)}
            placeholder="inventorySlice.ts:name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const next = upsertMany(
                  options.redactions,
                  normalizeMany(redactInput),
                );
                setOptions({ redactions: next });
                setRedactInput("");
              }
            }}
          />
          <Button
            onClick={() => {
              const next = upsertMany(
                options.redactions,
                normalizeMany(redactInput),
              );
              setOptions({ redactions: next });
              setRedactInput("");
            }}
          >
            <VscAdd /> Add
          </Button>
          <Button
            $tone="danger"
            onClick={() => setOptions({ redactions: [] })}
            title="Clear redactions"
          >
            <VscTrash /> Clear
          </Button>
        </Row>

        <ChipList>
          {options.redactions.map((r) => (
            <Chip key={r} $tone="redact">
              <ChipText>{r}</ChipText>
              <ChipX
                $tone="redact"
                aria-label={`remove ${r}`}
                onClick={() =>
                  setOptions({ redactions: removeOne(options.redactions, r) })
                }
              >
                ×
              </ChipX>
            </Chip>
          ))}
        </ChipList>

        <SmallHint>
          Tip: click a symbol chip inside a FileNode to auto-add{" "}
          <code>fileName:Target</code>.
        </SmallHint>
      </Section>
    </Wrap>
  );
}
