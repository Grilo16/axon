import { memo, useState } from "react";
import { Flex } from "@shared/ui";

import { NodeContainer } from "./node-container";
import { NodeCaret } from "./node-caret";
import { NodeIcon } from "./node-icon";
import { NodeLabel } from "./node-label";
import { NodeActions } from "./node-actions";

import { useExplorerDirectory } from "@features/explorer/hooks/use-explorer-directory";
import { 
  useNodeHoverRelationship, 
  useIsNodeSelected, 
  useWorkspaceDispatchers 
} from "@features/core/workspace/hooks/use-workspace-slice";

interface ExplorerNodeProps {
  path: string;
  name: string;
  isFolder: boolean;
  depth: number;
}

export const ExplorerNode = memo(
  ({ path, name, isFolder, depth }: ExplorerNodeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const hoverRel = useNodeHoverRelationship(path);
    const isSelected = useIsNodeSelected(path);
    
    const { children } = useExplorerDirectory(path, isFolder, isOpen);
    const { hoverNode, toggleSelection, openFileViewer } = useWorkspaceDispatchers();

    const handleToggleFolder = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        handleToggleFolder(e);
      } else {
        const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
        toggleSelection(path, isMulti);
      }
    };

    // 🌟 THE MAGIC LOGIC: Highest Visible Folder!
    const isHoverTarget = 
      hoverRel === "exact" || // It is the exact file/folder hovered
      hoverRel === "parent-hovered" || // The folder containing it is hovered
      (hoverRel === "child-hovered" && !isOpen); // A child is hovered, but THIS folder is closed!

    return (
      <Flex $direction="column">
        <NodeContainer
          $depth={depth}
          // Highlight this node if it meets our smart targeting criteria
          $isFocused={isHoverTarget}
          $isSelected={isSelected}
          $align="center"
          $gap="xs"
          onClick={handleClick}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!isFolder) openFileViewer(path);
          }}
          // Register hover path to global Redux store
          onMouseEnter={() => hoverNode(path)}
          onMouseLeave={() => hoverNode(null)}
        >
          <NodeCaret
            path={path}
            isFolder={isFolder}
            isOpen={isOpen}
            onToggle={handleToggleFolder}
          />
          <NodeIcon path={path} isFolder={isFolder} isOpen={isOpen} />
          <NodeLabel path={path} name={name} />
          <NodeActions path={path} isFolder={isFolder} />
        </NodeContainer>

        {isOpen && children.length > 0 && (
          <Flex $direction="column">
            {children.map((child: any) => (
              <ExplorerNode
                key={child.data.path}
                path={child.data.path}
                name={child.data.name}
                isFolder={child.type === "folder"}
                depth={depth + 1}
              />
            ))}
          </Flex>
        )}
      </Flex>
    );
  },
);

ExplorerNode.displayName = "ExplorerNode";