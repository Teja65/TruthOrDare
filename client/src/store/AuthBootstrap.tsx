import { ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import {
  authChanged,
  clearAuth,
  setAuthLoading,
  setHasToken,
} from './authSlice';
import { useAppDispatch } from './hooks';
import {
  clearStoredAuthToken,
  exchangeIdTokenForJwt,
  getStoredAuthToken,
} from '../services/authService';
import translations from '../en.json';

type AuthBootstrapProps = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!auth) {
      dispatch(setAuthLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearStoredAuthToken();
        dispatch(clearAuth());
        return;
      }

      try {
        const idToken = await user.getIdToken();
        await exchangeIdTokenForJwt(idToken);
        dispatch(setHasToken(Boolean(getStoredAuthToken())));
      } catch (error) {
        console.warn(translations.auth.exchangeWarning, error);
      } finally {
        dispatch(
          authChanged({
            displayName: user.displayName,
            email: user.email,
            uid: user.uid,
          }),
        );
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return children;
}
