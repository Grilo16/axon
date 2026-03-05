import React, { useState, useMemo } from "react";
import { FileCode, Plus, Check } from "lucide-react";
import { ExplorerEntry } from "./explorer-entry";
import { ExplorerLoader } from "./explorer-layout";
import { ExplorerSearch } from "./explorer-search"; 
import * as S from "../styles";
import { useExplorer } from "../hooks/use-explorer";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useGetAllFilePathsQuery } from "@features/core/workspace/api/workspace-api";

export const FileExplorer: React.FC = () => {
  const { entries, isLoading, fetchDir } = useExplorer();
  const { activeId, isBooting } = useWorkspaceManager();
  const { activePaths, setPaths, toggleTarget } = useBundleSession();
  const { data: allPaths } = useGetAllFilePathsQuery(
    { id: activeId!, query: { limit: 100 } }, 
    { skip: !activeId }
  );
  
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery || !allPaths) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return allPaths.filter(p => p.toLowerCase().includes(lowerQuery)).slice(0, 100);
  }, [searchQuery, allPaths]);

  const handleAddAll = () => {
    const nextPaths = Array.from(new Set([...activePaths, ...searchResults]));
    setPaths(nextPaths);
    setSearchQuery(""); 
  };

  // ✨ Strict Loading Lock: If booting OR fetching initial load without data, lock the UI.
  const isExplorerWorking = isBooting || isLoading;

  return (
    <S.ExplorerContainer id="tour-file-explorer">
      <ExplorerSearch 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAddAll={handleAddAll} 
        resultCount={searchResults.length}
      />

      <S.ScrollArea>
        {isExplorerWorking ? (
          <ExplorerLoader />
        ) : searchQuery ? (
          searchResults.map((path) => {
            const name = path.split(/[/\\]/).pop() || path;
            const inGraph = activePaths.includes(path);
            
            return (
              <S.ItemRow key={path} $depth={0} $isFocused={false} $isSelected={false} onClick={() => toggleTarget(path)}>
                <FileCode size={14} className={inGraph ? "text-green-400" : "text-gray-400"} />
                <S.Label $inGraph={inGraph} title={path}>{name}</S.Label>
                <S.GraphToggleBtn $inGraph={inGraph} onClick={(e) => { e.stopPropagation(); toggleTarget(path); }}>
                  {inGraph ? <Check size={14} /> : <Plus size={14} />}
                </S.GraphToggleBtn>
              </S.ItemRow>
            );
          })
        ) : (
          entries.map((entry) => (
            <ExplorerEntry
              key={entry.data.path}
              entry={entry}
              depth={0}
              options={{ cascade: true }}
              onFolderExpand={fetchDir}
              onNavigate={() => {}}
            />
          ))
        )}
      </S.ScrollArea>
    </S.ExplorerContainer>
  );
};