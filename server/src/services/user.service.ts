import { User } from '../models/User';

export async function upsertUser(data: {
  uid: string;
  email?: string | null;
  username: string;
  provider: 'google' | 'password';
}) {
  const hasEmail = Boolean(data.email);
  const query = hasEmail
    ? { $or: [{ uid: data.uid }, { email: data.email }] }
    : { uid: data.uid };
  const update = hasEmail
    ? {
        $set: {
          uid: data.uid,
          email: data.email,
          username: data.username,
          provider: data.provider,
        },
      }
    : {
        $set: {
          uid: data.uid,
          username: data.username,
          provider: data.provider,
        },
        $unset: { email: '' },
      };

  return User.findOneAndUpdate(
    query,
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function getUserByUid(uid: string) {
  return User.findOne({ uid });
}
