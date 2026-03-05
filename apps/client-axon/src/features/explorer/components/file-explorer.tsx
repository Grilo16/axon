import styled from "styled-components";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";

import { Flex, Box } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";

import { ExplorerSearchBar } from "./explorer-search-bar";
import { ExplorerLoader } from "./explorer-states";
import { ExplorerSearchResults } from "./explorer-search-results";
import { ExplorerNode } from "./explorer-node";
import { useExplorer, useExplorerSearch } from "../hooks";

// Inject the sleek custom scrollbar!
const ScrollableArea = styled(Box)`
  overflow-y: auto;
  overflow-x: hidden;
  ${customScrollbar}
`;


export const FileExplorer = () => {
  const { entries, isLoading: isTreeLoading, fetchDir } = useExplorer();
  const { isBooting } = useWorkspaceManager();
  
  const { 
    searchQuery, setSearchQuery, searchResults, handleAddAll, 
    toggleTarget, activePaths 
  } = useExplorerSearch();

  const isWorking = isBooting || isTreeLoading;

  return (
    <Flex id="tour-file-explorer" $direction="column" $fill $bg="bg.surface">
      <ExplorerSearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAddAll={handleAddAll} 
        resultCount={searchResults.length}
      />

      <ScrollableArea $fill>
        {isWorking ? (
          <ExplorerLoader />
        ) : searchQuery ? (
          <ExplorerSearchResults 
            results={searchResults} 
            activePaths={activePaths} 
            onToggle={toggleTarget} 
          />
        ) : (
          entries.map((entry) => (
            <ExplorerNode
              key={entry.data.path}
              entry={entry}
              depth={0}
              options={{ cascade: true }}
              onFolderExpand={fetchDir}
              onNavigate={() => {}}
            />
          ))
        )}
      </ScrollableArea>
    </Flex>
  );
};