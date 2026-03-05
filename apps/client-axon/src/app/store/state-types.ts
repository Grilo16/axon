import type { WorkspacesState } from '@features/core/workspace/workspace-slice';
import type { BundlesState } from '@features/core/bundles/bundles-slice';
import type { axonApi } from '../api/axon-api';

export interface RootState {
  [axonApi.reducerPath]: ReturnType<typeof axonApi.reducer>;
  workspaces: WorkspacesState;
  bundles: BundlesState;
}