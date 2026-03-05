import { useState } from 'react';
import { Plus, Check, X, Layers, Edit2, Trash2 } from 'lucide-react';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session';
import { Flex, Button, Input, Select, Box } from '@shared/ui';
import { useTheme } from 'styled-components';

export const BundleSelector = () => {
  const { allBundles, activeBundle, switchBundle, createBundle, renameActiveBundle, deleteActiveBundle } = useBundleSession();
  const theme = useTheme();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAction = async () => {
    if (!newName.trim()) return;
    if (isCreating) await createBundle(newName.trim());
    else if (isRenaming && newName !== activeBundle?.name) await renameActiveBundle(newName.trim());
    
    setIsCreating(false);
    setIsRenaming(false);
    setNewName("");
  };

  if (isCreating || isRenaming) {
    return (
      <Flex id="tour-bundle-selector" $align="center" $gap="sm" $p="xs md" $bg="bg.surface" $radius="md">
        <Layers size={16} color={theme.colors.palette.primary.light} />
        <Input 
          autoFocus
          $size="sm"
          placeholder={isCreating ? "Bundle Name..." : "Rename Bundle..."}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAction()}
        />
        <Button $variant="icon" onClick={handleAction} title="Save">
          <Check size={16} color={theme.colors.palette.success.main} />
        </Button>
        <Button $variant="icon" onClick={() => { setIsCreating(false); setIsRenaming(false); }} title="Cancel">
          <X size={16} color={theme.colors.palette.danger.main} />
        </Button>
      </Flex>
    );
  }

  return (
    <Flex id="tour-bundle-selector" $align="center" $gap="sm" $p="xs md" $bg="bg.surface" $radius="md" style={{ border: `1px solid ${theme.colors.border.subtle}` }}>
      <Layers size={16} color={theme.colors.palette.primary.light} />
      
      <Select 
        $size="sm"
        value={activeBundle?.id || ""} 
        onChange={(e) => switchBundle(e.target.value)}
        style={{ flex: 1 }}
      >
        {allBundles.map(bundle => (
          <option key={bundle.id} value={bundle.id}>{bundle.name}</option>
        ))}
      </Select>
      
      <Flex $gap="xs">
        <Button $variant="icon" onClick={() => { setNewName(activeBundle?.name || ""); setIsRenaming(true); }} title="Rename">
          <Edit2 size={14} color={theme.colors.text.muted} />
        </Button>
        <Button $variant="icon" onClick={deleteActiveBundle} title="Delete">
          <Trash2 size={14} color={theme.colors.text.muted} />
        </Button>
        <Box $bg="border.subtle" style={{ width: 1, height: 16, margin: '0 4px' }} />
        <Button $variant="icon" onClick={() => { setNewName(""); setIsCreating(true); }} title="New Bundle">
          <Plus size={16} color={theme.colors.palette.primary.light} />
        </Button>
      </Flex>
    </Flex>
  );
};