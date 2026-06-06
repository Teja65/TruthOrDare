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
  getStoredAuthToken,
} from '../services/authService';
import translations from '../en.json';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(auth));
  const [hasToken, setHasToken] = useState(Boolean(getStoredAuthToken()));

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const idToken = await u.getIdToken();
          await exchangeIdTokenForJwt(idToken);
          setHasToken(Boolean(getStoredAuthToken()));
        } catch (e) {
          console.warn(translations.auth.exchangeWarning, e);
        }
      } else {
        clearStoredAuthToken();
        setHasToken(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    clearStoredAuthToken();
    setHasToken(false);
    await signOutUser();
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user) || hasToken,
      signOut,
    }),
    [hasToken, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(translations.auth.providerError);
  }
  return context;
}
