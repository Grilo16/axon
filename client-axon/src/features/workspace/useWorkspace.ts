import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  selectActiveRoot,
  selectActiveScanConfig,
  selectActiveWorkspace,
  updateScanConfig,
  updateGlobalOptions,
  type WorkspaceData,
} from "./workspacesSlice";
import type { ScanConfig } from "@axon-types/workspaceTypes";

export const useWorkspace = () => {
  const dispatch = useAppDispatch();

  const projectRoot = useAppSelector(selectActiveRoot);
  const scanConfig = useAppSelector(selectActiveScanConfig);
  const fullConfig = useAppSelector(selectActiveWorkspace);

  const setScan = useCallback(
    (patch: Partial<ScanConfig>) => {
      dispatch(updateScanConfig(patch));
    },
    [dispatch],
  );

  const setOptions = useCallback(
    (options: Partial<WorkspaceData["globalOptions"]>) => {
      dispatch(updateGlobalOptions(options));
    },
    [dispatch],
  );

  const workspaceId = fullConfig?.id;

  return {
    isActive: !!projectRoot,
    workspaceId,
    projectRoot,

    scanConfig,

    config: fullConfig?.globalOptions,

    setScan,
    setOptions,
  };
};
