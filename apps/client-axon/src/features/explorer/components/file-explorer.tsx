import React, { useEffect } from "react";
import { ExplorerEntry } from "./explorer-entry";
import { ExplorerError, ExplorerLoader } from "./explorer-layout";
import { ExplorerToolbar } from "./explorer-toolbar";
import type { UseExplorerReturn } from "../hooks/use-explorer";
import * as S from "../styles";

export interface ExplorerOptions {
  foldersSelectable?: boolean;
  filesSelectable?: boolean;
  multiSelect?: boolean;
  cascade?: boolean;
}

interface FileExplorerProps {
  explorer: UseExplorerReturn; // 👈 Everything is inside this now!
  options?: ExplorerOptions;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  explorer,
  options = { foldersSelectable: true, filesSelectable: true, multiSelect: true, cascade: true}
}) => {
  const { 
    entries, navigateTo, openFile, isLoading, error, 
    currentPath, goBack, goForward, fetchDir, 
    canGoBack, canGoForward,
    selectedPaths, handleSelect, clearSelection 
  } = explorer;

  useEffect(() => {
    if (currentPath) navigateTo(currentPath);
  }, []);

  return (
    <S.ExplorerContainer>
      <ExplorerToolbar
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        goBack={goBack}
        goForward={goForward}
        currentPath={currentPath}
        onNavigate={navigateTo}
        onRefresh={() => currentPath && navigateTo(currentPath)}
      />
      <S.ScrollArea onClick={clearSelection}>
        {error && <ExplorerError type={error.type} />}

        {isLoading && entries.length === 0 ? (
          <ExplorerLoader />
        ) : (
          entries.map((entry) => (
            <ExplorerEntry
              key={entry.data.path}
              entry={entry}
              depth={0}
              selectedPaths={selectedPaths}
              options={options}
              onFileClick={openFile}
              onSelect={handleSelect}
              onFolderExpand={fetchDir}
              onNavigate={navigateTo}
            />
          ))
        )}
      </S.ScrollArea>
    </S.ExplorerContainer>
  );
};