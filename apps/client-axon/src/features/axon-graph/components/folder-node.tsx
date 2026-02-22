import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { FolderOpen } from 'lucide-react';

export type AppFolderNode = Node<{ label: string }, 'folderNode'>;

export const FolderNode = memo(({ data, width, height }: NodeProps<AppFolderNode>) => {
  return (
    <div 
      style={{
        width,
        height,
        backgroundColor: 'rgba(30, 30, 30, 0.4)',
        border: '1px solid #444',
        borderRadius: '8px',
        zIndex: -1, 
      }}
    >
      <div >
        <FolderOpen size={14} />
        {data.label}
      </div>
    </div>
  );
});

FolderNode.displayName = 'FolderNode';