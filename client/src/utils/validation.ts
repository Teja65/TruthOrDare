import { z } from 'zod';
import translations from '../en.json';

export const playerNameSchema = z
  .string()
  .trim()
  .min(1, translations.form.errors.nameRequired)
  .min(2, translations.form.errors.nameMin);

export const roomCodeSchema = z
  .string()
  .trim()
  .min(1, translations.form.errors.roomCodeRequired)
  .min(4, translations.form.errors.roomCodeInvalid);

export const joinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  playerName: playerNameSchema,
});

export const usernameSchema = z
  .string()
  .trim()
  .min(1, translations.form.errors.usernameRequired)
  .min(2, translations.form.errors.usernameMin);

export const loginSchema = z.object({
  email: z.string().trim().email(translations.form.errors.emailInvalid),
  password: z.string().min(6, translations.form.errors.passwordMin),
});

export const signUpSchema = loginSchema.extend({
  username: usernameSchema,
});

export function getFieldError(error: z.ZodError, field: string) {
  return error.issues.find((issue) => issue.path[0] === field)?.message;
}
