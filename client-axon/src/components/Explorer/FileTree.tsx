import styled from 'styled-components';
import { VscFile, VscFolder } from 'react-icons/vsc';

const List = styled.div`
  display: flex; 
  flex-direction: column; 
  gap: 2px;
`;

const Item = styled.div`
  display: flex; 
  align-items: center; 
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: ${({theme}) => theme.colors.text.secondary};

  &:hover {
    background: ${({theme}) => theme.colors.bg.overlay};
    color: ${({theme}) => theme.colors.text.primary};
  }
`;

interface FileTreeProps {
  files: any[];
  onFileClick: (file: any) => void;
  onDirClick: (dir: any) => void;
}

export const FileTree = ({ files, onFileClick, onDirClick }: FileTreeProps) => {
  return (
    <List>
      {files.map((file) => (
        <Item 
          key={file.path} 
          onClick={() => file.is_dir ? onDirClick(file) : onFileClick(file)}
        >
          {file.is_dir ? <VscFolder color="#dcb67a" /> : <VscFile />}
          {file.name}
        </Item>
      ))}
    </List>
  );
};