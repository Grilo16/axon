import { Search, PlusSquare, X } from "lucide-react";
import { Flex, Text, Button, Input, Box } from "@shared/ui";
import { useTheme } from "styled-components";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddAll: () => void;
  resultCount: number;
}

export const ExplorerSearchBar = ({ searchQuery, setSearchQuery, onAddAll, resultCount }: Props) => {
  const theme = useTheme();

  return (
    <Flex $direction="column" $gap="md" $p="md" style={{ borderBottom: `1px solid ${theme.colors.border.subtle}` }}>
      <Box style={{ position: 'relative' }}>
        <Search size={14} color={theme.colors.text.muted} style={{ position: 'absolute', left: 10, top: 10 }} />
        <Input
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Fuzzy search files..."
          style={{ paddingLeft: 32, paddingRight: 32 }}
        />
        {searchQuery && (
          <Button 
            $variant="icon" 
            onClick={() => setSearchQuery("")} 
            style={{ position: 'absolute', right: 4, top: 4 }}
          >
            <X size={14} />
          </Button>
        )}
      </Box>

      {searchQuery && (
        <Flex $align="center" $justify="space-between">
          <Text $size="xs" $color="muted">{resultCount} files found</Text>
          <Button $variant="primary" onClick={onAddAll} disabled={resultCount === 0} style={{ padding: '4px 8px' }}>
            <Flex $align="center" $gap="xs">
              <PlusSquare size={12} />
              <Text $size="xs" $weight="semibold">Add All</Text>
            </Flex>
          </Button>
        </Flex>
      )}
    </Flex>
  );
};