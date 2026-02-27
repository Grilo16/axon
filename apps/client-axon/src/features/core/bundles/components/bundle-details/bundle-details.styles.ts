import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  
  flex: 1;
  min-height: 0;
`;

export const RulesList = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px; 

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
`;

export const Header = styled.div`
  color: #e5e5e5;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

export const RuleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #252526;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: #d1d5db;
`;

export const RuleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RuleTarget = styled.span`
  font-family: monospace;
  color: #60a5fa;
`;

export const RuleAction = styled.span`
  color: #f87171;
`;

export const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #374151;
    color: #f87171;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  padding: 16px 0;
`;

