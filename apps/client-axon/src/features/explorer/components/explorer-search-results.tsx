import React, { memo } from "react";
import styled, { useTheme } from "styled-components";
import { FileCode, Plus, Check } from "lucide-react";
import { Flex, Text, Button } from "@shared/ui";
import { useWorkspaceDispatchers } from "@core/workspace/hooks/use-workspace-slice";

const SearchResultRow = styled(Flex)`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  cursor: pointer;
  border-left: 2px solid transparent;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    border-left-color: ${({ theme }) => theme.colors.palette.primary.main};
    
    .graph-toggle-btn {
      opacity: 1;
    }
  }
`;

const GraphToggleBtn = styled(Button)`
  opacity: 0;
  padding: 4px;
  transition: opacity 0.2s ease;
`;

interface ExplorerSearchResultsProps {
  results: string[];
  activePaths: Set<string>;
  onToggle: (path: string) => void;
}

// 🌟 Wrap in memo so we don't re-render 100 rows when you type a new letter!
export const ExplorerSearchResults: React.FC<ExplorerSearchResultsProps> = memo(({ 
  results, 
  activePaths, 
  onToggle 
}) => {
  const theme = useTheme();
  // 🌟 Bring in our global dispatchers for the hover effect!
  const { hoverNode } = useWorkspaceDispatchers();

  if (results.length === 0) {
    return (
      <Flex $align="center" $justify="center" $p="xl">
        <Text $color="muted" $size="sm">No files found.</Text>
      </Flex>
    );
  }

  return (
    <Flex $direction="column" $p="0 sm">
      {results.map((path) => {
        // 🌟 VS Code Style Split: Separate the file name from the directory
        const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        const fileName = lastSlashIndex !== -1 ? path.substring(lastSlashIndex + 1) : path;
        const dirPath = lastSlashIndex !== -1 ? path.substring(0, lastSlashIndex) : "";
        
        const inGraph = activePaths.has(path);
        
        return (
          <SearchResultRow 
            key={path} 
            $align="center" 
            $gap="sm" 
            onClick={() => onToggle(path)}
            // 🌟 Instant Graph Highlighting!
            onMouseEnter={() => hoverNode(path)}
            onMouseLeave={() => hoverNode(null)}
          >
            <FileCode 
              size={14} 
              color={inGraph ? theme.colors.palette.success.main : theme.colors.text.muted} 
              style={{ flexShrink: 0 }}
            />
            
            <Flex $align="baseline" $gap="xs" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <Text 
                $size="sm" 
                $color={inGraph ? "primary" : "secondary"} 
                $weight={inGraph ? "bold" : "medium"} 
                $truncate 
              >
                {fileName}
              </Text>
              
              {/* 🌟 Muted Directory Path */}
              {dirPath && (
                <Text 
                  $size="xs" 
                  $color="muted" 
                  $truncate 
                  style={{ opacity: 0.7 }}
                >
                  {dirPath}
                </Text>
              )}
            </Flex>
            
            <GraphToggleBtn 
              className="graph-toggle-btn" 
              $variant="icon" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggle(path); 
              }}
              title={inGraph ? "Remove from Graph" : "Add to Graph"}
            >
              {inGraph ? (
                <Check size={14} color={theme.colors.palette.success.main} />
              ) : (
                <Plus size={14} color={theme.colors.text.muted} />
              )}
            </GraphToggleBtn>
          </SearchResultRow>
        );
      })}
    </Flex>
  );
});

ExplorerSearchResults.displayName = "ExplorerSearchResults";