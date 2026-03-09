import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@app/store";
import { 
  addPublicBundle, 
  updatePublicBundle, 
  removePublicBundle,
  selectPublicBundlesByWorkspace,
  selectPublicBundleById
} from "../public-bundles-slice";
import { setBundle } from "@features/core/workspace/workspace-ui-slice";

const DEFAULT_OPTIONS = {
  targetFiles: [],
  rules: [],
  hideBarrelExports: false,
};

export const usePublicBundleDispatchers = () => {
  const dispatch = useAppDispatch();

  const createBundle = useCallback((workspaceId: string, name: string) => {
    const newBundle = {
      id: crypto.randomUUID(),
      workspaceId,
      name,
      options: { ...DEFAULT_OPTIONS },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addPublicBundle(newBundle));
    return newBundle.id; 
  }, [dispatch]);

  const updateBundle = useCallback((id: string, changes: any) => {
    dispatch(updatePublicBundle({
      id,
      changes: {
        ...changes,
        updatedAt: new Date().toISOString()
      }
    }));
  }, [dispatch]);

  const removeBundle = useCallback((id: string) => {
    dispatch(removePublicBundle(id));
  }, [dispatch]);

  return { createBundle, updateBundle, removeBundle };
};

export const usePublicWorkspaceBundles = (workspaceId: string | null) => {
  const bundles = useAppSelector(state => selectPublicBundlesByWorkspace(state, workspaceId));
  
  const { createBundle } = usePublicBundleDispatchers();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (workspaceId && bundles.length === 0) {
      const newId = createBundle(workspaceId, "Default Context");
      dispatch(setBundle(newId)); 
    }
  }, [workspaceId, bundles.length, createBundle, dispatch]);

  return { bundles, isLoading: false };
};
export const usePublicBundle = (bundleId: string | null) => {
  const bundle = useAppSelector(state => 
    bundleId ? selectPublicBundleById(state, bundleId) : null
  );
  return { bundle, isLoading: false };
};