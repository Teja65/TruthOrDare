import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { admin } from '../config/firebase';
import { upsertUser } from '../services/user.service';

function resolveProvider(signInProvider?: string): 'google' | 'password' {
  return signInProvider === 'google.com' ? 'google' : 'password';
}

export async function login(req: Request, res: Response) {
  const { idToken, username } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Firebase ID token is required.' });
  }

  if (!admin.apps.length) {
    return res.status(500).json({ message: 'Firebase admin is not initialized.' });
  }

  const decoded = await admin.auth().verifyIdToken(idToken);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
  }

  const provider = resolveProvider(decoded.firebase?.sign_in_provider);
  const resolvedUsername =
    username?.trim() ||
    decoded.name?.trim() ||
    decoded.email?.split('@')[0] ||
    'Player';

  const user = await upsertUser({
    uid: decoded.uid,
    email: decoded.email,
    username: resolvedUsername,
    provider,
  });

  const token = jwt.sign(
    {
      uid: decoded.uid,
      email: decoded.email,
      name: user.username,
    },
    secret,
    { expiresIn: '2h' },
  );

  res.json({
    token,
    user: {
      uid: user.uid,
      email: user.email,
      username: user.username,
      provider: user.provider,
    },
  });
}
