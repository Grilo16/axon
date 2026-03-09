import { createActionHandler } from "@shared/utils/rtx-actions";
import {
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useLazyGetFilePathsByDirQuery,
  useLazyListDirectoryQuery,
  useLazyGetAllFilePathsQuery,
  useLazyReadFileQuery,
} from "../api/workspace-api";

export const useWorkspaceActions = () => {
  const [createMut, createState] = useCreateWorkspaceMutation();
  const [updateMut, updateState] = useUpdateWorkspaceMutation();
  const [deleteMut, deleteState] = useDeleteWorkspaceMutation();
  const [lazyPathsByDirMut, lazyPathsByDirState] =
    useLazyGetFilePathsByDirQuery();
  const [lazyListDirMut, lazyListDirState] = useLazyListDirectoryQuery();
  const [lazyGetAllPathsMut, lazyGetAllPathsState] =
    useLazyGetAllFilePathsQuery();
  const [LazyReadFileMut, LazyReadFileState] = useLazyReadFileQuery();

  return {
    lazyReadFile: {
      handle: createActionHandler(LazyReadFileMut, {
        successMessage: "Read File success!",
        errorMessage: "Failed to read file.",
      }),
      ...LazyReadFileState,
    },
    lazyGetAllPaths: {
      handle: createActionHandler(lazyGetAllPathsMut, {
        successMessage: "Get paths success!",
        errorMessage: "Failed to get paths.",
      }),
      ...lazyGetAllPathsState,
    },
    lazyListDir: {
      handle: createActionHandler(lazyListDirMut, {
        successMessage: "List Dir success!",
        errorMessage: "Failed to list Dir.",
      }),
      ...lazyListDirState,
    },
    lazyFilePathsByDir: {
      handle: createActionHandler(lazyPathsByDirMut, {
        successMessage: "Paths success!",
        errorMessage: "Failed to get paths.",
      }),
      ...lazyPathsByDirState,
    },
    createWorkspace: {
      handle: createActionHandler(createMut, {
        successMessage: "Workspace created successfully!",
        errorMessage: "Failed to create workspace.",
      }),
      ...createState,
    },
    updateWorkspace: {
      handle: createActionHandler(updateMut, {
        successMessage: "Workspace updated!",
        errorMessage: "Failed to update workspace.",
      }),
      ...updateState,
    },
    deleteWorkspace: {
      handle: createActionHandler(deleteMut, {
        successMessage: "Workspace deleted forever.",
        errorMessage: "Failed to delete workspace.",
      }),
      ...deleteState,
    },
  };
};
