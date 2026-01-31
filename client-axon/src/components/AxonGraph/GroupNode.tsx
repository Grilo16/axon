import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import styled from 'styled-components';
import { VscFolderOpened, VscPlay, VscSearch, VscSettings } from 'react-icons/vsc';
import type { AxonNode } from '@axon-types/axonTypes';
import { useFileSystem } from '@features/axon/useFileSystem';
import { useToggle } from '@app/hooks';
import { useWorkspace } from '@features/workspace/useWorkspace';
import { FileSelectorModal } from '@components/FileSelector/FileSelectorModal';
// --- Styles ---

const NodeContainer = styled.div<{ $isConfig?: boolean; $selected?: boolean }>`
  /* Base Glassmorphism */
  background: ${props => props.$isConfig 
    ? props.theme.colors.bg.surface 
    : 'rgba(30, 30, 30, 0.4)'};
  
  /* Borders: Dashed for View Mode, Solid for Config Mode */
  border: ${props => props.$isConfig 
    ? `1px solid ${props.theme.colors.border}` 
    : `2px dashed ${props.$selected ? props.theme.colors.palette.primary : '#444'}`};
  
  /* Selection Glow */
  box-shadow: ${props => props.$selected 
    ? `0 0 0 2px ${props.theme.colors.palette.primary}40` 
    : 'none'};

  border-radius: 8px;
  padding: 12px;
  min-width: ${props => props.$isConfig ? '280px' : '100%'};
  min-height: ${props => props.$isConfig ? 'auto' : '100%'};
  color: ${props => props.theme.colors.text.secondary};
  transition: all 0.2s ease;
  
  /* Prevent dragging when interacting with inputs */
  .nodrag {
    cursor: default;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InputGroup = styled.div`
  margin-bottom: 12px;
  
  label {
    display: block;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 6px;
    text-transform: uppercase;
    font-weight: 700;
  }
`;

const InputRow = styled.div`
  display: flex; 
  gap: 6px;
`;

const StyledInput = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

const IconButton = styled.button`
  background: ${({ theme }) => theme.colors.bg.overlay};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 4px;
  padding: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surface};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.palette.primary};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 8px;

  &:hover {
    filter: brightness(1.1);
  }
`;

// --- The Component ---

export const GroupNode = memo(({ id, data, selected }: NodeProps<AxonNode>) => {
  const { projectRoot, modifyGroup } = useWorkspace();
  
  // Modal State
  const { isOpen, open, close } = useToggle();
  // File System Hook (only fetch if root is valid)
  const fs = useFileSystem(projectRoot || null);

  // Local Form State
  const [entryPoint, setEntryPoint] = useState((data.entryPoint as string) || '');
  const [depth, setDepth] = useState<number>(data.depth || 3);
  
  // Determine Mode: If no entry point is saved in data, we are in "Config Mode"
  const isConfigMode = !data.entryPoint; 

  const handleScan = useCallback(() => {
    if (!entryPoint) return;

    // ⚡ FIX: Update THIS node instead of creating a new one!
    modifyGroup(id, {
      name: entryPoint, // Use filename as default name
      entryPoint,
      depth,
      // The VisualizerCanvas will see this change, 
      // run the scan, and populate the children.
    });
  }, [entryPoint, depth, id, modifyGroup]);

  const handleBrowse = () => {
    fs.refresh();
    open();
  };

  return (
    <NodeContainer $isConfig={isConfigMode} $selected={selected}>
      {/* Invisible Target Handle for connections */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <Header>
        {isConfigMode ? <VscFolderOpened color="#dcb67a" /> : <VscSettings size={12} />}
        {/* If scanned, show label. If configuring, show "New Group" */}
        <span>{isConfigMode ? "Configure Scope" : (data.label as string)}</span>
      </Header>

      {isConfigMode ? (
        <div className="nodrag">
          <InputGroup>
            <label>Entry Point</label>
            <InputRow>
              <StyledInput 
                type="text" 
                value={entryPoint}
                onChange={(e) => setEntryPoint(e.target.value)}
                placeholder="src/App.tsx"
              />
              <IconButton onClick={handleBrowse} title="Browse Files">
                <VscSearch />
              </IconButton>
            </InputRow>
          </InputGroup>
          
          <InputGroup>
            <label>Scan Depth</label>
            <StyledInput 
              type="number" 
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              min="1" 
              max="10"
            />
          </InputGroup>

          <ActionButton onClick={handleScan}>
            <VscPlay />
            Scan Group
          </ActionButton>

          {/* Reusable Modal */}
          <FileSelectorModal 
            isOpen={isOpen}
            toggle={close}
            fs={fs}
            mode="file"
            onSelect={(path) => setEntryPoint(path)}
          />
        </div>
      ) : (
        /* View Mode: Empty container that holds the children visually */
        <div style={{ padding: '4px', fontSize: '10px', opacity: 0.5 }}>
           {/* We can put metrics here later, e.g. "15 Files" */}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </NodeContainer>
  );
});