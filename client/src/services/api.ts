import { getJwtToken } from '../firebase';
import { getStoredAuthToken } from './authService';
import { AUTH_STORAGE_KEY } from '../utils/constants';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchWithJwt(input: RequestInfo, init?: RequestInit) {
  // Prefer backend-issued JWT stored in localStorage
  const stored = getStoredAuthToken();
  const idTokenFallback = await getJwtToken();
  const tokenToUse = stored ?? idTokenFallback;

  const headers = new Headers(init?.headers ?? {});
  if (tokenToUse) {
    headers.set('Authorization', `Bearer ${tokenToUse}`);
  }

  const response = await fetch(
    `${API_BASE}${typeof input === 'string' ? input : input.url}`,
    {
      ...init,
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}
