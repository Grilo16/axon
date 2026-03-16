import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { axonApi } from "../api/axon-api";
import workspaceUiReducer from "@core/workspace/workspace-ui-slice";
import publicBundlesReducer from "@core/public/public-bundles-slice";
import { listenerMiddleware } from "./listener-middleware";

const rootReducer = combineReducers({
  [axonApi.reducerPath]: axonApi.reducer,

  workspaceUi: workspaceUiReducer,
  publicBundles: publicBundlesReducer,
});

const persistConfig = {
  key: "axon-root",
  version: 1,
  storage,
  whitelist: ["workspaceUi", "publicBundles"],
};

// We use "as any" only during the persist wrap because redux-persist
// types can be messy, but the exported 'store' remains strictly typed.
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .prepend(listenerMiddleware.middleware)
    .concat(axonApi.middleware),
});

export const persistor = persistStore(store);

// Export Dispatch from the store, but RootState comes from state.types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
