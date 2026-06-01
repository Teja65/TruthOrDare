import { getJwtToken } from '../firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchWithJwt(input: RequestInfo, init?: RequestInit) {
  const token = await getJwtToken();
  const headers = new Headers(init?.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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
