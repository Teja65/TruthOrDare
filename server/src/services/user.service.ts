import { User } from '../models/User';

export async function upsertUser(data: {
  uid: string;
  email?: string | null;
  username: string;
  provider: 'google' | 'password';
}) {
  return User.findOneAndUpdate(
    { uid: data.uid },
    {
      uid: data.uid,
      email: data.email ?? undefined,
      username: data.username,
      provider: data.provider,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function getUserByUid(uid: string) {
  return User.findOne({ uid });
}
