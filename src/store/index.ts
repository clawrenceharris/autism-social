import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./slices/uiSlice";
import { userReducer, dialoguesReducer, scenariosReducer } from "./slices";

export const store = configureStore({
  reducer: {
    scenarios: scenariosReducer,
    dialogues: dialoguesReducer,
    user: userReducer,

    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
