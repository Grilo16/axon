import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { 
  useListPublicWorkspacesQuery, 
  useGetPublicGraphQuery, 
  useGeneratePublicCodeMutation 
} from "../api/public-api";
import type { RedactionRule, BundleOptions } from "@shared/types/axon-core/bundler";

export const usePublicSandbox = () => {
  // --- 1. Local State (No DB needed!) ---
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [targetFiles, setTargetFiles] = useState<string[]>([]);
  const [rules, setRules] = useState<RedactionRule[]>([]);
  const [hideBarrelExports, setHideBarrelExports] = useState(false);

  // --- 2. Fetch Public Workspaces ---
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useListPublicWorkspacesQuery();

  // Auto-select the first showcase on load
  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  const activeWorkspace = useMemo(
    () => workspaces.find(w => w.id === activeWorkspaceId) || null,
    [workspaces, activeWorkspaceId]
  );

  // --- 3. The Stateless Graph Engine ---
  const options: BundleOptions = useMemo(() => ({ targetFiles, rules }), [targetFiles, rules]);

  // We use RTK Query to POST the options, and it auto-caches based on the payload!
  const { data: graphData, isFetching: isGraphLoading } = useGetPublicGraphQuery(
    { workspaceId: activeWorkspaceId!, options, hideBarrelExports },
    { skip: !activeWorkspaceId }
  );

  const [generateCode, { isLoading: isGenerating }] = useGeneratePublicCodeMutation();

  const toggleTarget = useCallback((filePath: string) => {
    setTargetFiles(prev => prev.includes(filePath) ? prev.filter(f => f !== filePath) : [...prev, filePath]);
  }, []);

  const addRedaction = useCallback((rule: RedactionRule) => {
    setRules(prev => [...prev, rule]);
  }, []);

  const deleteRule = useCallback((ruleIndex: number) => {
    setRules(prev => prev.filter((_, i) => i !== ruleIndex));
  }, []);

  const toggleHideBarrelExports = useCallback(() => {
    setHideBarrelExports(prev => !prev);
  }, []);

  const generateAndCopyBundle = useCallback(async () => {
    if (!activeWorkspaceId || targetFiles.length === 0) return toast.error("No files selected!");
    
    const toastId = toast.loading("Axon Engine is building context...");
    try {
      const bundledFiles = await generateCode({ workspaceId: activeWorkspaceId, options }).unwrap();
      const fileEntries = Object.entries(bundledFiles);
      const llmContext = [`# AXON PUBLIC SANDBOX`, ...fileEntries.map(([path, content]) => `## File: ${path}\n\`\`\`typescript\n${content}\n\`\`\``)].join("\n\n");
      
      await navigator.clipboard.writeText(llmContext);
      toast.success(`Copied ${fileEntries.length} files! Paste into ChatGPT.`, { id: toastId });
    } catch (e) {
      toast.error("Generation failed", { id: toastId });
    }
  }, [activeWorkspaceId, options, generateCode]);

  return {
    // Workspace Data
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    isWorkspacesLoading,
    
    // Engine Data
    graphData,
    isGraphLoading,
    
    // Bundle State
    activePaths: targetFiles,
    setPaths: setTargetFiles,
    rules,
    hideBarrelExports,
    
    // Actions
    toggleTarget,
    addRedaction,
    deleteRule,
    toggleHideBarrelExports,
    generateAndCopyBundle,
    isGenerating,
  };
};