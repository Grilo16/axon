import { useMemo } from "react";
import { useAppDispatch } from "@app/store";
import { setBundle,  } from "@features/core/workspace/workspace-ui-slice";
import { createActionHandler } from "@shared/utils/rtx-actions";
import {
  useCreateBundleMutation,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
  useCloneBundleMutation
} from "../api/bundles-api";
import type { CreateBundleReq } from "@shared/types/axon-core/bundle-api";

export const useBundleActions = () => {
  const dispatch = useAppDispatch();
  
  const [createMut, createState] = useCreateBundleMutation();
  const [updateMut, updateState] = useUpdateBundleMutation();
  const [deleteMut, deleteState] = useDeleteBundleMutation();
  const [cloneMut, cloneState] = useCloneBundleMutation();

  return useMemo(() => ({
    selectBundle: (id: string) => dispatch(setBundle(id)),
    
    createBundle: {
      handle: async (payload: CreateBundleReq) => {
        const action = createActionHandler(createMut, { successMessage: "Bundle created!" });
        const result = await action(payload);
        dispatch(setBundle(result.id)); 
        return result;
      },
      ...createState,
    },

    updateBundle: {
      handle: createActionHandler(updateMut, { successMessage: "Bundle saved successfully!" }),
      ...updateState,
    },

    cloneBundle: {
      handle: createActionHandler(cloneMut, { successMessage: "Bundle cloned successfully!" }),
      ...cloneState,
    },

    deleteBundle: {
      handle: createActionHandler(deleteMut, { successMessage: "Bundle deleted." }),
      ...deleteState,
    },
  }), [
    createMut, createState, 
    updateMut, updateState, 
    deleteMut, deleteState, 
    cloneMut, cloneState, 
    dispatch
  ]);
};