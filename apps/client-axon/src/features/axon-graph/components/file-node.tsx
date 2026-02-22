import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { FileCode } from 'lucide-react';
import type { FileNodeView } from '@shared/types/axon-core/graph';
import type { Symbol as AxonSymbol } from '@shared/types/axon-core/symbols';
import * as S from '../styles';

export type AppFileNode = Node<FileNodeView, 'fileNode'>;

export const FileNode = memo(({ data, selected }: NodeProps<AppFileNode>) => {
  const topLevelSymbols = data.symbols?.filter((s: AxonSymbol) => !s.parent) || [];
  return (
    <S.NodeCard $selected={!!selected}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />

      <S.NodeHeader>
        <FileCode size={14} className="text-blue-400 flex-shrink-0" />
        <span className="truncate">{data.label}</span>
      </S.NodeHeader>

      {topLevelSymbols.length > 0 && (
        <S.SymbolList>
          {topLevelSymbols.map((sym: AxonSymbol) => (
            <S.SymbolItem key={sym.id}>
              <S.SymbolKindBadge $kind={sym.kind}>
                {sym.kind.substring(0, 3)}
              </S.SymbolKindBadge>
              <span className="truncate">{sym.name}</span>
            </S.SymbolItem>
          ))}
        </S.SymbolList>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </S.NodeCard>
  );
});

FileNode.displayName = 'FileNode';