import React from "react";
import styled from "styled-components";
import { FileCode, Plus, Check } from "lucide-react";
import { Flex, Text, Button } from "@shared/ui";
import { useTheme } from "styled-components";

const SearchResultRow = styled(Flex)`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  cursor: pointer;
  border-left: 2px solid transparent;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
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
  activePaths: string[];
  onToggle: (path: string) => void;
}

export const ExplorerSearchResults: React.FC<ExplorerSearchResultsProps> = ({ 
  results, 
  activePaths, 
  onToggle 
}) => {
  const theme = useTheme();

  return (
    <Flex $direction="column">
      {results.map((path) => {
        const name = path.split(/[/\\]/).pop() || path;
        const inGraph = activePaths.includes(path);
        
        return (
          <SearchResultRow 
            key={path} 
            $align="center" 
            $gap="sm" 
            onClick={() => onToggle(path)}
          >
            <FileCode 
              size={14} 
              color={inGraph ? theme.colors.palette.success.main : theme.colors.text.muted} 
            />
            
            <Text 
              $size="md" 
              $color={inGraph ? "primary" : "secondary"} 
              $weight={inGraph ? "semibold" : "regular"} 
              $truncate 
              style={{ flex: 1 }}
              title={path}
            >
              {name}
            </Text>
            
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
};