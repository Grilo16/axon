import { Trash2 } from "lucide-react";
import styled from "styled-components";
import { Flex, Text, Button } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";
import type { RedactionRule } from "@shared/types/axon-core/bundler";
import { useGraphModel } from "@features/axon-graph/hooks/use-graph-model";
import { useActiveBundleQuery } from "../hooks/use-bundle-queries";
import { useActiveBundleActions } from "../hooks/use-active-bundle-actions";

const RulesScrollArea = styled(Flex)`
  max-height: 250px;
  overflow-y: auto;
  ${customScrollbar}
`;

export const BundleDetails = () => {
  const {activeBundle} = useActiveBundleQuery()
  const {removeRule} = useActiveBundleActions()
  const { nodes } = useGraphModel()
  if (!activeBundle) return null;
  const rules = activeBundle.options.rules;

  // Type strictly bound to the Domain model, no 'any' permitted.
  const formatTarget = (target: RedactionRule["target"]) => {
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
    <Flex $direction="column" $gap="sm" $p="sm 0">
      <Text $size="xs" $weight="bold" $uppercase $color="muted" $letterSpacing="0.05em">Redaction Rules</Text>
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
  );
};