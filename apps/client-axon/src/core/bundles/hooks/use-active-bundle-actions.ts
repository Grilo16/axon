import { useCallback } from "react";
import { useBundleActions } from "./use-bundle-actions";
import { useActiveBundleQuery } from "./use-bundle-queries";
import type { UpdateBundlePayload } from "@shared/types/axon-core/bundle-api";
import type {
  BundleOptions,
  RedactionRule,
  RedactionType,
} from "@shared/types/axon-core/bundler";

export const useActiveBundleActions = () => {
  const actions = useBundleActions();
  const { activeBundle } = useActiveBundleQuery();

  const executeUpdate = useCallback(
    (
      updater: ((currentOptions: BundleOptions) => BundleOptions) | null,
      newName?: string,
      intent: "name" | "graph" | "context" | "all" = "all",
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
        intent,
      });
    },
    [activeBundle, actions.updateBundle],
  );

  return {
    renameBundle: (newName: string) => {
      executeUpdate(null, newName, "name");
    },

    toggleHideBarrelExports: () => {
      executeUpdate(
        (opts) => ({
          ...opts,
          hideBarrelExports: !opts.hideBarrelExports,
        }),
        undefined,
        "graph",
      );
    },

    setTargetFiles: (files: string[]) => {
      executeUpdate((opts) => ({
        ...opts,
        targetFiles: files,
     }),
        undefined,
        "graph",
      );
    },

    clearTargetFiles: () => {
      executeUpdate((opts) => ({
        ...opts,
        targetFiles: [],
     }),
        undefined,
        "graph",
      );
    },

    addTargetFiles: (files: string[]) => {
      executeUpdate((opts) => ({
        ...opts,
        targetFiles: Array.from(new Set([...opts.targetFiles, ...files])),
     }),
        undefined,
        "graph",
      );
    },

    removeTargetFiles: (files: string[]) => {
      executeUpdate((opts) => ({
        ...opts,
        targetFiles: opts.targetFiles.filter((f) => !files.includes(f)),
     }),
        undefined,
        "graph",
      );
    },

    toggleTargetFile: (filePath: string) => {
      executeUpdate((opts) => {
        const exists = opts.targetFiles.includes(filePath);
        return {
          ...opts,
          targetFiles: exists
            ? opts.targetFiles.filter((f) => f !== filePath)
            : [...opts.targetFiles, filePath],
        }},
        undefined,
        "graph",
      );
    },

    addRule: (rule: RedactionRule) => {
      executeUpdate((opts) => ({
        ...opts,
        rules: [...opts.rules, rule],
     }),
        undefined,
        "context",
      );
    },

    removeRule: (ruleIndex: number) => {
      executeUpdate((opts) => ({
        ...opts,
        rules: opts.rules.filter((_, index) => index !== ruleIndex),
    }),
        undefined,
        "context",
      );
    },

    toggleSymbolRedaction: (
      filePath: string,
      symbolId: number,
      actionType: RedactionType,
    ) => {
      executeUpdate((opts) => {
        const existingIndex = opts.rules.findIndex(
          (r) =>
            "specificSymbol" in r.target &&
            r.target.specificSymbol.file_path === filePath &&
            r.target.specificSymbol.symbol_id === symbolId,
        );

        const newRules = [...opts.rules];

        if (existingIndex !== -1) {
          const currentRule = newRules[existingIndex];
          if (currentRule.action === actionType) {
            newRules.splice(existingIndex, 1);
          } else {
            newRules[existingIndex] = { ...currentRule, action: actionType };
          }
        } else {
          newRules.push({
            target: {
              specificSymbol: { file_path: filePath, symbol_id: symbolId },
            },
            action: actionType,
          });
        }

        return { ...opts, rules: newRules };
      },
      undefined,
      "context"
    );
    },
    deleteBundle: () => {
      if (!activeBundle) return;
      actions.deleteBundle.handle({
        id: activeBundle.id,
        workspaceId: activeBundle.workspaceId,
      });
    },
  };
};
