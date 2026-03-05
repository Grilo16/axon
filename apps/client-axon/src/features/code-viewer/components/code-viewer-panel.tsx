import { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { X, FileCode, Package, Loader2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

// UI Primitives
import { Flex, Text, Button, Box, PanelSection, PanelHeader } from '@shared/ui';
import { useWorkspaceSession } from '@features/core/workspace';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session'; 
import { useReadFileQuery } from '@features/core/workspace/api/workspace-api';
import { useWorkspaceManager } from '@features/core/workspace/hooks/use-workspace-manager';

const getLanguageFromPath = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx': return 'typescript';
    case 'js':
    case 'jsx': return 'javascript';
    case 'rs': return 'rust';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'md': return 'markdown';
    default: return 'plaintext';
  }
};

export const CodeViewerPanel = () => {
  const { activeId } = useWorkspaceManager();
  const { viewedFilePath, viewedBundleContent, closeViewer } = useWorkspaceSession();
  const { activeBundle } = useBundleSession();
  
  const isBundle = !!viewedBundleContent;

  const { data: fileContent, isLoading, isFetching } = useReadFileQuery(
    { id: activeId!, query: { path: viewedFilePath! } },
    { skip: !activeId || !viewedFilePath || isBundle }
  );

  const language = useMemo(() => {
    if (isBundle) return 'markdown';
    return viewedFilePath ? getLanguageFromPath(viewedFilePath) : 'plaintext';
  }, [viewedFilePath, isBundle]);

  const title = isBundle ? "Generated Context Bundle" : viewedFilePath?.split(/[/\\]/).pop();
  const editorValue = isBundle ? viewedBundleContent : fileContent;

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
    
    const safeName = (activeBundle?.name || "bundle").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = isBundle ? `${safeName}_context.md` : (title || 'file.txt');
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  return (
    <PanelSection $bg="bg.main">
      <PanelHeader>
        <Flex $align="center" $gap="sm" style={{ minWidth: 0 }}>
          {isBundle ? (
            <Package size={16} color="#c084fc" /> 
          ) : (
            <FileCode size={16} color="#60a5fa" />
          )}
          <Text $size="sm" $weight="semibold" $truncate title={title}>
            {title || "No file selected"}
          </Text>
        </Flex>
        
        <Flex $align="center" $gap="xs">
          <Button $variant="icon" onClick={handleCopy} title="Copy to Clipboard">
            <Copy size={14} />
          </Button>
          <Button $variant="icon" onClick={handleDownload} title="Download File">
            <Download size={14} />
          </Button>
          
          {/* Using a styled Box as a separator */}
          <Box $bg="border.subtle" style={{ width: 1, height: 16, margin: '0 4px' }} />
          
          <Button $variant="icon" onClick={closeViewer} title="Close Panel">
            <X size={16} />
          </Button>
        </Flex>
      </PanelHeader>

      <Box $fill style={{ position: 'relative', minHeight: 0 }}>
        {/* Simplified Loader Overlay */}
        {(!isBundle && (isLoading || isFetching)) && (
          <Flex 
            $fill 
            $align="center" 
            $justify="center" 
            style={{ position: 'absolute', zIndex: 10, background: 'rgba(18, 18, 18, 0.7)' }}
          >
            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
          </Flex>
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
              // Match our theme's dark background exactly
              padding: { top: 16 }
            }}
          />
        )}
      </Box>
    </PanelSection>
  );
};