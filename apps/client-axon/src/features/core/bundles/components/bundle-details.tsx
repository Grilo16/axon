import { Trash2 } from "lucide-react";
import styled from "styled-components";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useAxonGraph } from "@features/axon-graph/hooks/use-axon-graph";
import { Flex, Text, Button } from "@shared/ui";
import { customScrollbar } from "@shared/ui/theme/mixins";

const RulesScrollArea = styled(Flex)`
  max-height: 250px;
  overflow-y: auto;
  ${customScrollbar}
`;

export const BundleDetails = () => {
  const { activeBundle, deleteRule } = useBundleSession();
  const { graphData } = useAxonGraph(); 

  if (!activeBundle) return null;
  const rules = activeBundle.options.rules;

  const formatTarget = (target: any) => {
    if ("entireFile" in target) return `File: ${target.entireFile.split(/[/\\]/).pop()}`;
    if ("specificSymbol" in target) {
      const { file_path, symbol_id } = target.specificSymbol;
      const node = graphData?.nodes.find(n => n.id === file_path);
      const symbol = node?.symbols.find(s => s.id === symbol_id);
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
              <Button $variant="icon" onClick={() => deleteRule(index)}>
                <Trash2 size={14} />
              </Button>
            </Flex>
          ))
        )}
      </RulesScrollArea>
    </Flex>
  );
};