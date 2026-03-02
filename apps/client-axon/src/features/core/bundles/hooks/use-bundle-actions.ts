import { useMemo } from "react";
import { createActionHandler } from "@shared/utils/rtx-actions";
import { 
  useCloneBundleMutation, 
  useCreateBundleMutation, 
  useDeleteBundleMutation, 
  useGenerateBundleMutation, 
  useUpdateBundleMutation 
} from "../api/bundles-api";

export const useBundleActions = () => {
  const [updateMut, updateState] = useUpdateBundleMutation();
  const [createMut, createState] = useCreateBundleMutation();
  const [deleteMut, deleteState] = useDeleteBundleMutation();
  const [generateMut, generateState] = useGenerateBundleMutation();
  const [cloneMut, cloneState] = useCloneBundleMutation();

  const cloneBundle = useMemo(() => ({
    handle: createActionHandler(cloneMut, { 
      successMessage: "Bundle Cloned successfully",
      errorMessage: "Failed to clone bundle."
    }),
    ...cloneState,
  }), [cloneMut, cloneState]);

  const generateBundle = useMemo(() => ({
    handle: createActionHandler(generateMut, { 
      successMessage: "Bundle generated successfully",
      errorMessage: "Failed to generate bundle."
    }),
    ...generateState,
  }), [generateMut, generateState]);

  const updateBundle = useMemo(() => ({
    handle: createActionHandler(updateMut, { 
      successMessage: "Bundle saved successfully!",
      errorMessage: "Failed to save bundle."
    }),
    ...updateState,
  }), [updateMut, updateState]);

  const createBundle = useMemo(() => ({
    handle: createActionHandler(createMut, { 
      successMessage: "Bundle created!" 
    }),
    ...createState,
  }), [createMut, createState]);

  const deleteBundle = useMemo(() => ({
    handle: createActionHandler(deleteMut, { 
      successMessage: "Bundle deleted!" 
    }),
    ...deleteState,
  }), [deleteMut, deleteState]);

  return {
    createBundle,
    updateBundle,
    deleteBundle,
    cloneBundle,
    generateBundle,
  };
};