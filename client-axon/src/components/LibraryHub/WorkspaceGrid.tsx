import styled from "styled-components";
import { Surface } from "@components/ui/Surface";
import { Subtext } from "@components/ui/Typography";
import { VscTrash, VscPlay } from "react-icons/vsc";
import type { WorkspaceData } from "@features/workspace/workspacesSlice";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Surface)<{ $active?: boolean }>`
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.palette.primary : theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Path = styled(Subtext)`
  font-size: 12px;
  word-break: break-all;
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme }) => theme.colors.text.secondary};
  height: fit-content;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
`;

const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  flex: 1;
  background: ${({ theme, $primary, $danger }) =>
    $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : "transparent"};
  color: ${({ theme, $primary, $danger }) =>
    $danger || $primary ? "white" : theme.colors.text.secondary};
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.border};
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;

  &:hover {
    filter: brightness(1.05);
    background: ${({ theme, $primary, $danger }) =>
      $danger ? theme.colors.palette.danger : $primary ? theme.colors.palette.primary : theme.colors.bg.overlay};
    color: ${({ theme, $primary, $danger }) =>
      $danger || $primary ? "white" : theme.colors.text.primary};
  }
`;

interface Props {
  workspaces: WorkspaceData[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onDelete: (ws: WorkspaceData) => void;
}

export const WorkspaceGrid = ({ workspaces, activeId, onOpen, onDelete }: Props) => {
  if (!workspaces.length) {
    return (
      <Subtext>
        No workspaces yet — create one on the right to get started.
      </Subtext>
    );
  }

  // Sort: active first, then most recently opened
  const sorted = [...workspaces].sort((a, b) => {
    const aActive = a.id === activeId ? 1 : 0;
    const bActive = b.id === activeId ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;

    const ad = +new Date(a.lastOpened);
    const bd = +new Date(b.lastOpened);
    return bd - ad;
  });

  return (
    <Grid>
      {sorted.map((ws) => {
        const isActive = ws.id === activeId;

        return (
          <Card key={ws.id} $active={isActive} $variant="surface" $padding={3} $radius="md">
            <Top>
              <div>
                <Name>{ws.name}</Name>
                <Path>{ws.projectRoot}</Path>
              </div>
              {isActive ? <Badge>Active</Badge> : null}
            </Top>

            <Actions>
              <Btn $primary onClick={() => onOpen(ws.id)}>
                <VscPlay />
                Open
              </Btn>
              <Btn
                $danger
                onClick={() => onDelete(ws)}
                title="Remove from Axon library"
              >
                <VscTrash />
                Delete
              </Btn>
            </Actions>
          </Card>
        );
      })}
    </Grid>
  );
};
