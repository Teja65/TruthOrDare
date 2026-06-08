import { getJwtToken } from '../utils/firebase';
import { getStoredAuthToken } from './authService';
import translations from '../en.json';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchWithJwt(input: RequestInfo, init?: RequestInit) {
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
    throw new Error(`${translations.api.requestFailed} ${response.status}`);
  }

  return response.json();
}

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`${translations.api.requestFailed} ${response.status}`);
  }

  return response.json();
}
