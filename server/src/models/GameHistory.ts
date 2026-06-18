import mongoose from 'mongoose';

const gameHistorySchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    roomName: {
      type: String,
      trim: true,
    },
    players: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
        name: String,
        score: Number,
      },
    ],
    winner: {
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
      name: String,
      score: Number,
    },
    turns: {
      type: Number,
      default: 0,
    },
    questionLog: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        type: {
          type: String,
          enum: ['truth', 'dare'],
        },
        text: String,
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
        status: String,
      },
    ],
    endedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

gameHistorySchema.index({ endedAt: -1 });
gameHistorySchema.index({ roomCode: 1, endedAt: -1 });
gameHistorySchema.index({ 'players.playerId': 1 });

export const GameHistory = mongoose.model('GameHistory', gameHistorySchema);
