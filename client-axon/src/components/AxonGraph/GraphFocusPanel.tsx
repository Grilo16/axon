import { Panel } from "@xyflow/react";
import styled from "styled-components";
import { Surface } from "@components/ui/Surface";
import { Subtext } from "@components/ui/Typography";
import { VscClose, VscFolderOpened, VscRepoPull, VscRepoPush } from "react-icons/vsc";

const Wrap = styled(Surface)`
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
`;

const ActionsRow = styled.div`
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
  font-weight: 650;
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

const SliderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Slider = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.palette.primary};
`;

const Pill = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.bg.overlay};
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  align-items: center;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Dot = styled.span<{ $c: string }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $c }) => $c};
  display: inline-block;
`;

type Props = {
  isActive: boolean;
  focusLabel?: string;
  focusPath?: string;
  depth: number;
  onDepthChange: (d: number) => void;

  importColor: string;
  exportColor: string;

  highlightedNodes: number;
  highlightedEdges: number;

  onExtractGroup: () => void;
  onClear: () => void;
};

export const GraphFocusPanel = ({
  isActive,
  focusLabel,
  focusPath,
  depth,
  onDepthChange,
  importColor,
  exportColor,
  highlightedNodes,
  highlightedEdges,
  onExtractGroup,
  onClear,
}: Props) => {
  return (
    <Panel position="top-left">
      <Wrap $variant="overlay" $padding={2} $radius="md" $border>
        <TitleRow>
          <div>
            <Title>{isActive ? (focusLabel ?? "Selection") : "Focus"}</Title>
            <div style={{ marginTop: 4 }}>
              <Subtext>
                {isActive
                  ? `${highlightedNodes} nodes · ${highlightedEdges} edges`
                  : "Click a node to highlight neighbors"}
              </Subtext>
            </div>
            {isActive && focusPath ? (
              <div style={{ marginTop: 6 }}>
                <Subtext>{focusPath}</Subtext>
              </div>
            ) : null}
          </div>

          <GhostBtn onClick={onClear} title="Clear focus">
            <VscClose />
          </GhostBtn>
        </TitleRow>

        <Legend>
          <LegendItem title="Outgoing from focus (imports)">
            <Dot $c={importColor} />
            <VscRepoPush />
            <span>Imports</span>
          </LegendItem>

          <LegendItem title="Incoming to focus (used-by / exports)">
            <Dot $c={exportColor} />
            <VscRepoPull />
            <span>Exports</span>
          </LegendItem>
        </Legend>

        <div>
          <Subtext>Highlight depth</Subtext>
          <SliderRow style={{ marginTop: 6 }}>
            <Slider
              type="range"
              min={1}
              max={5}
              value={depth}
              disabled={!isActive}
              onChange={(e) => onDepthChange(Number(e.target.value))}
            />
            <Pill>{depth}</Pill>
          </SliderRow>
        </div>

        <ActionsRow>
          <PrimaryBtn
            disabled={!isActive || !focusPath}
            onClick={onExtractGroup}
            title="Create a new Scope group from this focused neighborhood"
          >
            <VscFolderOpened />
            Extract as Group
          </PrimaryBtn>

          <GhostBtn disabled={!isActive} onClick={onClear} title="Clear focus">
            <VscClose />
          </GhostBtn>
        </ActionsRow>
      </Wrap>
    </Panel>
  );
};
