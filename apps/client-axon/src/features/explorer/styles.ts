import styled, { keyframes } from 'styled-components';

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

export const ExplorerContainer = styled.aside`
  display: flex; flex-direction: column; height: 100%;
  background: #181818; border-right: 1px solid #2b2b2b;
  width: 100%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
`;

export const Header = styled.header`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid #2b2b2b;
  h2 { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }
`;

export const ScrollArea = styled.div`
  flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px 0;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
`;

export const ErrorMessage = styled.div`
  margin: 12px; padding: 8px; background: rgba(127, 29, 29, 0.2);
  border: 1px solid rgba(127, 29, 29, 0.5); border-radius: 4px; font-size: 11px; color: #f87171;
`;

export const LoadingState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 80px; opacity: 0.4; font-size: 10px; color: white;
  svg { margin-bottom: 8px; animation: ${spin} 1s linear infinite; }
`;

export const Toolbar = styled.div`
  display: flex; flex-direction: column; gap: 8px; padding: 12px;
  border-bottom: 1px solid #2b2b2b; background: #1e1e1e;
`;

export const ActionRow = styled.div` display: flex; align-items: center; justify-content: space-between; gap: 8px; `;
export const ButtonGroup = styled.div` display: flex; gap: 4px; `;

export const IconButton = styled.button`
  background: transparent; border: none; color: #888; cursor: pointer;
  padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
  &:hover { background: #333; color: #fff; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

export const AddressBar = styled.input`
  width: 100%; background: #000; border: 1px solid #333; color: #ccc;
  font-size: 11px; padding: 4px 8px; border-radius: 4px; outline: none;
  &:focus { border-color: #3b82f6; color: #fff; }
`;

export const TreeItem = styled.div` display: flex; flex-direction: column; width: 100%; `;

/* NEW: Multi-state row for Explorer Selection vs Global Focus */
export const ItemRow = styled.div<{ $depth: number; $isSelected: boolean; $isFocused: boolean }>`
  display: flex; align-items: center; padding: 4px 8px 4px ${props => props.$depth * 12 + 8}px;
  cursor: pointer; gap: 6px; border-left: 2px solid transparent;
  
  /* Priority: Focused > Selected > Default */
  background: ${props => props.$isFocused ? 'rgba(59, 130, 246, 0.15)' : props.$isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  color: ${props => props.$isFocused ? '#60a5fa' : props.$isSelected ? '#fff' : '#ccc'};
  border-left-color: ${props => props.$isFocused ? '#3b82f6' : 'transparent'};

  user-select: none; -webkit-user-select: none;
  
  &:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
  
  /* Reveal the quick-add button on hover */
  &:hover .graph-toggle-btn { opacity: 1; }
`;

export const Label = styled.span<{ $inGraph?: boolean }>`
  font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
  /* Make files currently in the graph slightly brighter */
  color: ${props => props.$inGraph ? '#fff' : 'inherit'};
  font-weight: ${props => props.$inGraph ? '600' : '400'};
`;

/* NEW: The hover button to add/remove from graph */
export const GraphToggleBtn = styled.button<{ $inGraph: boolean }>`
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; padding: 2px; border-radius: 4px; cursor: pointer;
  color: ${props => props.$inGraph ? '#34d399' : '#6b7280'};
  opacity: ${props => props.$inGraph ? '1' : '0'}; /* Always visible if in graph, otherwise hide until hover */
  transition: all 0.2s;
  
  &:hover { background: rgba(255, 255, 255, 0.1); color: ${props => props.$inGraph ? '#ef4444' : '#fff'}; }
`;

export const ChildrenContainer = styled.div`
  display: flex; flex-direction: column; margin-left: 14px; 
  border-left: 1px solid #2b2b2b; transition: all 0.2s ease-in-out;
`;