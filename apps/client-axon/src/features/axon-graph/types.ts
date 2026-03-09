import type { Edge, Node } from "@xyflow/react";
import type { AxonGraphView, FileEdgeView, FileNodeView } from "@shared/types/axon-core/graph";
import type { Symbol } from "@shared/types/axon-core/symbols";

export type { AxonGraphView, FileEdgeView, FileNodeView, Symbol };

export type FocusFileNodeData = {
  fileId: string;
  label: string;
  path: string;
  symbols: Array<Symbol>;
  imports: Array<string>;
  usedBy: Array<string>;
};

export type AppFileNode = Node<FocusFileNodeData, "fileNode">;
export type AppNode = AppFileNode; 
export type AppEdge = Edge;

export type GraphSelectionInfo = {
  selectedNodeIds: string[];
  primaryNodeId: string | null;
};