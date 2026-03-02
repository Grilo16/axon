import { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { X, FileCode, Package, Loader2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

import * as S from './styles';
import { useWorkspaceSession } from '@features/core/workspace';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session'; 
import { useReadFileQuery } from '@features/core/workspace/api/workspace-api';
import { useWorkspaceManager } from '@features/core/workspace/hooks/use-workspace-manager';

const getLanguageFromPath = (path: string) => {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
  if (path.endsWith('.rs')) return 'rust';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.html')) return 'html';
  if (path.endsWith('.md')) return 'markdown';
  return 'plaintext';
};

export const CodeViewerPanel = () => {
  const {activeId} = useWorkspaceManager()
  const {  viewedFilePath, viewedBundleContent, closeViewer } = useWorkspaceSession();
  const { activeBundle } = useBundleSession(); // Grab the active bundle for the filename!
  
  const isBundle = !!viewedBundleContent;

  const { data: fileContent, isLoading, isFetching } = useReadFileQuery(
    { id: activeId!, query: {path: viewedFilePath!} },
    { skip: !activeId || !viewedFilePath || isBundle }
  );

  const language = useMemo(() => {
    if (isBundle) return 'markdown';
    return viewedFilePath ? getLanguageFromPath(viewedFilePath) : 'plaintext';
  }, [viewedFilePath, isBundle]);

  const title = isBundle ? "Generated Context Bundle" : viewedFilePath?.split(/[/\\]/).pop();
  const editorValue = isBundle ? viewedBundleContent : fileContent;

  // ✨ THE SUPERPOWERS
  const handleCopy = async () => {
    if (!editorValue) return;
    await navigator.clipboard.writeText(editorValue);
    toast.success("Code copied to clipboard!");
  };

  const handleDownload = () => {
    if (!editorValue) return;
    const blob = new Blob([editorValue], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Format a nice, safe filename
    const safeName = (activeBundle?.name || "bundle").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = isBundle ? `${safeName}_context.md` : (title || 'file.txt');
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  return (
    <S.PanelContainer>
      <S.Header>
        <S.FileInfo>
          {isBundle ? <Package size={16} className="text-purple-400" /> : <FileCode size={16} className="text-blue-400" />}
          <span>{title || "No file selected"}</span>
        </S.FileInfo>
        
        {/* ✨ PRETTIER BUTTONS */}
        <S.HeaderActions>
          <S.IconButton onClick={handleCopy} title="Copy to Clipboard">
            <Copy size={14} />
          </S.IconButton>
          <S.IconButton onClick={handleDownload} title="Download File">
            <Download size={14} />
          </S.IconButton>
          <div style={{ width: '1px', height: '16px', background: '#444', margin: '0 4px' }} />
          <S.IconButton onClick={closeViewer} title="Close Panel">
            <X size={16} />
          </S.IconButton>
        </S.HeaderActions>
      </S.Header>

      <S.EditorWrapper>
        {(!isBundle && (isLoading || isFetching)) && (
          <S.LoaderOverlay>
            <Loader2 className="animate-spin" size={32} />
          </S.LoaderOverlay>
        )}

        {editorValue && (
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={editorValue}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              smoothScrolling: true,
            }}
          />
        )}
      </S.EditorWrapper>
    </S.PanelContainer>
  );
};