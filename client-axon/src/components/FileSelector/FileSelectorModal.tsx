import styled from 'styled-components';
import { Modal } from '@components/ui/Modal';
import { FileTree } from '@components/Explorer/FileTree';
import type { useFileSystem } from '@features/axon/useFileSystem';

interface FileSelectorModalProps {
  isOpen: boolean;
  toggle: () => void;
  fs: ReturnType<typeof useFileSystem>; 
  mode?: 'file' | 'directory'; 
  onSelect: (path: string) => void;
}

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button<{ $primary?: boolean }>`
  background: ${({ theme, $primary }) => $primary ? theme.colors.palette.primary : 'transparent'};
  color: ${({ theme, $primary }) => $primary ? '#fff' : theme.colors.text.secondary};
  border: 1px solid ${({ theme, $primary }) => $primary ? theme.colors.palette.primary : theme.colors.border};
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: ${({ theme, $primary }) => $primary ? theme.colors.palette.secondary : theme.colors.bg.overlay};
  }
`;

export const FileSelectorModal = ({ 
  isOpen, 
  toggle, 
  fs, 
  mode = 'file', 
  onSelect 
}: FileSelectorModalProps) => {

  const handleConfirmDirectory = () => {
    if (fs.currentPath) {
      onSelect(fs.currentPath);
      toggle();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={toggle} 
      title={mode === 'directory' ? "Select Root Folder" : "Select File"}
    >
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
         <button onClick={fs.navigateUp} disabled={!fs.currentPath}>
            ⬅ Up Level
         </button>
         <div style={{opacity: 0.5, fontSize: '12px', alignSelf: 'center'}}>
           {fs.currentPath}
         </div>
      </div>

      <FileTree
        files={fs.files}
        onDirClick={(dir) => fs.cd(dir.path)}
        onFileClick={(file) => {
          // If in file mode, clicking a file selects it immediately
          if (mode === 'file') {
             onSelect(file.path);
             toggle();
          }
        }}
      />

      {/* Show Footer ONLY for Directory Mode */}
      {mode === 'directory' && (
        <Footer>
          <Button onClick={toggle}>Cancel</Button>
          <Button $primary onClick={handleConfirmDirectory}>
            Select Current Folder
          </Button>
        </Footer>
      )}
    </Modal>
  );
};