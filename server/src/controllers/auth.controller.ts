import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { admin } from '../config/firebase';

export async function login(req: Request, res: Response) {
  const { idToken } = req.body;
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

  const token = jwt.sign(
    {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
    },
    secret,
    { expiresIn: '2h' },
  );

  res.json({ token, user: { uid: decoded.uid, email: decoded.email, name: decoded.name } });
}
