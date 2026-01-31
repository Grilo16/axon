import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  VscFolder, 
  VscFolderOpened, 
  VscFile, 
  VscChevronRight, 
  VscChevronDown, 
} from 'react-icons/vsc'; 
import { useAxonCore } from '@features/axon/useAxonCore';

// --- Types ---
interface FileEntry {
  name: String;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
}

interface ExplorerProps {
  rootPath: string;
  onFileSelect: (path: string) => void;
  onSetEntryPoint: (path: string) => void;
}

// --- Styled Components ---
const ExplorerContainer = styled.div`
  background: #181818;
  color: #cccccc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  height: 100%;
  overflow-y: auto;
  user-select: none;
  border-right: 1px solid #2b2b2b;
`;

const ItemRow = styled.div<{ active?: boolean; level: number }>`
  display: flex;
  align-items: center;
  padding: 4px 10px;
  padding-left: ${props => props.level * 12 + 10}px;
  cursor: pointer;
  background: ${props => props.active ? '#2a2d2e' : 'transparent'};
  white-space: nowrap;

  &:hover {
    background: #2a2d2e;
  }
`;

const IconWrapper = styled.span`
  margin-right: 6px;
  display: flex;
  align-items: center;
  color: #858585;
`;

const EntryPointBadge = styled.button`
  margin-left: auto;
  background: transparent;
  border: 1px solid #444;
  color: #888;
  border-radius: 3px;
  font-size: 10px;
  padding: 0 4px;
  opacity: 0;
  transition: all 0.2s;

  ${ItemRow}:hover & {
    opacity: 1;
  }

  &:hover {
    background: #007acc;
    color: white;
    border-color: #007acc;
  }
`;

// --- Recursive Tree Item Component ---
const TreeItem: React.FC<{
  entry: FileEntry;
  level: number;
  onFileSelect: (path: string) => void;
  onSetEntryPoint: (path: string) => void;
}> = ({ entry, level, onFileSelect, onSetEntryPoint }) => {
  const {listFiles} = useAxonCore()
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleFolder = async () => {
    if (!entry.is_dir) {
      onFileSelect(entry.path);
      return;
    }

    if (!isOpen && children.length === 0) {
      setLoading(true);
      try {
        const result = await listFiles(entry.path);
        setChildren(result);
      } catch (err) {
        console.error("Explorer Error:", err);
      }
      setLoading(false);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {loading ? "loading" : null}
      <ItemRow level={level} onClick={toggleFolder}>
        <IconWrapper>
          {entry.is_dir ? (
            <>
              {isOpen ? <VscChevronDown /> : <VscChevronRight />}
              {isOpen ? <VscFolderOpened color="#dcb67a" /> : <VscFolder color="#dcb67a" />}
            </>
          ) : (
            <>
              <span style={{ width: '16px' }} /> {/* indent for alignment */}
              <VscFile color="#519aba" />
            </>
          )}
        </IconWrapper>
        <span>{entry.name}</span>
        
        {!entry.is_dir && (
          <EntryPointBadge onClick={(e) => {
            e.stopPropagation();
            onSetEntryPoint(entry.path);
          }}>
            SET ENTRY
          </EntryPointBadge>
        )}
      </ItemRow>

      {isOpen && children.map(child => (
        <TreeItem 
          key={child.path} 
          entry={child} 
          level={level + 1} 
          onFileSelect={onFileSelect}
          onSetEntryPoint={onSetEntryPoint}
        />
      ))}
    </div>
  );
};

// --- Main Explorer Component ---
export const Explorer: React.FC<ExplorerProps> = ({ rootPath, onFileSelect, onSetEntryPoint }) => {
  const [topLevel, setTopLevel] = useState<FileEntry[]>([]);
  const {listFiles} = useAxonCore()
  useEffect(() => {
    if (rootPath) {
      listFiles(rootPath)
        .then(setTopLevel)
        .catch(console.error);
    }
  }, [rootPath]);

  return (
    <ExplorerContainer>
      <div style={{ padding: '10px', fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>
        Project Explorer
      </div>
      {topLevel.map(entry => (
        <TreeItem 
          key={entry.path} 
          entry={entry} 
          level={0} 
          onFileSelect={onFileSelect}
          onSetEntryPoint={onSetEntryPoint}
        />
      ))}
    </ExplorerContainer>
  );
};