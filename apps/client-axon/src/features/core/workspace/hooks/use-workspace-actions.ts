import { createActionHandler } from "@shared/utils/rtx-actions";
import {
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useLoadGithubAstMutation,
  useLoadLocalAstMutation,
  useTouchWorkspaceMutation,
  useLazyGetFilePathsByDirQuery,
  useLazyListDirectoryQuery,
  useLazyGetAllFilePathsQuery,
  useLazyReadFileQuery,
} from "../api/workspace-api";

export const useWorkspaceActions = () => {
  // 1. Unconditionally call all hooks at the top level
  const [createMut, createState] = useCreateWorkspaceMutation();
  const [touchMut, touchState] = useTouchWorkspaceMutation();
  const [updateMut, updateState] = useUpdateWorkspaceMutation();
  const [deleteMut, deleteState] = useDeleteWorkspaceMutation();
  const [loadGithubMut, loadGithubState] = useLoadGithubAstMutation();
  const [loadLocalMut, loadLocalState] = useLoadLocalAstMutation();
  const [lazyPathsByDirMut, lazyPathsByDirState] = useLazyGetFilePathsByDirQuery();
  const [lazyListDirMut, lazyListDirState] = useLazyListDirectoryQuery();
  const [lazyGetAllPathsMut, lazyGetAllPathsState] = useLazyGetAllFilePathsQuery();
  const [LazyReadFileMut, LazyReadFileState] = useLazyReadFileQuery()

    const lazyReadFile = {
    handle: createActionHandler(LazyReadFileMut, {
      successMessage: "List Dir success!",
      errorMessage: "Failed to list Dir.",
    }),
    ...LazyReadFileState,
  };
  const lazyGetAllPaths = {
    handle: createActionHandler(lazyGetAllPathsMut, {
      successMessage: "List Dir success!",
      errorMessage: "Failed to list Dir.",
    }),
    ...lazyGetAllPathsState,
  };
  const lazyListDir = {
    handle: createActionHandler(lazyListDirMut, {
      successMessage: "List Dir success!",
      errorMessage: "Failed to list Dir.",
    }),
    ...lazyListDirState,
  };
  const lazyFilePathsByDir = {
    handle: createActionHandler(lazyPathsByDirMut, {
      successMessage: "Workspace touch successfully!",
      errorMessage: "Failed to touch workspace.",
    }),
    ...lazyPathsByDirState,
  };
  const touchWorkspace = {
    handle: createActionHandler(touchMut, {
      successMessage: "Workspace touch successfully!",
      errorMessage: "Failed to touch workspace.",
    }),
    ...touchState,
  };
  const createWorkspace = {
    handle: createActionHandler(createMut, {
      successMessage: "Workspace created successfully!",
      errorMessage: "Failed to create workspace.",
    }),
    ...createState,
  };
  const updateWorkspace = {
    handle: createActionHandler(updateMut, {
      successMessage: "Workspace updated!",
      errorMessage: "Failed to update workspace.",
    }),
    ...updateState,
  };
  const deleteWorkspace = {
    handle: createActionHandler(deleteMut, {
      successMessage: "Workspace deleted forever.",
      errorMessage: "Failed to delete workspace.",
    }),
    ...deleteState,
  };
  const loadGithubAst = {
    handle: createActionHandler(loadGithubMut, {
      successMessage: "GitHub repository cloned and analyzed!",
      errorMessage: "Failed to load GitHub repository.",
    }),
    ...loadGithubState,
  };
  const loadLocalAst = {
    handle: createActionHandler(loadLocalMut, {
      successMessage: "Local workspace analyzed!",
      errorMessage: "Failed to read local directory.",
    }),
    ...loadLocalState,
  };

  return {
    lazyReadFile,
    lazyGetAllPaths,
    lazyListDir,
    lazyFilePathsByDir,
    touchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    loadGithubAst,
    loadLocalAst,
  };
};
