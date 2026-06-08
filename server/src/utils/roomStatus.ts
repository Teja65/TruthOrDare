export type DisplayRoomStatus = 'running' | 'ended';

export function toDisplayStatus(
  status: 'waiting' | 'active' | 'ended',
): DisplayRoomStatus {
  return status === 'ended' ? 'ended' : 'running';
}
