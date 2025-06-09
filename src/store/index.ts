import { configureStore } from '@reduxjs/toolkit';
import scenariosReducer from './slices/scenariosSlice';
import dialoguesReducer from './slices/dialoguesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    scenarios: scenariosReducer,
    dialogues: dialoguesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;