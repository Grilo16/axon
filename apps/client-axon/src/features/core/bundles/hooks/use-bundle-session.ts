import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { 
  selectActiveBundle, 
  selectActiveGraphPaths, 
  setTargetFiles,
  toggleTargetFile,
  addRule,
  removeRule,
  createNewBundle,
  setActiveBundle,
  selectBundlesForActiveWorkspace
} from '../bundles-slice';
import type { RedactionRule } from '@shared/types/axon-core/bundler';
import type { RootState } from '@app/store';
import { useGenerateBundleMutation } from '@features/core/workspace/api/workspace-api';
import { toast } from 'sonner';
import { setViewedBundleContent } from '@features/core/workspace/workspace-slice';

/**
 * Context Bundle Manager
 * * The undisputed Boss of the Graph. Manages which files are currently 
 * on the screen, and what Redaction Rules apply to them for the LLM.
 */
export const useBundleSession = () => {
  const dispatch = useAppDispatch();
  const workspaceId = useAppSelector((state: RootState) => state.workspaces.activeId);
  
  const activeBundle = useAppSelector(selectActiveBundle);
  const activePaths = useAppSelector(selectActiveGraphPaths);
  const allBundles = useAppSelector(selectBundlesForActiveWorkspace);

  const [triggerGenerate, { isLoading: isGenerating }] = useGenerateBundleMutation();

  // ==========================================
  // GRAPH POPULATION (Target Files)
  // ==========================================
  
  const setPaths = useCallback((files: string[]) => {
    if (activeBundle) dispatch(setTargetFiles({ bundleId: activeBundle.id, files }));
  }, [dispatch, activeBundle]);

  const toggleTarget = useCallback((filePath: string) => {
    if (activeBundle) dispatch(toggleTargetFile({ bundleId: activeBundle.id, filePath }));
  }, [dispatch, activeBundle]);

  // ==========================================
  // LLM REDACTION RULES
  // ==========================================

  const addRedaction = useCallback((rule: RedactionRule) => {
    if (activeBundle) dispatch(addRule({ bundleId: activeBundle.id, rule }));
  }, [dispatch, activeBundle]);

  const deleteRule = useCallback((ruleIndex: number) => {
    if (activeBundle) dispatch(removeRule({ bundleId: activeBundle.id, ruleIndex }));
  }, [dispatch, activeBundle]);

  // ==========================================
  // BUNDLE LIFECYCLE
  // ==========================================

  const switchBundle = useCallback((bundleId: string) => {
    if (workspaceId) dispatch(setActiveBundle({ workspaceId, bundleId }));
  }, [dispatch, workspaceId]);

  const createBundle = useCallback((name: string) => {
    if (workspaceId) dispatch(createNewBundle({ workspaceId, name }));
  }, [dispatch, workspaceId]);

  // ==========================================
  // 🚀 THE LLM BUNDLER EXECUTION
  // ==========================================

  const generateAndCopyBundle = useCallback(async () => {
    if (!activeBundle || activeBundle.options.targetFiles.length === 0) {
      toast.error("No files in the bundle to generate!");
      return;
    }

    const toastId = toast.loading("Bundling AST in Rust..."); 

    try {
      const bundledFiles = await triggerGenerate(activeBundle.options).unwrap();
      
      let llmContext = `# BUNDLED CONTEXT: ${activeBundle.name}\n\n`;
      Object.entries(bundledFiles).forEach(([filePath, fileContent]) => {
        llmContext += `## File: ${filePath}\n\`\`\`typescript\n${fileContent}\n\`\`\`\n\n`; 
      });

      await navigator.clipboard.writeText(llmContext);
      
      // ✨ OPEN IT IN THE VIEWER!
      dispatch(setViewedBundleContent(llmContext));

      toast.success(`Copied to clipboard!`, {
        id: toastId,
        description: `Bundled ${Object.keys(bundledFiles).length} files.`
      });
      
      return llmContext;
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate bundle.", { id: toastId });
    }
  }, [activeBundle, triggerGenerate, dispatch]);
  return {
    workspaceId,
    activeBundle,
    allBundles,
    activePaths, // The definitive source of truth for GraphCanvas rendering!
    setPaths,
    toggleTarget,
    addRedaction,
    deleteRule,
    switchBundle,
    createBundle,

    generateAndCopyBundle,
    isGenerating
  };
};