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
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "TruthOrDare API is running",
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
