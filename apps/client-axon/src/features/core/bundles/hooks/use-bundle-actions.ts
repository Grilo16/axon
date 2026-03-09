import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@app/store";
import { setBundle } from "@features/core/workspace/workspace-ui-slice";
import { createActionHandler } from "@shared/utils/rtx-actions";

import {
  useCreateBundleMutation,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
  // useCloneBundleMutation,
  type UpdateBundleReq,
} from "../api/bundles-api";
import type { CreateBundleReq } from "@shared/types/axon-core/bundle-api";
import { usePublicBundleDispatchers } from "@features/public/hooks/use-public-bundles-slice";

export const useBundleActions = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  // 🌟 The Sandbox Dispatchers
  const sandboxActions = usePublicBundleDispatchers();
  // Needed in case we want to clone a sandbox bundle
  const publicBundlesState = useAppSelector((state) => state.publicBundles);

  const [createMut, createState] = useCreateBundleMutation();
  const [updateMut, updateState] = useUpdateBundleMutation();
  const [deleteMut, deleteState] = useDeleteBundleMutation();
  // const [cloneMut, cloneState] = useCloneBundleMutation();

  return useMemo(() => {
    // Helper to mock RTK Query state for the synchronous Redux sandbox
    const sandboxState = { isLoading: false, isSuccess: true, isError: false };

    return {
      selectBundle: (id: string) => dispatch(setBundle(id)),

      createBundle: {
        handle: async (payload: CreateBundleReq) => {
          if (isAuthenticated) {
            const action = createActionHandler(createMut, {
              successMessage: "Bundle created!",
            });
            const result = await action(payload);
            dispatch(setBundle(result.id));
            return result;
          } else {
            // 🏖️ Sandbox Mode
            const newId = sandboxActions.createBundle(
              payload.workspaceId,
              payload.name,
            );
            dispatch(setBundle(newId));
            toast.success("Sandbox bundle created!");
            return { id: newId };
          }
        },
        ...(isAuthenticated ? createState : sandboxState),
      },

      updateBundle: {
        handle: async (payload: UpdateBundleReq) => {
          if (isAuthenticated) {
            return createActionHandler(updateMut)(payload);
          } else {
            sandboxActions.updateBundle(payload.id, payload.payload);
            return;
          }
        },
        ...(isAuthenticated ? updateState : sandboxState),
      },

      deleteBundle: {
        handle: async (payload: { id: string; workspaceId: string }) => {
          if (isAuthenticated) {
            return createActionHandler(deleteMut, {
              successMessage: "Bundle deleted.",
            })(payload);
          } else {
            // 🏖️ Sandbox Mode
            sandboxActions.removeBundle(payload.id);
            dispatch(setBundle(null)); // Drop selection
            toast.success("Sandbox bundle deleted.");
            return;
          }
        },
        ...(isAuthenticated ? deleteState : sandboxState),
      },

      // cloneBundle: {
      //   handle: async (payload: {id: string, payload: CloneBundleReq}) => {
      //     if (isAuthenticated) {
      //       return createActionHandler(cloneMut, { successMessage: "Bundle cloned successfully!" })(payload);
      //     } else {
      //       // 🏖️ Sandbox Mode: Quick inline clone!
      //       const existingBundle = publicBundlesState.entities[payload.id];
      //       if (existingBundle) {
      //         const newId = sandboxActions.createBundle(works, `${existingBundle.name} (Clone)`);
      //         sandboxActions.updateBundle(newId, existingBundle.options);
      //         dispatch(setBundle(newId));
      //         toast.success("Sandbox bundle cloned!");
      //       }
      //     }
      //   },
      //   ...(isAuthenticated ? cloneState : sandboxState),
      // },
    };
  }, [
    isAuthenticated,
    sandboxActions,
    publicBundlesState,
    dispatch,
    createMut,
    createState,
    updateMut,
    updateState,
    deleteMut,
    deleteState,
    // cloneMut,
    // cloneState,
  ]);
};
