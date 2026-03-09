import { useState } from "react";
import { Plus, Check, X, Layers, Edit2, Trash2 } from "lucide-react";
import { Flex, Button, Input, Select, Box } from "@shared/ui";
import { useTheme } from "styled-components";

import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";
import { useBundleActions } from "../hooks/use-bundle-actions";
import { useActiveBundleQuery, useActiveWorkspaceBundlesQuery } from "../hooks/use-bundle-queries";
import { useActiveBundleActions } from "../hooks/use-active-bundle-actions";

export const BundleSelector = () => {
  const theme = useTheme();

  // 1. Global State
  const workspaceId = useActiveWorkspaceId();
  const { activeBundle } = useActiveBundleQuery();
  const { allBundles } = useActiveWorkspaceBundlesQuery(); 
  
  // 2. Action Hooks
  const { createBundle, selectBundle } = useBundleActions();
  const { renameBundle, deleteBundle } = useActiveBundleActions();

  // 3. Local UI State
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  // 🌟 THE USE-EFFECT IS GONE. REDUX MIDDLEWARE HANDLES AUTO-SELECTION NOW.

  // 4. Handlers
  const handleSave = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName || !workspaceId) return;

    if (isCreating) {
      await createBundle.handle({
        workspaceId,
        name: trimmedName,
        options: {
          hideBarrelExports: false,
          rules: [],
          targetFiles: []
        },
      });
    } else if (isRenaming && trimmedName !== activeBundle?.name) {
      renameBundle(trimmedName);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsRenaming(false);
    setNewName("");
  };

  const handleDelete = () => deleteBundle();

  const startRename = () => {
    setNewName(activeBundle?.name || "");
    setIsRenaming(true);
  };

  const startCreate = () => {
    setNewName("");
    setIsCreating(true);
  };

  // --- RENDER: EDIT MODE ---
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
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <Button $variant="icon" onClick={handleSave} title="Save">
          <Check size={16} color={theme.colors.palette.success.main} />
        </Button>
        <Button $variant="icon" onClick={handleCancel} title="Cancel">
          <X size={16} color={theme.colors.palette.danger.main} />
        </Button>
      </Flex>
    );
  }

  // --- RENDER: SELECT MODE ---
  return (
    <Flex
      id="tour-bundle-selector"
      $align="center"
      $gap="sm"
      $p="xs md"
      $bg="bg.surface"
      $radius="md"
      style={{ border: `1px solid ${theme.colors.border.subtle}` }}
    >
      <Layers size={16} color={theme.colors.palette.primary.light} />

      <Select
        $size="sm"
        value={activeBundle?.id || ""}
        onChange={(e) => selectBundle(e.target.value)}
        style={{ flex: 1 }}
      >
        {allBundles?.map((bundle) => (
          <option key={bundle.id} value={bundle.id}>
            {bundle.name}
          </option>
        ))}
      </Select>

      <Flex $gap="xs">
        <Button $variant="icon" onClick={startRename} title="Rename" disabled={!activeBundle}>
          <Edit2 size={14} color={theme.colors.text.muted} />
        </Button>
        <Button $variant="icon" onClick={handleDelete} title="Delete" disabled={!activeBundle}>
          <Trash2 size={14} color={theme.colors.text.muted} />
        </Button>
        <Box $bg="border.subtle" style={{ width: 1, height: 16, margin: "0 4px" }} />
        <Button $variant="icon" onClick={startCreate} title="New Bundle">
          <Plus size={16} color={theme.colors.palette.primary.light} />
        </Button>
      </Flex>
    </Flex>
  );
};