import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    ownerUid: {
      type: String,
      index: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended'],
      default: 'waiting',
    },
    questionCursors: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    gameState: {
      currentPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
      currentTurn: {
        type: Number,
        default: 0,
      },
      currentCategory: {
        type: String,
        enum: ['Normal', 'Funny', 'Friends', 'Couples', 'Spicy'],
        default: 'Normal',
      },
      currentQuestion: {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        type: {
          type: String,
          enum: ['truth', 'dare'],
        },
        text: String,
      },
      scores: [
        {
          player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
          },
          score: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

roomSchema.index({ updatedAt: -1 });
roomSchema.index({ ownerUid: 1, updatedAt: -1 });
roomSchema.index({ status: 1, updatedAt: -1 });

export const Room = mongoose.model('Room', roomSchema);
