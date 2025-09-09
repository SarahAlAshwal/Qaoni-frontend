import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./userReducer";

export const store = configureStore({
  reducer: {
    userInfo: userSlice.reducer,
  },
});

// Infer RootState & AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
