import { useMemo } from "react";
import { createActionHandler } from "@shared/utils/rtx-actions";
import {
  useGeneratePublicCodeMutation,
  useLazyGetPublicAllFilePathsQuery,
  useLazyGetPublicFilePathsByDirQuery,
  useLazyListPublicDirectoryQuery,
  useLazyReadPublicFileQuery,
} from "../api/public-api";

export const usePublicActions = () => {
  const [generateMut, generateState] = useGeneratePublicCodeMutation();
  const [lazyAllPathsMut, lazyAllPathsState] = useLazyGetPublicAllFilePathsQuery();
  const [lazyPathsByDirMut, lazyPathsByDirState] = useLazyGetPublicFilePathsByDirQuery();
  const [lazyListDirMut, lazyListDirState] = useLazyListPublicDirectoryQuery();
  const [lazyReadFileMut, lazyReadFileState] = useLazyReadPublicFileQuery();

  const generatePublicCode = useMemo(() => ({
    handle: createActionHandler(generateMut, {
      successMessage: "Public code generated successfully!",
      errorMessage: "Failed to generate public code.",
    }),
    ...generateState,
  }), [generateMut, generateState]);

  const readPublicFile = useMemo(() => ({
    handle: createActionHandler(lazyReadFileMut, {
      successMessage: "File read successfully.",
      errorMessage: "Failed to read public file.",
    }),
    ...lazyReadFileState,
  }), [lazyReadFileMut, lazyReadFileState]);

  const listPublicDirectory = useMemo(() => ({
    handle: createActionHandler(lazyListDirMut, {
      errorMessage: "Failed to list public directory.",
    }),
    ...lazyListDirState,
  }), [lazyListDirMut, lazyListDirState]);

  const getPublicPathsByDir = useMemo(() => ({
    handle: createActionHandler(lazyPathsByDirMut, {
      errorMessage: "Failed to fetch directory paths.",
    }),
    ...lazyPathsByDirState,
  }), [lazyPathsByDirMut, lazyPathsByDirState]);

  const getAllPublicPaths = useMemo(() => ({
    handle: createActionHandler(lazyAllPathsMut, {
      errorMessage: "Failed to fetch all paths.",
    }),
    ...lazyAllPathsState,
  }), [lazyAllPathsMut, lazyAllPathsState]);

  return {
    generatePublicCode,
    readPublicFile,
    listPublicDirectory,
    getPublicPathsByDir,
    getAllPublicPaths,
  };
};