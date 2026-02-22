import { GraphCanvas } from "@features/axon-graph/components/graph-canvas";
import { useGraph } from "@features/axon-graph/hooks/use-graph";
import { FileExplorer } from "@features/explorer/components/file-explorer";
import { useExplorer } from "@features/explorer/hooks/use-explorer";


export const TestPage = () => {
  // 1. Init our two feature hooks
  const explorer = useExplorer("G:/Lesgo Coding Projects/axon/apps/client-axon");
  const graph = useGraph();

  // 2. Handle the selection event
  const handleBuild = () => {
    const path = explorer.selectedPaths.values().next().value; // Get the single selected path
    graph.buildGraph(path ?? explorer.currentPath); 
  };

  return (
    <div style={{display: "flex"}}>
      {/* LEFT SIDE: The Explorer */}
      <div className="w-80 h-full border-r border-[#2b2b2b]">
        <FileExplorer
          explorer={explorer}
          options={{
            filesSelectable: false, // Only select folders for graph building
            foldersSelectable: true,
            multiSelect: false,
            cascade: false, // Maybe we want flat navigation for this test?
          }}
          // Note: you might need to update FileExplorer props to accept a custom onSelect override
          // if you want to trigger buildGraph directly from the click.
        />

      </div>
      <button onClick={handleBuild}>Build Graph</button>
          
          <div style={{ height: "100vh", width: "80rem"}}>

          <GraphCanvas graphData={graph.graphData} />
          </div>
      {/* RIGHT SIDE: The Graph Viewer */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {graph.isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="animate-pulse text-blue-400">Parsing AST & Building Graph...</span>
          </div>
        )}
        
        {graph.error && (
          <div className="text-red-400">Error building graph: {graph.error.type}</div>
        )}

        {graph.graphData ? (
          <pre className="text-xs text-green-400 overflow-auto p-4 w-full h-full">
            {JSON.stringify(graph.graphData, null, 2)}
          </pre>
        ) : (
          <div className="text-gray-500">Select a folder to build the graph</div>
        )}
      </div>
    </div>
  );
};