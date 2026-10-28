import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../../backend/src/types/UserTypes";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginSuccess: (
      state,
      action: {
        payload: {
          user: User;
        };
      },
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.initialized = true;
    },

    initializeAuth: (
      state,
      action: {
        payload: {
          user: User | null;
        };
      },
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.user);
      state.initialized = true;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, initializeAuth, logout } = authSlice.actions;

export default authSlice.reducer;
