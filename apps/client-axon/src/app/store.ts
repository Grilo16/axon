import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER 
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import workspacesReducer from '@features/core/workspace/workspace-slice'; 
import themeReducer from '@features/core/theme/theme-slice';
import bundlesReducer from '@features/core/bundles/bundles-slice';
import logger from 'redux-logger';
import { axonApi } from './api/axon-api';

const isDevelopment = import.meta.env.DEV;
const rootReducer = combineReducers({

  [axonApi.reducerPath]: axonApi.reducer,
  bundles: bundlesReducer,
  workspaces: workspacesReducer,
  theme: themeReducer,
});

const persistConfig = {
  key: 'axon-root',
  version: 1,
  storage,
  whitelist: ['workspaces', 'theme', 'bundles'] 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      axonApi.middleware
    )
    if (isDevelopment) {
      middleware.push(logger);
    }

    return middleware
  }
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;