import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { 
  PromptOptions, 
  ScanParams, 
  ScanResponse, 
  GroupRequest 
} from '@axon-types/axonTypes'; // Adjust path if you named the file axonCore.ts

// --- Hook-Specific Argument Wrappers ---
// These are just valid convenience wrappers for the hook's API

interface PromptParams {
  projectRoot: string;
  entryPoint: string;
  depth: number;
  options: PromptOptions;
}

interface CombinedPromptParams {
  projectRoot: string;
  groups: GroupRequest[]; // 👈 Matches the Rust "Vec<GroupRequest>" exactly
  options: PromptOptions;
}

export const useAxonCore = () => {

  // 1. Scanning
  // We use the imported ScanParams directly
  const scanGroup = useCallback(async (params: ScanParams): Promise<ScanResponse> => {
    try {
      const result = await invoke<ScanResponse>('scan_workspace_group', {
        // Explicit mapping ensures frontend naming (useFlattening) 
        // maps to backend naming if they differ, or stays explicit.
        groupId: params.groupId,
        projectRoot: params.projectRoot,
        entryPoint: params.entryPoint,
        depth: params.depth,
        flatten: params.flatten, // ⚠️ Rust command arg is 'flatten'
      });
      console.log(result)
      return result
    } catch (error) {
      console.error(`[AxonCore] Scan Failed for ${params.groupId}:`, error);
      throw error;
    }
  }, []);

  // 2. File System
  const listFiles = useCallback(async (path: string) => {
    // If you created a FileEntry type, use Promise<FileEntry[]> here
    return await invoke<any[]>('list_files', { path });
  }, []);

  const readFile = useCallback(async (path: string) => {
    return await invoke<string>('read_file_content', { path });
  }, []);

  // 3. AI / Prompts
  const generateGroupPrompt = useCallback(async (params: PromptParams) => {
    return await invoke<string>('generate_group_prompt', {
      projectRoot: params.projectRoot,
      entryPoint: params.entryPoint,
      depth: params.depth,
      options: params.options,
    });
  }, []);

  const generateCombinedPrompt = useCallback(async (params: CombinedPromptParams) => {
    return await invoke<string>('generate_combined_prompt', {
      projectRoot: params.projectRoot,
      groups: params.groups, 
      options: params.options,
    });
  }, []);

  return {
    scanGroup,
    listFiles,
    readFile,
    generateGroupPrompt,
    generateCombinedPrompt
  };
};