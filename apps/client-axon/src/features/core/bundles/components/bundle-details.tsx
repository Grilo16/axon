import { Trash2, FileCode, ShieldAlert } from "lucide-react";
import styled, { useTheme } from "styled-components";
import { Flex, Text, Button } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";
import type { RedactionRule } from "@shared/types/axon-core/bundler";
import { useGraphModel } from "@features/axon-graph/hooks/use-graph-model";
import { useActiveBundleQuery } from "../hooks/use-bundle-queries";
import { useActiveBundleActions } from "../hooks/use-active-bundle-actions";

const RulesScrollArea = styled(Flex)`
  flex: 1;           /* 🌟 Fill available vertical space */
  min-height: 0;     /* 🌟 Crucial: Allows it to shrink below content size */
  overflow-y: auto;
  ${customScrollbar}
`;

export const BundleDetails = () => {
  const theme = useTheme();
  const { activeBundle } = useActiveBundleQuery();
  const { removeRule } = useActiveBundleActions();
  const { nodes } = useGraphModel();
  
  if (!activeBundle) return null;
  const rules = activeBundle.options.rules;
  const fileCount = activeBundle.options.targetFiles?.length || 0;
  const ruleCount = rules.length || 0;

  const formatTarget = (target: RedactionRule["target"]) => {
    /* ... keep your existing formatter ... */
    if ("entireFile" in target) return `File: ${target.entireFile.split(/[/\\]/).pop()}`;
    if ("specificSymbol" in target) {
      const { file_path, symbol_id } = target.specificSymbol;
      const node = nodes.find(n => n.id === file_path);
      const symbol = node?.data.symbols.find(s => s.id === symbol_id);
      return `${symbol?.name || symbol_id} (${file_path.split(/[/\\]/).pop()})`;
    }
    return "Global Rule";
  };

  return (
    <Flex $direction="column" $gap="md" style={{ flex: 1, minHeight: 0 }}>
      
      {/* THE STATISTICS ROW */}
      <Flex $gap="sm" $wrap="wrap" style={{ flexShrink: 0 }}>
        <Flex $bg="bg.overlay" $p="xs sm" $radius="sm" $gap="xs" $align="center" style={{ border: `1px solid ${theme.colors.border.subtle}` }}>
          <FileCode size={12} color={theme.colors.palette.success.main} />
          <Text $size="xs" $weight="bold">{fileCount} Files</Text>
        </Flex>
        <Flex $bg="bg.overlay" $p="xs sm" $radius="sm" $gap="xs" $align="center" style={{ border: `1px solid ${theme.colors.border.subtle}` }}>
          <ShieldAlert size={12} color={theme.colors.palette.warning.main} />
          <Text $size="xs" $weight="bold">{ruleCount} Rules</Text>
        </Flex>
      </Flex>

      {/* THE SCROLLING RULES LIST */}
      <Flex $direction="column" $gap="xs" style={{ flex: 1, minHeight: 0 }}>
        <Text $size="xs" $weight="bold" $uppercase $color="muted" $letterSpacing="0.05em" style={{ flexShrink: 0 }}>Redaction Rules</Text>
        <RulesScrollArea $direction="column" $gap="xs">
          {rules.length === 0 ? (
            <Text $size="sm" $color="muted" $align="center" $p="lg">No rules applied.</Text>
          ) : (
            rules.map((rule, index) => (
              <Flex key={index} $p="xs sm" $bg="bg.overlay" $radius="sm" $align="center" $justify="space-between">
                <Flex $direction="column" style={{ minWidth: 0 }}>
                  <Text $size="xs" $weight="bold" $truncate>{formatTarget(rule.target)}</Text>
                  <Text $size="xs" $color="muted">{rule?.action?.toString()}</Text>
                </Flex>
                <Button $variant="icon" onClick={() => removeRule(index)}>
                  <Trash2 size={14} />
                </Button>
              </Flex>
            ))
          )}
        </RulesScrollArea>
      </Flex>
    </Flex>
  );
};