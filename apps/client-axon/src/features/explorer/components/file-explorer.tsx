import { useState } from "react";
import styled from "styled-components";
import { Flex, Box } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";

import { ExplorerSearchBar } from "./explorer-search-bar";
import { ExplorerSearchResults } from "./explorer-search-results";
import { ExplorerNode } from "./explorer-node";
import { useExplorerSearch } from "../hooks/use-explorer-search";
import { useExplorerDirectory } from "../hooks/use-explorer-directory";
import { useActiveWorkspaceId, useSelectedExplorerKey } from "@features/core/workspace/hooks/use-workspace-slice";

const ScrollableArea = styled(Box)`
  overflow-y: auto;
  overflow-x: hidden;
  ${customScrollbar}
`;

export const FileExplorer = () => {
  const key = useSelectedExplorerKey()
  const activeWorkspaceId = useActiveWorkspaceId();
  const [searchQuery, setSearchQuery] = useState("");
  const { children } = useExplorerDirectory("/", true, true);
  
  const { results, activePathsSet, addAllToGraph, removeAllFromGraph, toggleTarget } = useExplorerSearch(searchQuery);

  return (
    <Flex id="tour-file-explorer" $direction="column" $fill $bg="bg.surface" key={`${activeWorkspaceId}-${key}`} style={{ minHeight: 0 }}>
      <ExplorerSearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAddAll={addAllToGraph} 
        onRemoveAll={removeAllFromGraph}
        resultCount={results.length}
      />

      <ScrollableArea $fill>
       {searchQuery ? (
          <ExplorerSearchResults 
            results={results} 
            activePaths={activePathsSet}
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
          )
        )}
      </ScrollableArea>
    </Flex>
  );
};