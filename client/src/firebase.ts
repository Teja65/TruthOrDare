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
import translations from './en.json';

const firebaseConfig = {
  apiKey: 'AIzaSyAt9acDz4XC7AieEjcFgNoCNQBhGhnY8ZY',
  authDomain: 'truthordare-d53f9.firebaseapp.com',
  projectId: 'truthordare-d53f9',
  storageBucket: 'truthordare-d53f9.firebasestorage.app',
  messagingSenderId: '1011331447207',
  appId: '1:1011331447207:web:cfd59837368aa7a5a85e82',
  measurementId: 'G-934S5VSSCM',
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
    throw new Error(translations.auth.firebaseMissing);
  }

  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInUser(email: string, password: string) {
  if (!auth) {
    throw new Error(translations.auth.firebaseMissing);
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error(translations.auth.firebaseMissing);
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
