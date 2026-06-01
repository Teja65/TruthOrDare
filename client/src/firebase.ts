import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
export const googleProvider = new GoogleAuthProvider();

export async function createUser(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInUser(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  if (!auth) {
    return;
  }

  return signOut(auth);
}

export async function getJwtToken(): Promise<string | null> {
  if (!auth || !auth.currentUser) {
    return null;
  }

  return auth.currentUser.getIdToken();
}
