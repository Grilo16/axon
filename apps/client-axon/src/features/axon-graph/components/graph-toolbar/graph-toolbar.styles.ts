import styled from "styled-components";
import { Panel } from "@xyflow/react";

export const ToolbarPanel = styled(Panel)`
  margin: 8px;
`;

export const ToolbarCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #2f2f2f;
  background: rgba(18, 18, 18, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  min-width: 300px;
`;

export const ToolbarStatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: #9ca3af;
`;

export const ToolbarButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ToolbarButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
  background: #1c1c1c;
  color: #ddd;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #232323;
    border-color: #4a4a4a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;