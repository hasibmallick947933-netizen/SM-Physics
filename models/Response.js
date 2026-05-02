import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
  numericalInput: { type: Number, default: null },
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
  isMarkedForReview: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 }, // seconds
  answeredAt: { type: Date },
});

const ResponseSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'auto-submitted', 'cheating-detected'],
      default: 'in-progress',
    },
    answers: [AnswerSchema],
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeUsed: { type: Number, default: 0 }, // seconds
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unattemptedCount: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
    cheatDeduction: { type: Number, default: 0 }, // total marks deducted for cheating
    rank: { type: Number },
  },
  { timestamps: true }
);

// Compound index: one attempt per student per test (enforced by maxAttempts logic)
ResponseSchema.index({ student: 1, test: 1 });

export default mongoose.models.Response || mongoose.model('Response', ResponseSchema);
