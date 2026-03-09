import { useCallback } from "react";
import { useBundleActions } from "./use-bundle-actions";
import { useActiveBundleQuery } from "./use-bundle-queries";
import type {
  UpdateBundlePayload
} from "@shared/types/axon-core/bundle-api";
import type { BundleOptions, RedactionRule } from "@shared/types/axon-core/bundler";

export const useActiveBundleActions = () => {
  const actions = useBundleActions();
  const { activeBundle } = useActiveBundleQuery();

  const executeUpdate = useCallback(
    (
      updater: ((currentOptions: BundleOptions) => BundleOptions) | null,
      newName?: string,
    ) => {
      if (!activeBundle) return;

      const payload: UpdateBundlePayload = { ...activeBundle };
      let hasChanges = false;

      if (newName !== undefined && newName !== activeBundle.name) {
        payload.name = newName;
        hasChanges = true;
      }

      if (updater) {
        payload.options = updater(activeBundle.options);
        hasChanges = true;
      }

      if (!hasChanges) return;

      actions.updateBundle.handle({
        id: activeBundle.id,
        workspaceId: activeBundle.workspaceId,
        payload,
      });
    },
    [activeBundle, actions.updateBundle],
  );

  return {
    renameBundle: (newName: string) => {
      executeUpdate(null, newName);
    },

    toggleHideBarrelExports: () => {
      executeUpdate((opts) => ({
        ...opts,
        hideBarrelExports: !opts.hideBarrelExports,
      }));
    },

    // 🌟 1. Hard Override
    setTargetFiles: (files: string[]) => {
      executeUpdate((opts) => ({
        ...opts,
        targetFiles: files,
      }));
    },

    // 🌟 2. Granular: Clear All
    clearTargetFiles: () => {
      executeUpdate((opts) => ({
        ...opts,
        targetFiles: [],
      }));
    },

    // 🌟 3. Granular: Add One or Many (With built-in Deduplication!)
    addTargetFiles: (files: string[]) => {
      executeUpdate((opts) => ({
        ...opts,
        // Using a Set guarantees we never get duplicate paths in the array
        targetFiles: Array.from(new Set([...opts.targetFiles, ...files])),
      }));
    },

    // 🌟 4. Granular: Remove One or Many
    removeTargetFiles: (files: string[]) => {
      executeUpdate((opts) => ({
        ...opts,
        // Keep files that are NOT in the 'files' removal array
        targetFiles: opts.targetFiles.filter((f) => !files.includes(f)),
      }));
    },

    // 🌟 5. The classic toggle for single-click UI buttons
    toggleTargetFile: (filePath: string) => {
      executeUpdate((opts) => {
        const exists = opts.targetFiles.includes(filePath);
        return {
          ...opts,
          targetFiles: exists
            ? opts.targetFiles.filter((f) => f !== filePath)
            : [...opts.targetFiles, filePath],
        };
      });
    },

    addRule: (rule: RedactionRule) => {
      executeUpdate((opts) => ({
        ...opts,
        rules: [...opts.rules, rule],
      }));
    },

    removeRule: (ruleIndex: number) => {
      executeUpdate((opts) => ({
        ...opts,
        rules: opts.rules.filter((_, index) => index !== ruleIndex),
      }));
    },

    deleteBundle: () => {
      if (!activeBundle) return 
      actions.deleteBundle.handle({
        id: activeBundle.id,
        workspaceId: activeBundle.workspaceId
      })
    }
  };
};