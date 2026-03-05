import { memo } from "react";
import styled from "styled-components";
import { EyeOff, Trash2 } from "lucide-react";

import { Flex, Text, Button } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";

const ScrollableSymbolList = styled(Flex)`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  ${customScrollbar}
`;

const SymbolRow = styled(Flex)`
  padding: 4px 6px;
  border-radius: 4px;
  .symbol-actions { opacity: 0; transition: opacity 0.2s ease; }
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    .symbol-actions { opacity: 1; }
  }
`;

type Props = {
  symbols: any[];
  filePath: string;
  rules: any[];
  onToggleRule: (e: React.MouseEvent, symId: number, actionType: "hideImplementation" | "removeEntirely") => void;
};

export const FileNodeSymbols = memo(({ symbols, filePath, rules, onToggleRule }: Props) => {
  if (symbols.length === 0) return null;

  return (
    // ✨ FIX 1: Add "nowheel" to stop the graph from zooming when scrolling the list!
    <ScrollableSymbolList className="nodrag nowheel" $direction="column" $gap="xs" $p="sm">
      {symbols.map((sym) => {
        const existingRule = rules.find(r => 
          'specificSymbol' in r.target && 
          r.target.specificSymbol.file_path === filePath && 
          r.target.specificSymbol.symbol_id === sym.id
        );
        
        const isHidden = existingRule?.action === "hideImplementation";
        const isRemoved = existingRule?.action === "removeEntirely";

        return (
          <SymbolRow key={sym.id} $align="center" $justify="space-between">
            {/* We apply minWidth: 0 here so the inner text truncation actually works */}
            <Flex $align="center" $gap="sm" style={{ minWidth: 0 }}>
              
              {/* ✨ FIX 2: Pixel-perfect centered badge using Flex and fixed dimensions */}
              <Flex 
                $align="center" 
                $justify="center" 
                $bg="bg.overlay" 
                $radius="sm" 
                style={{ width: 32, height: 20, flexShrink: 0 }}
              >
                <Text 
                  $size="xs" 
                  $color="muted" 
                  $uppercase 
                  $weight="bold" 
                  style={{ lineHeight: 1, paddingTop: 1 }}
                >
                  {sym.kind.slice(0, 3)}
                </Text>
              </Flex>

              <Text 
                $size="sm" 
                $color={isHidden || isRemoved ? "muted" : "secondary"} 
                $truncate
                title={sym.name}
                style={{ 
                  textDecoration: isRemoved ? 'line-through' : 'none',
                  fontStyle: isHidden ? 'italic' : 'normal',
                  opacity: isHidden || isRemoved ? 0.6 : 1
                }}
              >
                {sym.name}
              </Text>
            </Flex>

            <Flex className="symbol-actions" $align="center" $gap="xs" style={{ opacity: isHidden || isRemoved ? 1 : undefined }}>
              <Button 
                $variant="icon"
                title={isHidden ? "Restore Implementation" : "Hide Implementation"}
                onClick={(e) => onToggleRule(e, sym.id, "hideImplementation")}
                style={{ color: isHidden ? '#facc15' : undefined, background: isHidden ? '#374151' : undefined }}
              >
                <EyeOff size={12} />
              </Button>
              <Button 
                $variant="icon"
                title={isRemoved ? "Restore Symbol" : "Remove Symbol Entirely"}
                onClick={(e) => onToggleRule(e, sym.id, "removeEntirely")}
                style={{ color: isRemoved ? '#f87171' : undefined, background: isRemoved ? '#374151' : undefined }}
              >
                <Trash2 size={12} />
              </Button>
            </Flex>
          </SymbolRow>
        );
      })}
    </ScrollableSymbolList>
  );
});

FileNodeSymbols.displayName = "FileNodeSymbols";