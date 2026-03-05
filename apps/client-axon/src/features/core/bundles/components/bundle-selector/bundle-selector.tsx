import { useState } from 'react';
import { Plus, Check, X, Layers, Edit2, Trash2 } from 'lucide-react';
import * as S from './bundle-selector.styles';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session';

export const BundleSelector = () => {
  const { allBundles, activeBundle, switchBundle, createBundle, renameActiveBundle, deleteActiveBundle } = useBundleSession();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    try {
      if (newName.trim()) {
        await createBundle(newName.trim());
      }
    } finally {
      setIsCreating(false);
      setNewName("");
    }
  };

  const handleRename = async () => {
    try {
      if (newName.trim() && newName !== activeBundle?.name) {
        await renameActiveBundle(newName.trim());
      }
    } finally {
      setIsRenaming(false);
      setNewName("");
    }
  };

  const handleDelete = async () => {
    const isLastBundle = allBundles.length <= 1;
    
    // Only alert if we are deleting the very last bundle in the workspace
    if (isLastBundle) {
      if (!window.confirm("Deleting the last bundle will automatically create a default bundle. Continue?")) {
        return;
      }
    }
    
    await deleteActiveBundle();
  };

  const openRenameMode = () => {
    if (activeBundle) {
      setNewName(activeBundle.name);
      setIsRenaming(true);
    }
  };

  const openCreateMode = () => {
    setNewName("");
    setIsCreating(true);
  };

  if (isCreating || isRenaming) {
    return (
      <S.Container>
        <Layers size={16} className="text-blue-400" />
        <S.CreateInput 
          autoFocus
          placeholder={isCreating ? "Bundle Name..." : "Rename Bundle..."}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (isCreating ? handleCreate() : handleRename())}
        />
        <S.IconButton onClick={isCreating ? handleCreate : handleRename} title="Save">
          <Check size={16} className="text-green-400" />
        </S.IconButton>
        <S.IconButton onClick={() => { setIsCreating(false); setIsRenaming(false); }} title="Cancel">
          <X size={16} className="text-red-400" />
        </S.IconButton>
      </S.Container>
    );
  }

  return (
    <S.Container id="tour-bundle-selector">
      <Layers size={16} className="text-blue-400" />
      
      <S.Select 
        value={activeBundle?.id || ""} 
        onChange={(e) => switchBundle(e.target.value)}
      >
        {allBundles.map(bundle => (
          <option key={bundle.id} value={bundle.id}>
            {bundle.name}
          </option>
        ))}
      </S.Select>
      
      <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
        <S.IconButton onClick={openRenameMode} title="Rename Active Bundle">
          <Edit2 size={14} className="text-gray-400 hover:text-white" />
        </S.IconButton>
        <S.IconButton onClick={handleDelete} title="Delete Active Bundle">
          <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
        </S.IconButton>
        <S.IconButton onClick={openCreateMode} title="Create New Bundle">
          <Plus size={16} className="text-blue-400 hover:text-blue-300" />
        </S.IconButton>
      </div>
    </S.Container>
  );
};