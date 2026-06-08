import { useMemo } from 'react';
import { clearStoredAuthToken, getStoredAuthToken } from '../services/authService';
import { signOutUser } from '../utils/firebase';
import { clearAuth, setHasToken } from './authSlice';
import { useAppDispatch, useAppSelector } from './hooks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isLoading, hasToken } = useAppSelector((state) => state.auth);

  const signOut = async () => {
    clearStoredAuthToken();
    dispatch(setHasToken(false));
    dispatch(clearAuth());
    await signOutUser();
  };

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user) || hasToken || Boolean(getStoredAuthToken()),
      signOut,
    }),
    [hasToken, isLoading, user],
  );
}
