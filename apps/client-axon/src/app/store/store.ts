import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 

import workspacesReducer from '@features/core/workspace/workspace-slice'; 
import bundlesReducer from '@features/core/bundles/bundles-slice';
import { axonApi } from '../api/axon-api';


const rootReducer = combineReducers({
  [axonApi.reducerPath]: axonApi.reducer,
  bundles: bundlesReducer,
  workspaces: workspacesReducer,
});

const persistConfig = {
  key: 'axon-root',
  version: 1,
  storage,
  whitelist: ['workspaces', 'bundles'] 
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
    }).concat(axonApi.middleware)
});

export const persistor = persistStore(store);

// Export Dispatch from the store, but RootState comes from state.types
export type AppDispatch = typeof store.dispatch;