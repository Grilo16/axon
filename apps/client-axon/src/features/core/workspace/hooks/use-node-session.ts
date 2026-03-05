import { useMemo } from 'react';
import { useAppSelector } from '@app/store';
import { 
  makeSelectHoverRelationship, 
  makeSelectIsPathSelected,
  type HoverRelationship
} from '../workspace-slice';

/**
 * Node Performance Subscriber
 * * Used by individual <FileNode> and <ExplorerEntry> components.
 * Memoizes selectors so that hovering/selecting one node doesn't 
 * force the entire React Flow canvas to re-render.
 */
export const useNodeSession = (path: string): { 
  hoverRelationship: HoverRelationship; 
  isSelected: boolean 
} => {
  const selectHoverRel = useMemo(() => makeSelectHoverRelationship(path), [path]);
  const selectIsSelected = useMemo(() => makeSelectIsPathSelected(path), [path]);

  const hoverRelationship = useAppSelector(selectHoverRel);
  const isSelected = useAppSelector(selectIsSelected);

  return { hoverRelationship, isSelected };
};