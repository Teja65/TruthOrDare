import { AUTH_STORAGE_KEY } from '../utils/constants';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function exchangeIdTokenForJwt(idToken: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error(`Auth exchange failed (${res.status})`);
  }

  const data = await res.json();
  const token = data.token as string | undefined;
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  }
  return token ?? null;
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function clearStoredAuthToken() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
