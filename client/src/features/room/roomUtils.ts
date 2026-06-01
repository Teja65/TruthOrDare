export function normalizeRoomCode(value: string) {
  return value.trim().toUpperCase();
}

export function isRoomCodeValid(value: string) {
  return /^[A-Z0-9]{4,8}$/.test(normalizeRoomCode(value));
}
