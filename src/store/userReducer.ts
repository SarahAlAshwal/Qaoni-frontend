import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const initialState: UserState = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export const userSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    updateFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload;
    },
    updateLastName: (state, action: PayloadAction<string>) => {
      state.lastName = action.payload;
    },
    updateEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    updatePassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
  },
});

// Export actions
export const { updateFirstName, updateLastName, updateEmail, updatePassword } =
  userSlice.actions;

// Export reducer
export default userSlice.reducer;
