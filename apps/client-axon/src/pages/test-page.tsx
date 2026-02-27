import { GraphCanvas } from "@features/axon-graph/components/graph-canvas/graph-canvas";
import { FileExplorer } from "@features/explorer/components/file-explorer";
import { useAxonGraph } from "@features/axon-graph/hooks/use-axon-graph";
import { WorkspaceLoader } from "@features/core/workspace";
import { useGenerateBundleMutation } from "@features/core/workspace/api/workspace-api";
import { useState } from "react";
import { BundleCompact } from "@features/core/bundles/components/bundle-compact/bundle-compact";
import { BundleSelector } from "@features/core/bundles/components/bundle-selector/bundle-selector";
import { BundleDetails } from "@features/core/bundles/components/bundle-details/bundle-details";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";

export const TestPage = () => {
  const { activeWorkspace, isActive } = useWorkspaceManager();
  const { graphData, activeFiles, actions, isLoading } = useAxonGraph();
  
  const [bundle] = useGenerateBundleMutation();

  const [bund, setBund] = useState<string>();
  const handleBundle = () => {
    try {
      bundle({
        targetFiles: [
          "src/features/core/workspace/components/workspace-loader.tsx",
        ],
        rules: [
          {
            action: "hideImplementation",
            target: {
              specificSymbol: {
                file_path:
                  "src/features/core/workspace/components/workspace-loader.tsx",
                symbol_id: 1,
              },
            },
          },
          {
            action: "hideImplementation",
            target: {
              specificSymbol: {
                file_path:
                  "src/features/core/workspace/components/workspace-loader.tsx",
                symbol_id: 2,
              },
            },
          },
          {
            action: "hideImplementation",
            target: {
              specificSymbol: {
                file_path:
                  "src/features/core/workspace/components/workspace-loader.tsx",
                symbol_id: 3,
              },
            },
          },
          {
            action: "hideImplementation",
            target: {
              specificSymbol: {
                file_path:
                  "src/features/core/workspace/components/workspace-loader.tsx",
                symbol_id: 4,
              },
            },
          },
          {
            action: "hideImplementation",
            target: {
              specificSymbol: {
                file_path:
                  "src/features/core/workspace/components/workspace-loader.tsx",
                symbol_id: 5,
              },
            },
          },
          // target: { global: "class" },
          // target: { global: "const" },
          // target: { global: "enum" },
          // target: { global: "file" },
          // target: { global: "interface" },
          // target: { global: "method" },
          // target: { global: "module" },
          // target: { global: "namespace" },
          // target: { global: "parameter" },
          // target: { global: "property" },
          // target: { global: "typeAlias" },
          // target: { global: "unknown" },
          // target: { global: "variable" },
        ],
      })
        .unwrap()
        .then((data) => setBund(Object.values(data).at(0) || ""));
    } catch (err) {
      console.log(err);
    }
  };

  if (!isActive || !activeWorkspace) return <WorkspaceLoader />;

  if (!isActive || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121212] text-blue-400">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin text-4xl">⟳</span>
          <span className="animate-pulse tracking-widest uppercase text-sm font-bold">
            Parsing AST & Building Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          flexShrink: "0",
        }}
      >
        <div style={{ height: "50%" }}>
          <FileExplorer/>
        </div>
        <div style={{ minHeight: "40rem" }}>

            <BundleCompact/>
            <BundleSelector/>
            <BundleDetails/>

        </div>
      </div>

      <div
        style={{
          flex: "1",
          height: "100%",
          position: "relative",
        }}
      >
        <GraphCanvas
          graphData={graphData!}
          actions={actions}
          activeFiles={activeFiles}
        />
      </div>
      <div style={{ width: "20rem" }}>
        sup
        {JSON.stringify(bund, null, 2)}
        <button onClick={handleBundle}>bundle</button>
      </div>
    </div>
  );
};
