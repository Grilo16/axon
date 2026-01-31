import  { memo } from 'react';
import styled from 'styled-components';
import { VscGitPullRequestCreate, VscSplitHorizontal } from 'react-icons/vsc';

const MenuContainer = styled.div`
  position: fixed; /* Fixed to the viewport, not the canvas */
  z-index: 10000;
  width: 220px;
  background: #252526;
  border: 1px solid #454545;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  border-radius: 6px;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.button`
  background: transparent;
  border: none;
  color: #cccccc;
  text-align: left;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-family: 'Segoe UI', sans-serif;

  &:hover {
    background: #094771; /* VS Code Highlight Blue */
    color: white;
  }

  svg {
    font-size: 14px;
    color: #a0a0a0;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #3e3e42;
  margin: 4px 0;
`;

interface NodeContextMenuProps {
  top: number;
  left: number;
  node: any;
  onClose: () => void;
  onExtractGroup: (node: any) => void;
}

export const NodeContextMenu = memo(({ top, left, node, onClose, onExtractGroup }: NodeContextMenuProps) => {
  return (
    <>
      {/* Invisible backdrop to close menu when clicking outside */}
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }} 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      
      <MenuContainer style={{ top, left }}>
        <MenuItem onClick={() => onExtractGroup(node)}>
          <VscGitPullRequestCreate /> Extract to New Group
        </MenuItem>
        
        {/* You can add more options here later! */}
        <Divider />
        <MenuItem onClick={onClose}>
          <VscSplitHorizontal /> Close Menu
        </MenuItem>
      </MenuContainer>
    </>
  );
});