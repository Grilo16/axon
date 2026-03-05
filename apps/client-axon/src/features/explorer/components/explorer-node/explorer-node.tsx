import { memo } from "react";
import type { ExplorerEntry as ExplorerEntryType } from "@shared/types/axon-core/explorer";

import { Flex } from "@shared/ui";
import { NodeRow } from "./node-row";
import { useExplorerNode } from "@features/explorer/hooks";

export interface ExplorerOptions {
  foldersSelectable?: boolean;
  filesSelectable?: boolean;
  multiSelect?: boolean;
  cascade?: boolean;
}


interface Props {
  entry: ExplorerEntryType;
  depth: number;
  options: ExplorerOptions;
  onFolderExpand: (path: string) => Promise<ExplorerEntryType[] | undefined>;
  onNavigate: (path: string) => void;
}

export const ExplorerNode = memo((props: Props) => {
  const { entry, depth, options } = props;
  
  // 1. Grab all logic from our extracted hook
  const nodeState = useExplorerNode(
    entry, props.options, props.onFolderExpand, props.onNavigate
  );

  return (
    <Flex $direction="column">
      <NodeRow
        name={entry.data.name}
        depth={depth}
        isFolder={nodeState.isFolder}
        isOpen={nodeState.isOpen}
        loading={nodeState.loading}
        isFocused={nodeState.isFocused}
        isSelected={nodeState.isSelected}
        inGraph={nodeState.inGraph}
        hasFilesInGraph={nodeState.hasFilesInGraph}
        isFetching={nodeState.isFetching}
        cascade={options.cascade !== false}
        onClick={(e) => {
          if (!nodeState.isFolder) nodeState.handleSelect(e);
          if (nodeState.isFolder) nodeState.handleToggle(e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!nodeState.isFolder) nodeState.openFileInViewer(nodeState.path);
        }}
        onMouseEnter={() => nodeState.setHovered(nodeState.path)}
        onMouseLeave={() => nodeState.setHovered(null)}
        onToggleGraph={nodeState.isFolder ? nodeState.handleToggleFolderGraph : nodeState.handleToggleFileGraph}
        onToggleFolder={nodeState.handleToggle}
      />

      {/* 2. Recursively render children if open */}
      {nodeState.isOpen && (
        <Flex $direction="column">
          {nodeState.children.map((child) => (
            <ExplorerNode
              key={child.data.path}
              {...props}
              entry={child}
              depth={depth + 1}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
});

ExplorerNode.displayName = "ExplorerNode";