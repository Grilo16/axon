import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // VS Code Dark Theme
import { useAxonCore } from '@features/axon/useAxonCore';
import { VscLoading } from 'react-icons/vsc';

// Register languages you expect to support
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('rust', rust);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #1e1e1e;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow: auto;
  font-size: 12px;
  
  /* Custom scrollbar for code */
  &::-webkit-scrollbar { width: 10px; height: 10px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 0; }
`;

const MetaBar = styled.div`
  padding: 8px;
  background: ${({ theme }) => theme.colors.bg.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  gap: 12px;
`;

interface FileViewerProps {
  path: string;
}

export const FileViewer = ({ path }: FileViewerProps) => {
  const { readFile } = useAxonCore();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    
    const load = async () => {
      setLoading(true);
      setError(null);
      setContent(''); // Clear previous content immediately
      
      try {
        const text = await readFile(path);
        if (active) setContent(text);
      } catch (err) {
        if (active) setError("Could not read file content.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (path) load();
    return () => { active = false; };
  }, [path, readFile]);

  if (loading) return <div style={{padding: 20, textAlign: 'center'}}><VscLoading className="spin" /> Loading...</div>;
  if (error) return <div style={{padding: 20, color: 'salmon'}}>{error}</div>;

  return (
    <Container>
      <MetaBar>
        <span>PATH: {path}</span>
        <span>LINES: {content.split('\n').length}</span>
      </MetaBar>
      <ScrollArea>
        <SyntaxHighlighter 
          language="typescript" // You can auto-detect ext later
          style={vs2015}
          showLineNumbers={true}
          customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
          lineNumberStyle={{ opacity: 0.3, minWidth: '30px' }}
        >
          {content}
        </SyntaxHighlighter>
      </ScrollArea>
    </Container>
  );
};