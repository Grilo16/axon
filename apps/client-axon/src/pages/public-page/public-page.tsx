import { usePublicSandbox } from "@features/public/hooks/use-public-sandbox";
import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { Flex, Box, Text } from "@shared/ui";
import { PublicFileExplorer } from "@features/public/components/public-file-explorer";

export default function PublicSandboxPage() {
  const sandbox = usePublicSandbox();

  // Create the exact same "actions" object the private GraphCanvas expects
  const graphActions = {
    addFile: (id: string) => sandbox.setPaths([...sandbox.activePaths, id]),
    removeFile: (id: string) => sandbox.toggleTarget(id),
    batchUpdateFiles: (add: string[], remove: string[]) => {
      const next = new Set(sandbox.activePaths);
      add.forEach(a => next.add(a));
      remove.forEach(r => next.delete(r));
      sandbox.setPaths(Array.from(next));
    },
    reset: () => sandbox.setPaths([]),
  };

  if (sandbox.isWorkspacesLoading) return <Text>Loading Axon Engine...</Text>;

  return (
    <Flex $fill $direction="row">
      
      {/* LEFT SIDEBAR: Public Workspace Selector & Fake Explorer */}
      <Box style={{ width: 300, borderRight: '1px solid #333' }}>
        <Text $size="lg" $weight="bold" $p="md">Public Showcases</Text>
        
        {/* Simple Workspace Selector */}
        <Flex $direction="column" $gap="xs" $p="sm">
          {sandbox.workspaces.map(ws => (
            <button 
              key={ws.id} 
              onClick={() => sandbox.setActiveWorkspaceId(ws.id)}
              style={{ background: sandbox.activeWorkspaceId === ws.id ? '#3b82f6' : 'transparent', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {ws.name}
            </button>
          ))}
        </Flex>

        <Box $fill style={{ overflow: 'hidden' }}>
          <PublicFileExplorer sandbox={sandbox} />
        </Box>
      </Box>

      {/* RIGHT: The Graph Canvas */}
      <Box $fill style={{ position: 'relative' }}>
        <GraphCanvas 
          graphData={sandbox.graphData || null} 
          activeFiles={sandbox.activePaths} 
          actions={graphActions} 
          isLoading={sandbox.isGraphLoading} 
        />
        
        {/* Generate Button Overlay */}
        <button 
          onClick={sandbox.generateAndCopyBundle} 
          style={{ position: 'absolute', bottom: 20, right: 20, padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', zIndex: 100 }}
        >
          {sandbox.isGenerating ? "Building..." : "Generate Context"}
        </button>
      </Box>

    </Flex>
  );
}