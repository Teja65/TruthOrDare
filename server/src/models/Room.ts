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

export const Room = mongoose.model('Room', roomSchema);
