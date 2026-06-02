import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { auth, signOutUser } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  exchangeIdTokenForJwt,
  clearStoredAuthToken,
} from '../services/authService';

type AuthContextValue = {
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const idToken = await u.getIdToken();
          await exchangeIdTokenForJwt(idToken);
        } catch (e) {
          // ignore exchange errors for now
          console.warn('Failed to exchange id token for backend JWT', e);
        }
      } else {
        clearStoredAuthToken();
      }
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    clearStoredAuthToken();
    await signOutUser();
  };

  const value = useMemo(() => ({ user, signOut }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
