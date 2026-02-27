import { Trash2 } from "lucide-react";
import * as S from "./bundle-details.styles";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { useAxonGraph } from "@features/axon-graph/hooks/use-axon-graph"; // ✨ Bring in the graph!
import type { TargetScope, RedactionType } from "@shared/types/axon-core/bundler";

const formatAction = (action: RedactionType): string => {
  if (action === "removeEntirely") return "Remove Entirely";
  if (action === "hideImplementation") return "Hide Implementation";
  if (typeof action === "object" && "replaceWith" in action) return `Replace with custom text`;
  return "Unknown Action";
};

export const BundleDetails = () => {
 const { activeBundle, deleteRule } = useBundleSession();
  const { graphData } = useAxonGraph(); 

  if (!activeBundle) return null;

  const rules = activeBundle.options.rules;

  const formatTarget = (target: TargetScope): string => {
    if ("entireFile" in target) return `File: ${target.entireFile.split(/[/\\]/).pop()}`;
    if ("global" in target) return `Global: ${target.global}`;
    if ("specificSymbol" in target) {
      const { file_path, symbol_id } = target.specificSymbol;
      
      const node = graphData?.nodes.find(n => n.id === file_path);
      const symbol = node?.symbols.find(s => s.id === symbol_id);
      
      const symName = symbol?.name || `ID:${symbol_id}`;
      const fileName = file_path.split(/[/\\]/).pop();
      
      return `${symName} (in ${fileName})`;
    }
    return "Unknown Target";
  };

 return (
    <S.Container>
      <S.Header>Redaction Rules</S.Header>

      <S.RulesList>
        {rules.length === 0 ? (
          <S.EmptyState>No redaction rules applied to this bundle.</S.EmptyState>
        ) : (
          rules.map((rule, index) => (
            <S.RuleItem key={index}>
              <S.RuleText>
                <S.RuleTarget title={JSON.stringify(rule.target)}>{formatTarget(rule.target)}</S.RuleTarget>
                <S.RuleAction>{formatAction(rule.action)}</S.RuleAction>
              </S.RuleText>

              <S.DeleteBtn onClick={() => deleteRule(index)} title="Remove Rule">
                <Trash2 size={14} />
              </S.DeleteBtn>
            </S.RuleItem>
          ))
        )}
      </S.RulesList>
    </S.Container>
  );
};