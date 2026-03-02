import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { toast } from "sonner";
import {
  selectActiveBundleIdForWorkspace,
  setActiveBundleId,
} from "../bundles-slice";
import {
  selectActiveWorkspaceId,
  setViewedBundleContent,
} from "../../workspace/workspace-slice";

import type { RedactionRule } from "@shared/types/axon-core/bundler";
import { useBundleActions } from "./use-bundle-actions";
import type { BundleRecord } from "@shared/types/axon-core/bundle-api";
import { useGetWorkspaceBundlesQuery } from "../api/bundles-api";

export const useBundleSession = () => {
  const dispatch = useAppDispatch();
  const workspaceId = useAppSelector(selectActiveWorkspaceId);
  const activeBundleId = useAppSelector(selectActiveBundleIdForWorkspace);

  const { createBundle, updateBundle, generateBundle, deleteBundle } = useBundleActions();

  // 1. Fetch data - simplified the query object
  const { data: allBundles = [] } = useGetWorkspaceBundlesQuery(
    { id: workspaceId!, query: { limit: null, offset: null } },
    { skip: !workspaceId }
  );

  // 2. Memoize derived state to prevent unnecessary re-renders
  const activeBundle = useMemo(
    () => allBundles.find((b) => b.id === activeBundleId) || null,
    [allBundles, activeBundleId]
  );

  const activePaths = useMemo(() => activeBundle?.options.targetFiles || [], [activeBundle]);

  // 3. CORE UPDATE LOGIC
  // We explicitly return the promise so callers can await if needed
  const updateActiveOptions =
    async (newOptions: Partial<BundleRecord["options"]>) => {
      if (!activeBundle || !workspaceId) return;
      return await updateBundle.handle({
        id: activeBundle.id,
        workspaceId,
        payload: {
          // We merge with current activeBundle state
          options: { ...activeBundle.options, ...newOptions},
          name: activeBundle.name, // Pass the existing name instead of null
        },
      });
    }


  // --- Target File Management ---
  const setPaths = useCallback(
    (files: string[]) => updateActiveOptions({ targetFiles: files }),
    [updateActiveOptions]
  );

  const toggleTarget = useCallback(
    (filePath: string) => {
      const nextFiles = activePaths.includes(filePath)
        ? activePaths.filter((f) => f !== filePath)
        : [...activePaths, filePath];
      
      return updateActiveOptions({ targetFiles: nextFiles });
    },
    [activePaths, updateActiveOptions]
  );

  // --- Rule Management ---
  const addRedaction = useCallback(
    (rule: RedactionRule) => {
      if (!activeBundle) return;
      return updateActiveOptions({
        rules: [...activeBundle.options.rules, rule],
      });
    },
    [activeBundle, updateActiveOptions]
  );

  const removeRule = useCallback(
    (ruleIndex: number) => {
      if (!activeBundle) return;
      const nextRules = activeBundle.options.rules.filter((_, i) => i !== ruleIndex);
      return updateActiveOptions({ rules: nextRules });
    },
    [activeBundle, updateActiveOptions]
  );

  // --- Bundle Lifecycle ---
  const switchBundle = useCallback(
    (bundleId: string) => {
      if (workspaceId) dispatch(setActiveBundleId({ workspaceId, bundleId }));
    },
    [dispatch, workspaceId]
  );

  const createAndSelect = useCallback(
    async (name: string) => {
      if (!workspaceId) return;
      const newBundle = await createBundle.handle({
        workspaceId,
        name,
        options: { rules: [], targetFiles: [] },
      });
      dispatch(setActiveBundleId({ workspaceId, bundleId: newBundle.id }));
      return newBundle;
    },
    [workspaceId, createBundle, dispatch]
  );

  // --- Execution ---
  const generateAndCopyBundle = useCallback(async () => {
    if (!activeBundle || activePaths.length === 0) {
      toast.error("No files in the bundle to generate!");
      return;
    }

    const toastId = toast.loading("Rust is analyzing and bundling...");

    try {
      const bundledFiles = await generateBundle.handle(activeBundle.id);
      
      // Formatting the LLM context
      const fileEntries = Object.entries(bundledFiles);
      const llmContext = [
        `# BUNDLED CONTEXT: ${activeBundle.name}`,
        ...fileEntries.map(([path, content]) => `## File: ${path}\n\`\`\`typescript\n${content}\n\`\`\``)
      ].join("\n\n");

      await navigator.clipboard.writeText(llmContext);
      dispatch(setViewedBundleContent(llmContext));

      toast.success(`Copied ${fileEntries.length} files to clipboard!`, { id: toastId });
      return llmContext;
    } catch (error) {
      toast.dismiss(toastId);
    }
  }, [activeBundle, activePaths, generateBundle, dispatch]);

  return {
    workspaceId,
    activeBundle,
    allBundles,
    activePaths,
    setPaths,
    toggleTarget,
    addRedaction,
    deleteRule: removeRule,
    switchBundle,
    createBundle: createAndSelect,
    removeBundle: (id: string) => deleteBundle.handle({ id, workspaceId: workspaceId! }),
    generateAndCopyBundle,
    isGenerating: generateBundle.isLoading,
    isUpdating: updateBundle.isLoading,
  };
};