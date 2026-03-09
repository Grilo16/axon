import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StatelessGraphReq } from "@shared/types/axon-core/public-api";

const LOCAL_STORAGE_KEY = "axon_public_bundles";

// Synchronous hydration to prevent UI flicker
const loadLocalBundles = (): Record<string, StatelessGraphReq> => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Failed to parse local bundles", error);
    return {};
  }
};

export interface PublicBundlesState {
  bundles: Record<string, StatelessGraphReq>;
}

const initialState: PublicBundlesState = {
  bundles: loadLocalBundles(),
};

export const publicBundlesSlice = createSlice({
  name: "publicBundles",
  initialState,
  reducers: {
    savePublicBundle: (
      state,
      action: PayloadAction<{ id: string; req: StatelessGraphReq }>
    ) => {
      const { id, req } = action.payload;
      state.bundles[id] = req;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.bundles));
    },
    deletePublicBundle: (state, action: PayloadAction<string>) => {
      delete state.bundles[action.payload];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.bundles));
    },
  },
});

export const { savePublicBundle, deletePublicBundle } = publicBundlesSlice.actions;

export default publicBundlesSlice.reducer;