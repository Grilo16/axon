import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@app/store";
import { 
  addPublicBundle, 
  updatePublicBundle, 
  removePublicBundle,
  selectPublicBundlesByWorkspace,
  selectPublicBundleById
} from "../public-bundles-slice";

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

// Query wrappers to match the RTK Query style
export const usePublicWorkspaceBundles = (workspaceId: string | null) => {
  const bundles = useAppSelector(state => selectPublicBundlesByWorkspace(state, workspaceId));
  return { bundles, isLoading: false };
};

export const usePublicBundle = (bundleId: string | null) => {
  const bundle = useAppSelector(state => 
    bundleId ? selectPublicBundleById(state, bundleId) : null
  );
  return { bundle, isLoading: false };
};