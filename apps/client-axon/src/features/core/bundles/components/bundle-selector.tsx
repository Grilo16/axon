import { useEffect, useState } from "react";
import { Plus, Check, X, Edit2, Trash2, EyeOff, Eye } from "lucide-react";
import { Flex, Button, Input, Select, Box } from "@shared/ui";
import { useTheme } from "styled-components";

import { useActiveWorkspaceId } from "@features/core/workspace/hooks/use-workspace-slice";
import { useBundleActions } from "../hooks/use-bundle-actions";
import {
  useActiveBundleQuery,
  useActiveWorkspaceBundlesQuery,
} from "../hooks/use-bundle-queries";
import { useActiveBundleActions } from "../hooks/use-active-bundle-actions";

export const BundleSelector = () => {
  const theme = useTheme();
  const workspaceId = useActiveWorkspaceId();
  const { activeBundle } = useActiveBundleQuery();
  const { allBundles } = useActiveWorkspaceBundlesQuery();

  const { createBundle, selectBundle } = useBundleActions();
  const { renameBundle, deleteBundle, toggleHideBarrelExports } = useActiveBundleActions();

  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!allBundles || allBundles.length === 0) return;
    const isCurrentBundleValid = allBundles.some(b => b.id === activeBundle?.id);
    if (!isCurrentBundleValid) selectBundle(allBundles[0].id);
  }, [allBundles, activeBundle?.id, selectBundle]);

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
          targetFiles: [],
        },
      });
    } else if (isRenaming && trimmedName !== activeBundle?.name) {
      renameBundle(trimmedName);
    }

    handleCancel();
  };
  const handleCancel = () => { setIsCreating(false); setIsRenaming(false); setNewName(""); };
  const handleDelete = () => deleteBundle();
  const startRename = () => { setNewName(activeBundle?.name || ""); setIsRenaming(true); };
  const startCreate = () => { setNewName(""); setIsCreating(true); };

  return (
    <Flex id="tour-bundle-selector" $direction="column" $gap="sm" style={{ flexShrink: 0 }}>
      
      {/* ROW 1: THE SELECTOR / EDIT INPUT */}
      {isCreating || isRenaming ? (
        <Flex $align="center" $gap="sm">
          <Input
            autoFocus
            $size="sm"
            placeholder={isCreating ? "Bundle Name..." : "Rename Bundle..."}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{ flex: 1, minWidth: 0 }}
          />
          <Button $variant="icon" onClick={handleSave} title="Save">
            <Check size={16} color={theme.colors.palette.success.main} />
          </Button>
          <Button $variant="icon" onClick={handleCancel} title="Cancel">
            <X size={16} color={theme.colors.palette.danger.main} />
          </Button>
        </Flex>
      ) : (
        <Select
          $size="sm"
          value={activeBundle?.id || ""}
          onChange={(e) => selectBundle(e.target.value)}
          style={{ width: "100%", minWidth: 0 }}
        >
          {allBundles?.map((bundle) => (
            <option key={bundle.id} value={bundle.id}>{bundle.name}</option>
          ))}
        </Select>
      )}

      {/* ROW 2: THE WRAPPABLE ACTION TOOLBAR */}
      <Flex $justify="space-between" $align="center" $wrap="wrap" $gap="sm">
        <Flex $gap="xs" $align="center">
            <Button $variant="icon" onClick={startCreate} title="New Bundle">
            <Plus size={16} color={theme.colors.palette.primary.light} />
          </Button>
          <Box $bg="border.subtle" style={{ width: 1, height: 16, margin: "0 4px" }} />
          <Button $variant="icon" onClick={startRename} disabled={!activeBundle} title="Rename">
            <Edit2 size={14} color={theme.colors.text.muted} />
          </Button>
          <Button $variant="icon" onClick={handleDelete} disabled={!activeBundle} title="Delete">
            <Trash2 size={14} color={theme.colors.text.muted} />
          </Button>
       
        </Flex>

        {/* Barrels Toggle stays on the right, but wraps below if squeezed! */}
        <Flex $align="center" $gap="xs">
          <Button id="tour-hide-barrels-toggle" $variant="icon" onClick={toggleHideBarrelExports} title="Toggle Barrel Exports">
            {activeBundle?.options?.hideBarrelExports ? (
              <EyeOff size={14} color={theme.colors.palette.primary.main} />
            ) : (
              <Eye size={14} />
            )}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
