import { useState } from 'react';
import styled from 'styled-components';
import { Surface } from '@components/ui/Surface';
import { Heading } from '@components/ui/Typography';
import { VscFolder, VscRocket } from 'react-icons/vsc';
import { useToggle } from '@app/hooks';
import { useFileSystem } from '@features/axon/useFileSystem';
import { FileSelectorModal } from '@components/FileSelector/FileSelectorModal';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@features/workspace/useLibrary';

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  label {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
    font-weight: 600;
  }
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

const PathInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.palette.primary};
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;

  &:hover { background: ${({ theme }) => theme.colors.palette.secondary}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const CreateWorkspaceCard = () => {
    const navigate = useNavigate()
  const { create } = useLibrary();
  
  const [name, setName] = useState("My Axon Project");
  const [rootPath, setRootPath] = useState("");

  const { isOpen, open, close } = useToggle();
  const fs = useFileSystem("/lesgo coding projects/"); 

  const handleBrowse = () => {
    fs.refresh(); 
    open();
  };

  const handleSubmit = () => {
    if (!name || !rootPath) return;
    create(name, rootPath); 
    navigate("/workspace")
  };

  return (
    <Surface $padding={6} style={{ width: '450px' }}>
      <Heading style={{textAlign: 'center', marginBottom: '30px'}}>
        Initialize Workspace
      </Heading>
      
      <Form>
        <FormGroup>
          <label>Workspace Name</label>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Gamify Client"
          />
        </FormGroup>

        <FormGroup>
          <label>Project Root</label>
          <PathInputGroup>
            <Input 
              value={rootPath} 
              readOnly 
              placeholder="Select a folder..." 
              style={{ flex: 1, cursor: 'default' }}
              onClick={handleBrowse} 
            />
            <button 
               onClick={handleBrowse}
               style={{
                 background: '#333', border: '1px solid #444', 
                 color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '0 12px'
               }}
            >
              <VscFolder />
            </button>
          </PathInputGroup>
        </FormGroup>

        <Button onClick={handleSubmit} disabled={!rootPath}>
          <VscRocket /> Launch Axon
        </Button>
      </Form>

      <FileSelectorModal 
        isOpen={isOpen} 
        toggle={close} 
        fs={fs}
        mode="directory" 
        onSelect={(path) => setRootPath(path)}
      />
    </Surface>
  );
};