import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    stats: {
      gamesPlayed: {
        type: Number,
        default: 0,
      },
      gamesWon: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

playerSchema.index({ roomCode: 1, createdAt: 1 });

export const Player = mongoose.model('Player', playerSchema);
