export function randomPick<T>(items: T[]): T | null {
  if (!items.length) {
    return null;
  }
  return items[Math.floor(Math.random() * items.length)];
}
