import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import styled from "styled-components";
import { VscFolderOpened } from "react-icons/vsc";
import type { AxonNode } from "@axon-types/axonTypes";

const Container = styled.div<{ $selected?: boolean }>`
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  background: rgba(30, 30, 30, 0.28);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;

  ${({ $selected, theme }) =>
    $selected
      ? `
    border-color: ${theme.colors.palette.primary};
    box-shadow: 0 0 0 2px ${theme.colors.palette.primary}33;
  `
      : ""}

  overflow: hidden;
`;

const Header = styled.div`
  height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;

  background: rgba(20, 20, 20, 0.35);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 800;
  font-size: 13px;
`;

const Path = styled.div`
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 12px;
  word-break: break-all;
`;

const Badge = styled.div`
  margin-left: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.overlay};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
`;

export const GroupNode = memo(({ data, selected }: NodeProps<AxonNode>) => {
  const label = (data as any)?.label ?? "Folder";
  const folderPath = (data as any)?.folderPath ?? "";
  const fileCount = (data as any)?.fileCount ?? 0;

  return (
    <Container $selected={selected}>
      {/* Resizable group */}
      <NodeResizer
        isVisible={!!selected}
        minWidth={240}
        minHeight={140}
      />

      <Header>
        <VscFolderOpened size={16} />
        <span title={folderPath || label}>{label}</span>
        <Badge title="Descendant file count">{fileCount}</Badge>
      </Header>

      {folderPath ? <Path>{folderPath}</Path> : null}
    </Container>
  );
});

// All the things we need to analyze a javascript file are
// 



