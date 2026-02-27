import { useState } from 'react';
import { Plus, Check, X, Layers } from 'lucide-react';
import * as S from './bundle-selector.styles';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session';

export const BundleSelector = () => {
  const { allBundles, activeBundle, switchBundle, createBundle } = useBundleSession();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (newName.trim()) {
      createBundle(newName.trim());
    }
    setIsCreating(false);
    setNewName("");
  };

  if (isCreating) {
    return (
      <S.Container>
        <Layers size={16} className="text-blue-400" />
        <S.CreateInput 
          autoFocus
          placeholder="Bundle Name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <S.IconButton onClick={handleCreate} title="Save"><Check size={16} className="text-green-400" /></S.IconButton>
        <S.IconButton onClick={() => setIsCreating(false)} title="Cancel"><X size={16} className="text-red-400" /></S.IconButton>
      </S.Container>
    );
  }

  return (
    <S.Container>
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
      <S.IconButton onClick={() => setIsCreating(true)} title="Create New Bundle">
        <Plus size={16} />
      </S.IconButton>
    </S.Container>
  );
};