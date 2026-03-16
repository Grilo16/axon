import { useMemo } from "react";
import { useAppSelector } from "@app/store";
import { useIsAuthenticated } from "@shared/hooks/use-auth-mode";
import { selectPrivateGraphPathsSet } from "../workspace-ui-selector";
import { useActiveBundleId } from "./use-workspace-selectors";

// Internal helper to seamlessly switch between public/private graph Sets
const useActiveGraphPathsSet = () => {
  const isAuthenticated = useIsAuthenticated();
  const activeBundleId = useActiveBundleId();

  const privatePathsSet = useAppSelector(selectPrivateGraphPathsSet);

  const publicTargetFiles = useAppSelector((state) => {
    if (!activeBundleId) return undefined;
    return state.publicBundles.entities[activeBundleId]?.options?.targetFiles;
  });

  const publicPathsSet = useMemo(() => {
    return new Set<string>(publicTargetFiles || []);
  }, [publicTargetFiles]);

  return isAuthenticated ? privatePathsSet : publicPathsSet;
};

export const useIsNodeInGraph = (path: string) => {
  const activePathsSet = useActiveGraphPathsSet();
  return activePathsSet.has(path);
};

export const useFolderHasFilesInGraph = (path: string) => {
  const activePathsSet = useActiveGraphPathsSet();

  return useMemo(() => {
    const dirPrefix = path.endsWith('/') ? path : `${path}/`;
    for (const activePath of activePathsSet) {
      if (activePath.startsWith(dirPrefix)) return true;
    }
    return false;
  }, [activePathsSet, path]);
};
