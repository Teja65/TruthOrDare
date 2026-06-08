import { AUTH_STORAGE_KEY } from '../utils/constants';
import translations from '../en.json';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

type ExchangeOptions = {
  username?: string;
};

export async function exchangeIdTokenForJwt(
  idToken: string,
  options?: ExchangeOptions,
) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      username: options?.username,
    }),
  });

  if (!res.ok) {
    throw new Error(`${translations.auth.exchangeError} (${res.status})`);
  }

  const data = await res.json();
  const token = data.token as string | undefined;
  if (token) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, token);
  }
  return { token: token ?? null, user: data.user };
}

export function getStoredAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_STORAGE_KEY);
}

export function clearStoredAuthToken() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
