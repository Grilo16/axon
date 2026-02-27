import React, { useState, useEffect, useMemo } from "react";
import { FileCode, Plus, Check } from "lucide-react";
import { ExplorerEntry } from "./explorer-entry";
import { ExplorerLoader } from "./explorer-layout";
import { ExplorerSearch } from "./explorer-search"; // ✨ The new search bar
import * as S from "../styles";
import { useExplorer } from "../hooks/use-explorer";
import { useLazyGetAllFilePathsQuery } from "@features/core/workspace/api/workspace-api";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";

export const FileExplorer: React.FC = () => {
  const { entries, isLoading, fetchDir } = useExplorer();
  const { activePaths, setPaths, toggleTarget } = useBundleSession();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerGetAll, { data: allPaths }] = useLazyGetAllFilePathsQuery();

  useEffect(() => {
    if (searchQuery && !allPaths) {
      triggerGetAll({});
    }
  }, [searchQuery, allPaths, triggerGetAll]);

  // Fuzzy filter
  const searchResults = useMemo(() => {
    if (!searchQuery || !allPaths) return [];
    const lowerQuery = searchQuery.toLowerCase();
    // Exclude node_modules or standard noise if you want, and limit to 100 for performance
    return allPaths.filter(p => p.toLowerCase().includes(lowerQuery)).slice(0, 100);
  }, [searchQuery, allPaths]);

  const handleAddAll = () => {
    const nextPaths = Array.from(new Set([...activePaths, ...searchResults]));
    setPaths(nextPaths);
    setSearchQuery(""); 
  };

  return (
    <S.ExplorerContainer>
      <ExplorerSearch 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAddAll={handleAddAll} 
        resultCount={searchResults.length}
      />

      <S.ScrollArea>
        {isLoading && entries.length === 0 ? (
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