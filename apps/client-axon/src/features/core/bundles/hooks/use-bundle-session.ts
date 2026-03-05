import { useCallback, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@app/store";
import { toast } from "sonner";
import {
  selectActiveBundleIdForWorkspace,
  setActiveBundleId,
  selectHideBarrelExports,
  setHideBarrelExports,
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
  const hideBarrelExports = useAppSelector(selectHideBarrelExports); // ✨

  const { createBundle, updateBundle, generateBundle, deleteBundle } = useBundleActions();

  const { 
    data: allBundles = [], 
    isLoading: isBundlesLoading,
    isFetching: isBundlesFetching
  } = useGetWorkspaceBundlesQuery(
    { id: workspaceId!, query: { limit: null, offset: null } },
    { skip: !workspaceId }
  );

  useEffect(() => {
    if (workspaceId && allBundles.length > 0 && !activeBundleId) {
      dispatch(setActiveBundleId({ workspaceId, bundleId: allBundles[0].id }));
    }
  }, [workspaceId, allBundles, activeBundleId, dispatch]);

  const activeBundle = useMemo(
    () => allBundles.find((b) => b.id === activeBundleId) || null,
    [allBundles, activeBundleId]
  );

  const activePaths = useMemo(() => activeBundle?.options.targetFiles || [], [activeBundle]);

  const updateActiveOptions = async (newOptions: Partial<BundleRecord["options"]>) => {
    if (!activeBundle || !workspaceId) return;
    return await updateBundle.handle({
      id: activeBundle.id,
      workspaceId,
      payload: {
        options: { ...activeBundle.options, ...newOptions},
        name: activeBundle.name,
      },
    });
  };

  const renameActiveBundle = useCallback(async (newName: string) => {
    if (!activeBundle || !workspaceId) return;
    return await updateBundle.handle({
      id: activeBundle.id,
      workspaceId,
      payload: {
        options: activeBundle.options,
        name: newName,
      },
    });
  }, [activeBundle, workspaceId, updateBundle]);

  const deleteActiveBundle = useCallback(async () => {
    if (!activeBundle || !workspaceId) return;
    
    const idToDelete = activeBundle.id; 
    const isLastBundle = allBundles.length <= 1;

    try {
      let nextBundleId: string | null = null;

      if (isLastBundle) {
        const fallbackBundle = await createBundle.handle({
          workspaceId,
          name: "Default Bundle",
          options: { rules: [], targetFiles: [] },
        });
        nextBundleId = fallbackBundle.id;
      } else {
        const fallbackBundle = allBundles.find(b => b.id !== idToDelete);
        if (fallbackBundle) {
          nextBundleId = fallbackBundle.id;
        }
      }

      if (nextBundleId) {
        dispatch(setActiveBundleId({ workspaceId, bundleId: nextBundleId }));
      }

      await deleteBundle.handle({ id: idToDelete, workspaceId });
      
    } catch (e) {
      console.error("Failed to delete bundle:", e);
    }
  }, [activeBundle, workspaceId, allBundles, createBundle, deleteBundle, dispatch]);

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

  const addRedaction = useCallback(
    (rule: RedactionRule) => {
      if (!activeBundle) return;
      return updateActiveOptions({ rules: [...activeBundle.options.rules, rule] });
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

  const toggleHideBarrelExports = useCallback(() => {
    dispatch(setHideBarrelExports(!hideBarrelExports));
  }, [dispatch, hideBarrelExports]);

  const generateAndCopyBundle = useCallback(async () => {
    if (!activeBundle || activePaths.length === 0) {
      toast.error("No files in the bundle to generate!");
      return;
    }

    const toastId = toast.loading("Rust is analyzing and bundling...");

    try {
      const bundledFiles = await generateBundle.handle(activeBundle.id);
      
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
    isBundlesLoading,
    isBundlesFetching,
    hideBarrelExports, 
    toggleHideBarrelExports, 
    setPaths,
    toggleTarget,
    addRedaction,
    deleteRule: removeRule,
    switchBundle,
    createBundle: createAndSelect,
    renameActiveBundle,
    deleteActiveBundle,
    generateAndCopyBundle,
    isGenerating: generateBundle.isLoading,
    isUpdating: updateBundle.isLoading,
  };
};