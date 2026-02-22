import styled from 'styled-components';

export const GraphContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #121212; /* Dark theme background */
`;

export const NodeCard = styled.div<{ $selected?: boolean }>`
  background: #1e1e1e;
  border: 1px solid ${props => props.$selected ? '#3b82f6' : '#333'};
  border-radius: 8px;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s;
`;

export const NodeHeader = styled.div`
  background: #252526;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: bold;
  color: #e5e5e5;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-all;
`;

export const SymbolList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
  max-height: 150px;
  overflow-y: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
`;

export const SymbolItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #ccc;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 4px;

  &:hover {
    background: #2a2d2e;
    color: #fff;
  }
`;

export const SymbolKindBadge = styled.span<{ $kind: string }>`
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;