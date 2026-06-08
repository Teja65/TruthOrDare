import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getStoredAuthToken } from '../services/authService';

type AuthUser = {
  displayName: string | null;
  email: string | null;
  uid: string;
  provider?: 'google' | 'password';
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  hasToken: boolean;
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  hasToken: Boolean(getStoredAuthToken()),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authChanged(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.hasToken = Boolean(getStoredAuthToken());
      state.isLoading = false;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setHasToken(state, action: PayloadAction<boolean>) {
      state.hasToken = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.hasToken = false;
      state.isLoading = false;
    },
  },
});

export const { authChanged, setAuthLoading, setHasToken, clearAuth } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
