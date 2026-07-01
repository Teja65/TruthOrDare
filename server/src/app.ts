import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { roomRoutes } from './routes/room.routes';
import { playerRoutes } from './routes/player.routes';
import { gameRoutes } from './routes/game.routes';
import { questionRoutes } from './routes/question.routes';
import { historyRoutes } from './routes/history.routes';
import { statsRoutes } from './routes/stats.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

function normalizeOrigin(origin?: string) {
  return origin?.trim().replace(/\/$/, '');
}

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS?.split(',') ?? []),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://truth-or-dare-eta-five.vercel.app',
  ]
    .map(normalizeOrigin)
    .filter(Boolean),
);

function isAllowedOrigin(origin: string) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  try {
    const url = new URL(normalizedOrigin);
    return (
      allowedOrigins.has(normalizedOrigin) ||
      (url.protocol === 'https:' && url.hostname.endsWith('.vercel.app'))
    );
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error(`CORS blocked origin: ${origin}`);
    (error as Error & { status?: number }).status = 403;
    callback(error);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'TruthOrDare API is running',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

export default app;
