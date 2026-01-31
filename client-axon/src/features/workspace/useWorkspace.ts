import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  selectActiveRoot,
  selectActiveGroups,
  selectActiveWorkspace,
  addActiveGroup,
  updateActiveGroup,
  updateGlobalOptions,
  type WorkspaceData,
} from "./workspacesSlice";
import { type AxonGroup } from "@axon-types/workspaceTypes";

export const useWorkspace = () => {
  const dispatch = useAppDispatch();

  const projectRoot = useAppSelector(selectActiveRoot);
  const groups = useAppSelector(selectActiveGroups);
  const fullConfig = useAppSelector(selectActiveWorkspace);

  // 2. Actions (Targeting the active workspace)
  const createGroup = useCallback(
    (group: AxonGroup) => {
      dispatch(addActiveGroup(group));
    },
    [dispatch],
  );

  const modifyGroup = useCallback(
    (id: string, changes: Partial<AxonGroup>) => {
      dispatch(updateActiveGroup({ id, changes }));
    },
    [dispatch],
  );

  const setOptions = useCallback(
    (options: Partial<WorkspaceData["globalOptions"]>) => {
      dispatch(updateGlobalOptions(options));
    },
    [dispatch],
  );

  // If you need direct access to the ID
  const workspaceId = fullConfig?.id;

  return {
    isActive: !!projectRoot,
    workspaceId,
    projectRoot,
    groups,
    config: fullConfig?.globalOptions,

    createGroup,
    modifyGroup,
    setOptions,
  };
};
