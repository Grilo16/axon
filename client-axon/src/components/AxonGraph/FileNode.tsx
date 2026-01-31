import { memo, useMemo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import styled from "styled-components";
import { VscCode, VscSymbolMethod, VscSymbolVariable } from "react-icons/vsc";
import type { AxonNode } from "@axon-types/axonTypes";
import { useWorkspace } from "@features/workspace/useWorkspace";

const NodeContainer = styled.div<{ $selected?: boolean }>`
  background: #252526;
  border: 1px solid ${(props) => (props.$selected ? "#007acc" : "#454545")};
  border-radius: 4px;
  padding: 12px;
  color: #cccccc;
  min-width: 230px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  transition: border-color 0.2s ease;
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 13px;
  color: #e1e1e1;
`;

const RuleBadges = styled.div`
  margin-left: auto;
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  opacity: 0.85;
`;

const Badge = styled.div<{ $tone: "target" | "redact" }>`
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid ${({ $tone }) => ($tone === "redact" ? "#d13438" : "#b08800")};
  color: ${({ $tone }) => ($tone === "redact" ? "#d13438" : "#b08800")};
`;

const SymbolList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  color: #666;
  margin: 4px 0;
  font-weight: bold;
`;

const SymbolRow = styled.div<{ $state: "normal" | "target" | "redact" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  background: #1e1e1e;
  border: 1px solid #333;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;

  color: ${({ $state }) =>
    $state === "redact" ? "#d13438" : $state === "target" ? "#d7ba7d" : "#4fc1ff"};

  ${({ $state }) =>
    $state === "redact"
      ? "border-color: #d13438;"
      : $state === "target"
        ? "border-color: #b08800;"
        : ""}

  svg {
    flex-shrink: 0;
    color: #b4a7d6;
  }
`;

const RowLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const SymbolName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
`;

const MiniBtn = styled.button<{ $active?: boolean; $tone?: "target" | "redact" }>`
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  cursor: pointer;

  border: 1px solid
    ${({ $tone, $active }) =>
      $tone === "redact"
        ? $active
          ? "#d13438"
          : "#5a2a2c"
        : $active
          ? "#b08800"
          : "#4a3b16"};

  color: ${({ $tone, $active }) =>
    $tone === "redact"
      ? $active
        ? "#d13438"
        : "#c58f92"
      : $active
        ? "#d7ba7d"
        : "#cbbf9b"};

  background: transparent;

  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover {
    filter: brightness(1.15);
  }
`;

const MoreLink = styled.button`
  background: transparent;
  border: none;
  padding: 2px 0;
  text-align: left;
  cursor: pointer;
  font-size: 10px;
  color: #9cdcfe;
  opacity: 0.9;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item].sort();
}

function basename(p: string) {
  const parts = p.split(/[\\/]/g);
  return parts[parts.length - 1] || p;
}

export const FileNode = memo(({ data, selected }: NodeProps<AxonNode>) => {
  const { config, setOptions } = useWorkspace();
  const [showAllDefs, setShowAllDefs] = useState(false);
  const [showAllCalls, setShowAllCalls] = useState(false);

  const fileName = useMemo(() => {
    const label = (data as any)?.label as string | undefined;
    const path = (data as any)?.path as string | undefined;
    return label?.trim() || (path ? basename(path) : "UnknownFile");
  }, [data]);

  const redactions = config?.redactions ?? [];
  const skeletonTargets = config?.skeletonTargets ?? [];
  const skeletonMode = config?.skeletonMode ?? "stripOnly";

  const canTargetImpl = skeletonMode !== "all";
  const implVerb = skeletonMode === "keepOnly" ? "Keep" : "Strip";

  const fileTargetCount = useMemo(
    () => skeletonTargets.filter((t) => t.startsWith(`${fileName}:`)).length,
    [skeletonTargets, fileName]
  );
  const fileRedactCount = useMemo(
    () => redactions.filter((r) => r.startsWith(`${fileName}:`)).length,
    [redactions, fileName]
  );

  const makeToken = (symbol: string) => `${fileName}:${symbol}`;

  const toggleImpl = (token: string) => {
    if (!config) return;

    // treat Impl vs Redact as mutually exclusive for clarity
    const nextTargets = toggle(skeletonTargets, token);
    const nextRedactions = redactions.includes(token) ? redactions.filter((r) => r !== token) : redactions;

    setOptions({ skeletonTargets: nextTargets, redactions: nextRedactions });
  };

  const toggleRedact = (token: string) => {
    if (!config) return;

    // mutually exclusive
    const nextRedactions = toggle(redactions, token);
    const nextTargets = skeletonTargets.includes(token)
      ? skeletonTargets.filter((t) => t !== token)
      : skeletonTargets;

    setOptions({ redactions: nextRedactions, skeletonTargets: nextTargets });
  };

  const defs = ((data as any)?.definitions as string[]) ?? [];
  const calls = ((data as any)?.calls as string[]) ?? [];

  const defSlice = showAllDefs ? defs : defs.slice(0, 3);
  const callSlice = showAllCalls ? calls : calls.slice(0, 2);

  const renderSymbol = (symbol: string, kind: "def" | "call") => {
    const token = makeToken(symbol);
    const isRedact = redactions.includes(token);
    const isTarget = skeletonTargets.includes(token);

    const state: "normal" | "target" | "redact" = isRedact ? "redact" : isTarget ? "target" : "normal";

    return (
      <SymbolRow key={`${kind}:${symbol}`} $state={state}>
        <RowLeft>
          {kind === "def" ? <VscSymbolMethod size={12} /> : <VscSymbolVariable size={12} />}
          <SymbolName title={token}>{symbol}</SymbolName>
        </RowLeft>

        <Actions>
          <MiniBtn
            $tone="target"
            $active={isTarget}
            disabled={!canTargetImpl}
            onClick={(e) => {
              e.stopPropagation();
              toggleImpl(token);
            }}
            title={!canTargetImpl ? "Targets are ignored in “all” mode" : `${implVerb} implementation for ${token}`}
          >
            {implVerb}
          </MiniBtn>

          <MiniBtn
            $tone="redact"
            $active={isRedact}
            onClick={(e) => {
              e.stopPropagation();
              toggleRedact(token);
            }}
            title={`Redact ${token}`}
          >
            Redact
          </MiniBtn>
        </Actions>
      </SymbolRow>
    );
  };

  return (
    <NodeContainer $selected={selected}>
      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />

      <NodeHeader>
        <VscCode size={16} color="#519aba" />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.label as string}
        </span>

        {(fileTargetCount > 0 || fileRedactCount > 0) && (
          <RuleBadges>
            {fileTargetCount > 0 && <Badge $tone="target">{fileTargetCount} impl</Badge>}
            {fileRedactCount > 0 && <Badge $tone="redact">{fileRedactCount} red</Badge>}
          </RuleBadges>
        )}
      </NodeHeader>

      {defs.length > 0 && (
        <>
          <SectionLabel>Exports/Definitions</SectionLabel>
          <SymbolList>
            {defSlice.map((d) => renderSymbol(d, "def"))}
            {defs.length > 3 && (
              <MoreLink
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllDefs((v) => !v);
                }}
              >
                {showAllDefs ? "Show less" : `+ ${defs.length - 3} more`}
              </MoreLink>
            )}
          </SymbolList>
        </>
      )}

      {calls.length > 0 && (
        <>
          <SectionLabel>Key Dependencies</SectionLabel>
          <SymbolList>
            {callSlice.map((c) => renderSymbol(c, "call"))}
            {calls.length > 2 && (
              <MoreLink
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllCalls((v) => !v);
                }}
              >
                {showAllCalls ? "Show less" : `+ ${calls.length - 2} more`}
              </MoreLink>
            )}
          </SymbolList>
        </>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </NodeContainer>
  );
});
