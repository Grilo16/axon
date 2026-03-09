import { memo, useState, useCallback } from "react";
import type { ExplorerEntry } from "@shared/types/axon-core/explorer";
import { Flex } from "@shared/ui";

interface Props {
  entry: ExplorerEntry;
  depth: number;
  activePaths: string[];
  onFolderExpand: (path: string) => Promise<ExplorerEntry[] | undefined>;
  onToggleTarget: (path: string) => void;
  onToggleFolderGraph: (path: string) => void;
}

export const PublicExplorerNode = memo(({ 
  entry, depth, activePaths, onFolderExpand, onToggleTarget, onToggleFolderGraph 
}: Props) => {
  const path = entry.data.path;
  const isFolder = entry.type === "folder";

  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<ExplorerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const inGraph = !isFolder && activePaths.includes(path);
  const folderActiveFilesCount = isFolder ? activePaths.filter((p) => p.startsWith(path + "/")).length : 0;
  const hasFilesInGraph = folderActiveFilesCount > 0;

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) return;
    if (!isOpen && children.length === 0) {
      setLoading(true);
      const result = await onFolderExpand(path);
      if (result) setChildren(result);
      setLoading(false);
    }
    setIsOpen((prev) => !prev);
  }, [isFolder, isOpen, children.length, path, onFolderExpand]);

  return (
    <Flex $direction="column">
      <NodeRow
        name={entry.data.name}
        depth={depth}
        isFolder={isFolder}
        isOpen={isOpen}
        loading={loading}
        isFocused={false} // Disabled for public sandbox
        isSelected={false} // Disabled for public sandbox
        inGraph={inGraph}
        hasFilesInGraph={hasFilesInGraph}
        isFetching={false}
        cascade={true}
        onClick={(e) => { if (isFolder) handleToggle(e); }}
        onDoubleClick={() => {}} // Disabled file viewer for now
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        onToggleGraph={(e) => {
          e.stopPropagation();
          isFolder ? onToggleFolderGraph(path) : onToggleTarget(path);
        }}
        onToggleFolder={handleToggle}
      />

      {isOpen && (
        <Flex $direction="column">
          {children.map((child) => (
            <PublicExplorerNode
              key={child.data.path}
              entry={child}
              depth={depth + 1}
              activePaths={activePaths}
              onFolderExpand={onFolderExpand}
              onToggleTarget={onToggleTarget}
              onToggleFolderGraph={onToggleFolderGraph}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
});

PublicExplorerNode.displayName = "PublicExplorerNode";