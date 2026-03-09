import { memo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { MinusCircle, PlusCircle, ChevronDown, Plus } from "lucide-react";
import { useGraphInteractions } from "../../hooks/use-graph-interactions";

import { 
  Grid, Flex, Text, SplitButtonGroup, SplitButtonMain, 
  SplitButtonChevron, PopoverMenu, MenuItem 
} from "@shared/ui";
import { useActiveBundleQuery } from "@features/core/bundles/hooks/use-bundle-queries";

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
  // 🌟 Directly consume the interaction hook
  const { addNodeToBundle, batchUpdateNodesInBundle } = useGraphInteractions();
  
  const {activeBundle} = useActiveBundleQuery()
  const activePaths = activeBundle?.options.targetFiles || []
  
  const [outMenuOpen, setOutMenuOpen] = useState(false);
  const [inMenuOpen, setInMenuOpen] = useState(false);

  const inactiveImports = imports.filter((imp) => !activePaths.includes(imp));
  const inactiveUsedBy = usedBy.filter((ub) => !activePaths.includes(ub));

  return (
    <Grid className="nodrag nowheel" $columns="1fr 1fr" $gap="sm" $p="sm" style={{ borderBottom: '1px solid #2b2b2b' }}>
      
      {/* OUTGOING (Imports) */}
      <Flex $direction="column" style={{ position: 'relative' }}>
        <SplitButtonGroup $active={inactiveImports.length < imports.length} $tone="success">
          <SplitButtonMain 
            disabled={inactiveImports.length === 0}
            onClick={() => batchUpdateNodesInBundle(inactiveImports, [])} // 🌟 Updated FSD call
            title={inactiveImports.length === 0 ? "All imports added" : `Add ${inactiveImports.length} imports`}
          >
            {inactiveImports.length === 0 ? <MinusCircle size={12} /> : <PlusCircle size={12} />}
            <Text $size="sm">Imports ({inactiveImports.length === 0 ? "All" : inactiveImports.length})</Text>
          </SplitButtonMain>
          
          <SplitButtonChevron 
            disabled={inactiveImports.length === 0} 
            onClick={() => { setOutMenuOpen(!outMenuOpen); setInMenuOpen(false); }}
          >
            <ChevronDown size={12} />
          </SplitButtonChevron>
        </SplitButtonGroup>

        {outMenuOpen && inactiveImports.length > 0 && (
          <PopoverMenu onMouseDown={stopPropagationOnly} onClick={stopPropagationOnly} style={{ width: '100%' }}>
            {inactiveImports.map((path) => (
              <MenuItem key={path} title={path} onClick={() => { addNodeToBundle(path); setOutMenuOpen(false); }}>
                <Plus size={12} />
                <span>{getFileName(path)}</span>
              </MenuItem>
            ))}
          </PopoverMenu>
        )}
      </Flex>

      <Flex $direction="column" style={{ position: 'relative' }}>
        <SplitButtonGroup $active={inactiveUsedBy.length < usedBy.length} $tone="primary">
          <SplitButtonMain 
            disabled={inactiveUsedBy.length === 0}
            onClick={() => batchUpdateNodesInBundle(inactiveUsedBy, [])} // 🌟 Updated FSD call
            title={inactiveUsedBy.length === 0 ? "All users added" : `Add ${inactiveUsedBy.length} users`}
          >
            {inactiveUsedBy.length === 0 ? <MinusCircle size={12} /> : <PlusCircle size={12} />}
            <Text $size="sm">Used By ({inactiveUsedBy.length === 0 ? "All" : inactiveUsedBy.length})</Text>
          </SplitButtonMain>
          
          <SplitButtonChevron 
            disabled={inactiveUsedBy.length === 0} 
            onClick={() => { setInMenuOpen(!inMenuOpen); setOutMenuOpen(false); }}
          >
            <ChevronDown size={12} />
          </SplitButtonChevron>
        </SplitButtonGroup>

        {inMenuOpen && inactiveUsedBy.length > 0 && (
          <PopoverMenu onMouseDown={stopPropagationOnly} onClick={stopPropagationOnly} style={{ width: '100%' }}>
            {inactiveUsedBy.map((path) => (
              <MenuItem key={path} title={path} onClick={() => { addNodeToBundle(path); setInMenuOpen(false); }}>
                <Plus size={12} />
                <span>{getFileName(path)}</span>
              </MenuItem>
            ))}
          </PopoverMenu>
        )}
      </Flex>

    </Grid>
  );
});

FileNodeActions.displayName = "FileNodeActions";