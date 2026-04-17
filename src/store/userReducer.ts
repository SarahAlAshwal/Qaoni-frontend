import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  id: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "shopOwner" | null; // 👈 user role
  isAuthenticated: boolean;
}

const initialState: UserState = {
id: null,
  email: "",
  firstName: "",
  lastName: "",
  role: null,
  isAuthenticated: false,
}

export const userSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    // Probably will use Auth0
    // login: (
    //   state,
    //   action: PayloadAction<{ id: string; email: string; firstName?: string; lastName?: string; role: "admin" | "shopOwner" }>
    // ) => {
    //   state.id = action.payload.id;
    //   state.email = action.payload.email;
    //   state.firstName = action.payload.firstName || "";
    //   state.lastName = action.payload.lastName || "";
    //   state.role = action.payload.role;
    //   state.isAuthenticated = true;
    // },
   logout: (state) => {
      state.id = null;
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

// Export actions
export const { logout } =
  userSlice.actions;

// Export reducer
export default userSlice.reducer;
