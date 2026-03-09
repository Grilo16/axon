import styled from "styled-components";
import { Flex, Box } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";

// Reusing pure UI components
import { ExplorerSearchBar } from "@features/explorer/components/explorer-search-bar";
import { ExplorerSearchResults } from "@features/explorer/components/explorer-search-results";

import { usePublicSandbox } from "../hooks/use-public-sandbox";
import { usePublicExplorerSuite } from "../hooks/use-public-explorer";
import { PublicExplorerNode } from "./public-explorer-node";

const ScrollableArea = styled(Box)`
  overflow-y: auto;
  overflow-x: hidden;
  ${customScrollbar}
`;

export const PublicFileExplorer = ({ sandbox }: { sandbox: ReturnType<typeof usePublicSandbox> }) => {
  const explorer = usePublicExplorerSuite(sandbox);

  return (
    <Flex id="tour-public-explorer" $direction="column" $fill $bg="bg.surface">
      <ExplorerSearchBar 
        searchQuery={explorer.searchQuery} 
        setSearchQuery={explorer.setSearchQuery} 
        onAddAll={explorer.handleAddAllSearch} 
        resultCount={explorer.searchResults.length}
      />

      <ScrollableArea $fill>
        {explorer.isTreeLoading ? (
          <ExplorerLoader />
        ) : explorer.searchQuery ? (
          <ExplorerSearchResults 
            results={explorer.searchResults} 
            activePaths={explorer.activePaths} 
            onToggle={explorer.toggleTarget} 
          />
        ) : (
          explorer.entries.map((entry) => (
            <PublicExplorerNode
              key={entry.data.path}
              entry={entry}
              depth={0}
              activePaths={explorer.activePaths}
              onFolderExpand={explorer.fetchDir}
              onToggleTarget={explorer.toggleTarget}
              onToggleFolderGraph={explorer.handleToggleFolderGraph}
            />
          ))
        )}
      </ScrollableArea>
    </Flex>
  );
};