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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        clearStoredAuthToken();
        dispatch(clearAuth());
        return;
      }

      dispatch(
        authChanged({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        }),
      );

      const existingToken = getStoredAuthToken();
      if (existingToken) {
        dispatch(setHasToken(true));
        dispatch(setAuthLoading(false));
        return;
      }

      void user
        .getIdToken()
        .then((idToken) => {
          const pendingUsername = sessionStorage.getItem('tod-pending-username');
          sessionStorage.removeItem('tod-pending-username');
          return exchangeIdTokenForJwt(idToken, {
            username: pendingUsername ?? undefined,
          });
        })
        .then((result) => {
          dispatch(setHasToken(Boolean(getStoredAuthToken())));
          dispatch(
            authChanged({
              displayName: result.user?.username ?? user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              uid: user.uid,
              provider: result.user?.provider,
            }),
          );
        })
        .catch(() => {
          dispatch(setHasToken(false));
        })
        .finally(() => {
          dispatch(setAuthLoading(false));
        });
    });

    return unsubscribe;
  }, [dispatch]);

  return children;
}
