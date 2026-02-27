import { memo, useEffect } from "react";
import { Position, type NodeProps, useStore, NodeResizeControl, useUpdateNodeInternals } from "@xyflow/react";

import * as S from "./file-node.styles";
import type { AppFileNode } from "../../types";
import { FileNodeHeader } from "./file-node-header";
import { FileNodeActions } from "./file-node-actions";
import { useNodeSession, useWorkspaceSession } from "@features/core/workspace";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { EyeOff, Trash2 } from "lucide-react";

export const FileNode = memo(({ id, data, selected }: NodeProps<AppFileNode>) => {
  const zoom = useStore((s) => s.transform[2]);
  const isZoomedOut = zoom < 0.65;
  const updateNodeInternals = useUpdateNodeInternals();


  const { activeBundle, addRedaction, deleteRule } = useBundleSession();
  const rules = activeBundle?.options.rules || [];
  // We only pull hover state from Redux now. 
  // Selection is handled beautifully by our layout engine.
  const { hoverRelationship } = useNodeSession(data.fileId);
  const { openFileInViewer} = useWorkspaceSession()
  // The Graph Hover Algorithm
  const isHovered = hoverRelationship === "exact" || hoverRelationship === "parent-hovered";

  useEffect(() => { updateNodeInternals(id); }, [isZoomedOut, updateNodeInternals, id]);

  const symbols = data.symbols ?? [];

const handleToggleRule = (e: React.MouseEvent, symId: number, actionType: "hideImplementation" | "removeEntirely") => {
    e.stopPropagation();

    // 1. Check if a rule already exists for this exact symbol
    const existingIndex = rules.findIndex(r =>
      'specificSymbol' in r.target &&
      r.target.specificSymbol.file_path === data.path &&
      r.target.specificSymbol.symbol_id === symId
    );

    if (existingIndex >= 0) {
      const existingRule = rules[existingIndex];
      
      // 2. If clicking the EXACT same action, it's a toggle OFF (remove rule)
      if (existingRule.action === actionType) {
        deleteRule(existingIndex);
        return;
      } 
      
      // 3. If clicking the OTHER action, swap them (delete old, add new)
      deleteRule(existingIndex);
      addRedaction({
        target: { specificSymbol: { file_path: data.path, symbol_id: symId } },
        action: actionType
      });
      return;
    }

    // 4. No rule existed, just add it!
    addRedaction({
      target: { specificSymbol: { file_path: data.path, symbol_id: symId } },
      action: actionType
    });
  };

  return (
    <S.NodeCard 
      $selected={!!selected} 
      $isZoomedOut={isZoomedOut} 
      $isHovered={isHovered} 
      onDoubleClick={(e) => {
        e.stopPropagation();
        openFileInViewer(data.fileId);
      }}
    >
      
      {!isZoomedOut && (
        <NodeResizeControl minWidth={300} minHeight={110} style={{ border: 'none', background: 'transparent' }}>
          <S.ResizeHandle />
        </NodeResizeControl>
      )}

      <S.TopTargetHandle id="top-in" type="target" position={Position.Top} />

      <FileNodeHeader fileId={data.fileId} label={data.label} isZoomedOut={isZoomedOut} />
      
      {!isZoomedOut && <S.NodePath title={data.path}>{data.path}</S.NodePath>}

      <FileNodeActions imports={data.imports} usedBy={data.usedBy} />

   {!isZoomedOut && symbols.length > 0 && (
        <S.SymbolList className="nodrag">
        {symbols.map((sym) => {
            const existingRule = rules.find(r =>
              'specificSymbol' in r.target &&
              r.target.specificSymbol.file_path === data.path &&
              r.target.specificSymbol.symbol_id === sym.id
            );

            const isHidden = existingRule?.action === "hideImplementation";
            const isRemoved = existingRule?.action === "removeEntirely";

            return (
              <S.SymbolItem key={sym.id}>
                
                <S.SymbolDetails>
                  <S.SymbolKindBadge $kind={sym.kind}>{sym.kind.slice(0, 3)}</S.SymbolKindBadge>
                  <S.SymbolName title={sym.name} $isHidden={isHidden} $isRemoved={isRemoved}>
                    {sym.name}
                  </S.SymbolName>
                </S.SymbolDetails>

                <S.SymbolActions $forceVisible={isHidden || isRemoved}>
                  <S.ActionButton 
                    $variant="hide"
                    $isActive={isHidden}
                    title={isHidden ? "Restore Implementation" : "Hide Implementation"}
                    onClick={(e) => handleToggleRule(e, sym.id, "hideImplementation")}
                  >
                    <EyeOff size={12} />
                  </S.ActionButton>

                  <S.ActionButton 
                    $variant="remove"
                    $isActive={isRemoved}
                    title={isRemoved ? "Restore Symbol" : "Remove Symbol Entirely"}
                    onClick={(e) => handleToggleRule(e, sym.id, "removeEntirely")}
                  >
                    <Trash2 size={12} />
                  </S.ActionButton>
                </S.SymbolActions>

              </S.SymbolItem>
            );
          })}
        </S.SymbolList>
      )}

      <S.BottomSourceHandle id="bottom-out" type="source" position={Position.Bottom} />
    </S.NodeCard>
  );
});

FileNode.displayName = "FileNode";