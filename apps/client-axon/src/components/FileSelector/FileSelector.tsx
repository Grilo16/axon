import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { VscCheck, VscFileCode } from 'react-icons/vsc';
import Editor from '@monaco-editor/react'; 
import { useAxonCore } from '@features/axon/useAxonCore';

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
position: absolute;
  width: 90vw;
  height: 85vh;
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
`;

const Header = styled.div`
  height: 50px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #252526;
  border-radius: 8px 8px 0 0;
`;

const Title = styled.h3`
  color: #ccc;
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #252526;
  border-right: 1px solid #333;
  overflow-y: auto;
  padding: 10px;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: #252526; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
`;

const EditorPane = styled.div`
  flex: 1;
  background: #1e1e1e;
`;

const Footer = styled.div`
  height: 60px;
  border-top: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 20px;
  background: #252526;
  border-radius: 0 0 8px 8px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#007acc' : '#333'};
  color: ${props => props.$primary ? 'white' : '#ccc'};
  border: 1px solid ${props => props.$primary ? '#007acc' : '#444'};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;

  &:hover {
    background: ${props => props.$primary ? '#0062a3' : '#3e3e3e'};
  }
`;

const FileItem = styled.div<{ $active?: boolean }>`
  padding: 4px 8px;
  cursor: pointer;
  color: ${props => props.$active ? '#fff' : '#aaa'};
  background: ${props => props.$active ? '#37373d' : 'transparent'};
  border-radius: 3px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #fff;
    background: #2a2d2e;
  }
`;

// --- Types ---
interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
}

interface FileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  rootPath: string;
}

// --- Component ---
export const FileSelector = ({ isOpen, onClose, onSelect, rootPath }: FileSelectorProps) => {
    const {listFiles, readFile} = useAxonCore()
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(rootPath);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState("// Select a file to preview...");

  // Fetch file list whenever directory changes (Basic implementation)
  // Ideally, you'd use a recursive tree component here.
  // For this snippet, I'll show a simple flat list of the CURRENT dir.
  useEffect(() => {
    if (!isOpen || !rootPath) return;

    const fetchFiles = async () => {
      try {
        // We reuse your 'list_files' command!
        const result: any = await listFiles(currentPath);
        // Sort folders first
        const sorted = result.sort((a: any, b: any) => 
           Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name)
        );
        setFiles(sorted);
      } catch (err) {
        console.error("Failed to list files:", err);
      }
    };
    fetchFiles();
  }, [isOpen, currentPath, rootPath]);

  // Load content when a file is clicked
  const handleFileClick = async (file: FileEntry) => {
    if (file.is_dir) {
      setCurrentPath(file.path); // Dive into directory
    } else {
      setSelectedFile(file.path);
      // Fetch content for preview
      try {
        const content = await readFile(file.path);
        setPreviewContent(content);
      } catch (e) {
        setPreviewContent("// Error reading file");
      }
    }
  };

  const handleUpDir = () => {
    // Simple parent directory logic for Windows/Unix
    const parent = currentPath.split(/[/\\]/).slice(0, -1).join('/');
    // Prevent going above root (optional check)
    if (parent.length >= rootPath.length) {
        setCurrentPath(parent);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <Title><VscFileCode color="#007acc" /> Select Entry Point</Title>
          <div style={{fontSize: '11px', color: '#666', fontFamily: 'monospace'}}>
            {currentPath}
          </div>
        </Header>
        
        <Body>
          <Sidebar>
            {/* "Up" Button */}
            {currentPath !== rootPath && (
                 <FileItem onClick={handleUpDir}>
                   📂 ..
                 </FileItem>
            )}
            
            {/* File List */}
            {files.map((file) => (
              <FileItem 
                key={file.path} 
                $active={selectedFile === file.path}
                onClick={() => handleFileClick(file)}
              >
                {file.is_dir ? '📂' : '📄'} {file.name}
              </FileItem>
            ))}
          </Sidebar>
          
          <EditorPane>
            <Editor
              height="100%"
              theme="vs-dark"
              language="typescript" // You can detect this from extension
              value={previewContent}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                scrollBeyondLastLine: false
              }}
            />
          </EditorPane>
        </Body>

        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            $primary 
            disabled={!selectedFile}
            onClick={() => {
                if(selectedFile) onSelect(selectedFile);
            }}
          >
            <VscCheck /> Set as Entry Point
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};