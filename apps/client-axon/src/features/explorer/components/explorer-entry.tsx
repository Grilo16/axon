import React, { useState, memo } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode,
  Loader2,
  Plus,
  Check,
  Minus, 
} from "lucide-react";
import type { ExplorerEntry as ExplorerEntryType } from "@shared/types/axon-core/explorer";
import * as S from "../styles";
import type { ExplorerOptions } from "../types";
import { useNodeSession, useWorkspaceSession } from "@features/core/workspace";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useWorkspaceActions } from "@features/core/workspace/hooks/use-workspace-actions";

interface Props {
  entry: ExplorerEntryType;
  depth: number;
  options: ExplorerOptions;
  onFolderExpand: (path: string) => Promise<ExplorerEntryType[] | undefined>;
  onNavigate: (path: string) => void;
}

export const ExplorerEntry = memo((props: Props) => {
  const { entry, depth, options, onFolderExpand, onNavigate } = props;
  const path = entry.data.path;
  const isFolder = entry.type === "folder";

  // --- 1. Local UI State ---
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<ExplorerEntryType[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 2. Global Session & Backend Hooks ---
  const { hoverRelationship, isSelected } = useNodeSession(path);
  const { activeId } = useWorkspaceManager();
  
  const { toggleSelection, setHovered, openFileInViewer } = useWorkspaceSession();
  
  const { activePaths, setPaths, toggleTarget } = useBundleSession();
  const { handle, isFetching } = useWorkspaceActions().lazyFilePathsByDir;
  
  const isFocused =
    hoverRelationship === "exact" ||
    (hoverRelationship === "child-hovered" && !isOpen);

  // --- 3. Derived Sync State ---
  const inGraph = !isFolder && activePaths.includes(path);

  const folderActiveFilesCount = isFolder
    ? activePaths.filter((p) => p.startsWith(path + "/")).length
    : 0;
  const hasFilesInGraph = folderActiveFilesCount > 0;

  // --- 4. Event Handlers ---

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) return;

    if (options.cascade === false) {
      onNavigate(path);
      return;
    }

    if (!isOpen && children.length === 0) {
      setLoading(true);
      const result = await onFolderExpand(path);
      if (result) setChildren(result);
      setLoading(false);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder && options.foldersSelectable === false) return;
    if (!isFolder && options.filesSelectable === false) return;

    toggleSelection(path, options.multiSelect ? e.ctrlKey || e.metaKey : false);
  };

  const handleToggleFileGraph = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTarget(path);
  };

  const handleToggleFolderGraph = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) return;

    try {
      const folderFiles = await handle({
        id: activeId!,
        query: {
          limit: 100,
          path: path,
          recursive: true,
        },
      });

      if (!folderFiles || folderFiles.length === 0) return;

      const allInGraph = folderFiles.every((f) => activePaths.includes(f));

      if (allInGraph) {
        const nextPaths = activePaths.filter((p) => !folderFiles.includes(p));
        setPaths(nextPaths);
      } else {
        const nextPaths = Array.from(new Set([...activePaths, ...folderFiles]));
        setPaths(nextPaths);
      }
    } catch (err) {
      console.error("Failed to toggle folder files", err);
    }
  };

  return (
    <S.TreeItem>
      <S.ItemRow
        $depth={depth}
        $isSelected={isSelected}
        $isFocused={isFocused}
        onClick={(e) => {
          if (!isFolder) handleSelect(e);
          if (isFolder) handleToggle(e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isFolder) openFileInViewer(path);
        }}
        onMouseEnter={() => setHovered(path)}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Caret */}
        {options.cascade !== false && (
          <div
            onClick={handleToggle}
            style={{ width: 16, display: "flex", alignItems: "center" }}
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin text-blue-400" />
            ) : isFolder ? (
              <ChevronRight
                size={14}
                style={{
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            ) : null}
          </div>
        )}

        {/* Icon */}
        {isFolder ? (
          isOpen ? (
            <FolderOpen size={14} className="text-blue-400" />
          ) : (
            <Folder size={14} className="text-gray-500" />
          )
        ) : (
          <FileCode
            size={14}
            className={inGraph ? "text-green-400" : "text-gray-400"}
          />
        )}

        {/* Label */}
        <S.Label $inGraph={inGraph || hasFilesInGraph} title={entry.data.name}>
          {entry.data.name}
        </S.Label>

        {/* Quick Actions */}
        {isFolder ? (
          <S.GraphToggleBtn
            className="graph-toggle-btn"
            $inGraph={hasFilesInGraph}
            onClick={handleToggleFolderGraph}
            title={
              hasFilesInGraph
                ? "Sync folder with Graph (Add missing / Remove all)"
                : "Add all files to Graph"
            }
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : hasFilesInGraph ? (
              <Minus size={14} /> 
            ) : (
              <Plus size={14} />
            )}
          </S.GraphToggleBtn>
        ) : (
          <S.GraphToggleBtn
            className="graph-toggle-btn"
            $inGraph={inGraph}
            onClick={handleToggleFileGraph}
            title={inGraph ? "Remove from Graph" : "Add to Graph"}
          >
            {inGraph ? <Check size={14} /> : <Plus size={14} />}
          </S.GraphToggleBtn>
        )}
      </S.ItemRow>

      {/* Children */}
      {isOpen && (
        <S.ChildrenContainer>
          {children.map((child) => (
            <ExplorerEntry
              key={child.data.path}
              {...props}
              entry={child}
              depth={depth + 1}
            />
          ))}
        </S.ChildrenContainer>
      )}
    </S.TreeItem>
  );
});

ExplorerEntry.displayName = "ExplorerEntry";