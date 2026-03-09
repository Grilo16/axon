// src/features/explorer/containers/PrivateExplorerContainer.tsx
import { useState } from "react";
import styled from "styled-components";
import { Flex, Box } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";

import { ExplorerSearchBar } from "../components/explorer-search-bar";
import { ExplorerSearchResults } from "../components/explorer-search-results";
import { ExplorerNode } from "../components/explorer-node";
import { useExplorerSearch } from "../hooks/use-explorer-search";
import { useExplorerDirectory } from "../hooks/use-explorer-directory";

const ScrollableArea = styled(Box)`
  overflow-y: auto;
  overflow-x: hidden;
  ${customScrollbar}
`;

export const FileExplorer = ({}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { children } = useExplorerDirectory("/", true);
  const { results, addAllToGraph, toggleTarget } = useExplorerSearch(searchQuery);

  return (
    <Flex id="tour-file-explorer" $direction="column" $fill $bg="bg.surface">
      <ExplorerSearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAddAll={addAllToGraph} 
        resultCount={results.length}
      />

      <ScrollableArea $fill>
       {searchQuery ? (
          <ExplorerSearchResults 
            results={results} 
            activePaths={[]}
            onToggle={toggleTarget} 
          />
        ) : (
        children.length > 0 && (
        <Flex $direction="column">
          {children.map((child: any) => (
            <ExplorerNode
              key={child.data.path}
              path={child.data.path}
              name={child.data.name}
              isFolder={child.type === "folder"}
              depth={0}
            />
          ))}
        </Flex>
      ))}

   
      </ScrollableArea>
    </Flex>
  );
};