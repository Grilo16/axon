import React, { useState, memo } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode,
  Loader2,
} from "lucide-react";
import type { ExplorerEntry as ExplorerEntryType } from "@shared/types/axon-core/explorer";
import type { ExplorerOptions } from "./file-explorer";
import * as S from "../styles";

interface Props {
  entry: ExplorerEntryType;
  depth: number;
  selectedPaths: Set<string>;
  options: ExplorerOptions;
  onFileClick: (path: string) => void;
  onSelect: (path: string, isMulti: boolean) => void;
  onFolderExpand: (path: string) => Promise<ExplorerEntryType[] | undefined>;
  onNavigate: (path: string) => void;
}

export const ExplorerEntry = memo(
  ({
    entry,
    depth,
    selectedPaths,
    options,
    onFileClick,
    onSelect,
    onFolderExpand,
    onNavigate,
  }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [children, setChildren] = useState<ExplorerEntryType[]>([]);
    const [loading, setLoading] = useState(false);

    const isFolder = entry.type === "folder";
    const isSelected = selectedPaths.has(entry.data.path);

    const handleToggle = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isFolder) return;

      if (options.cascade === false) {
        onNavigate(entry.data.path);
        return;
      }

      if (!isOpen && children.length === 0) {
        setLoading(true);
        const result = await onFolderExpand(entry.data.path);
        if (result) setChildren(result);
        setLoading(false);
      }
      setIsOpen(!isOpen);
    };

    const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Enforce Selectable Options
      if (isFolder && options.foldersSelectable === false) return;
      if (!isFolder && options.filesSelectable === false) return;
      // Detect Multi-Select
      const isMultiRequested = e.ctrlKey || e.metaKey;
      const isMulti = options.multiSelect ? isMultiRequested : false;

      onSelect(entry.data.path, isMulti);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        handleToggle(e);
      } else {
        onFileClick(entry.data.path);
      }
    };

    return (
      <S.TreeItem>
        <S.ItemRow
          $depth={depth}
          $isActive={isSelected}
          onClick={handleSelect}
          onDoubleClick={handleDoubleClick}
        >
          {options.cascade !== false ? (
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
          ) : null}

          {isFolder ? (
            isOpen ? (
              <FolderOpen size={14} className="text-blue-400" />
            ) : (
              <Folder size={14} className="text-gray-500" />
            )
          ) : (
            <FileCode size={14} className="text-gray-400" />
          )}

          <S.Label>{entry.data.name}</S.Label>
        </S.ItemRow>

        {isOpen && (
          <S.ChildrenContainer>
            {children.map((child) => (
              <ExplorerEntry
                key={child.data.path}
                entry={child}
                depth={depth + 1}
                selectedPaths={selectedPaths}
                options={options}
                onFileClick={onFileClick}
                onSelect={onSelect}
                onFolderExpand={onFolderExpand}
                onNavigate={onNavigate}
              />
            ))}
          </S.ChildrenContainer>
        )}
      </S.TreeItem>
    );
  },
);

ExplorerEntry.displayName = "ExplorerEntry";
