export function saveJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write failures in browser privacy mode
  }
}

export function loadJson<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

export function clearJson(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
