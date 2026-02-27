import { memo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { MinusCircle, PlusCircle, ChevronDown, Plus } from "lucide-react";
import * as S from "./file-node.styles";
import { useGraphActions } from "../../context/graph-actions";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";

function stopPropagationOnly(evt: ReactMouseEvent) {
  evt.stopPropagation();
}

function getFileName(path: string): string {
  return path.split(/[/\\]/).pop() || path;
}

type Props = {
  imports: string[];
  usedBy: string[];
};

export const FileNodeActions = memo(({ imports, usedBy }: Props) => {
  const { addFile, batchUpdateFiles } = useGraphActions();
  
  const { activePaths } = useBundleSession();
  
  const [outMenuOpen, setOutMenuOpen] = useState(false);
  const [inMenuOpen, setInMenuOpen] = useState(false);

  const inactiveImports = imports.filter((imp) => !activePaths.includes(imp));
  const inactiveUsedBy = usedBy.filter((ub) => !activePaths.includes(ub));

  return (
    <S.NodeActionGrid className="nodrag">
      
      {/* OUTGOING (Imports) */}
      <S.ActionGroup $active={inactiveImports.length < imports.length} $tone="green">
        <S.ActionMainButton 
          disabled={inactiveImports.length === 0}
          onClick={() => batchUpdateFiles(inactiveImports, [])}
          title={inactiveImports.length === 0 ? "All imports added" : `Add ${inactiveImports.length} imports`}
        >
          {inactiveImports.length === 0 ? <MinusCircle size={12} /> : <PlusCircle size={12} />}
          Imports ({inactiveImports.length === 0 ? "All" : inactiveImports.length})
        </S.ActionMainButton>
        
        <S.ActionChevron 
          disabled={inactiveImports.length === 0} 
          onClick={() => { setOutMenuOpen(!outMenuOpen); setInMenuOpen(false); }}
        >
          <ChevronDown size={12} />
        </S.ActionChevron>

        {outMenuOpen && inactiveImports.length > 0 && (
          <S.ActionPopover onMouseDown={stopPropagationOnly} onClick={stopPropagationOnly}>
            {inactiveImports.map((path) => (
              <S.ActionRow key={path} title={path} onClick={() => { addFile(path); setOutMenuOpen(false); }}>
                <Plus size={12} /> {getFileName(path)}
              </S.ActionRow>
            ))}
          </S.ActionPopover>
        )}
      </S.ActionGroup>

      {/* INCOMING (Used By) */}
      <S.ActionGroup $active={inactiveUsedBy.length < usedBy.length} $tone="blue">
        <S.ActionMainButton 
          disabled={inactiveUsedBy.length === 0}
          onClick={() => batchUpdateFiles(inactiveUsedBy, [])}
          title={inactiveUsedBy.length === 0 ? "All users added" : `Add ${inactiveUsedBy.length} users`}
        >
          {inactiveUsedBy.length === 0 ? <MinusCircle size={12} /> : <PlusCircle size={12} />}
          Used By ({inactiveUsedBy.length === 0 ? "All" : inactiveUsedBy.length})
        </S.ActionMainButton>
        
        <S.ActionChevron 
          disabled={inactiveUsedBy.length === 0} 
          onClick={() => { setInMenuOpen(!inMenuOpen); setOutMenuOpen(false); }}
        >
          <ChevronDown size={12} />
        </S.ActionChevron>

        {inMenuOpen && inactiveUsedBy.length > 0 && (
          <S.ActionPopover onMouseDown={stopPropagationOnly} onClick={stopPropagationOnly}>
            {inactiveUsedBy.map((path) => (
              <S.ActionRow key={path} title={path} onClick={() => { addFile(path); setInMenuOpen(false); }}>
                <Plus size={12} /> {getFileName(path)}
              </S.ActionRow>
            ))}
          </S.ActionPopover>
        )}
      </S.ActionGroup>

    </S.NodeActionGrid>
  );
});

FileNodeActions.displayName = "FileNodeActions";