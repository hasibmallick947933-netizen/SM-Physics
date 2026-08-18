import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, default: 'Physics' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, required: true, default: 180 }, // in minutes

    // ── Class targeting ──────────────────────────────────────────────────
    // 'All' = visible to every class. Otherwise only students whose
    // User.class matches this value can see/attempt the test.
    targetClass: {
      type: String,
      enum: ['All', 'Class 11', 'Class 12', 'Dropper', 'Other'],
      default: 'All',
    },

    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 1 },

    // ── Scheduling window ────────────────────────────────────────────────
    // Test is only attemptable between availableFrom and availableUntil.
    // Leave either blank for an open-ended window.
    availableFrom: { type: Date },
    availableUntil: { type: Date },

    // Kept for backward compatibility with any existing data/logic
    scheduledAt: { type: Date },
    expiresAt: { type: Date },

    isPublished: { type: Boolean, default: false }, // visible in listings at all
    isActive: { type: Boolean, default: true },      // admin on/off switch

    allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // empty = all
    instructions: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    settings: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      showResult: { type: Boolean, default: true },
      antiCheatEnabled: { type: Boolean, default: true },
      tabSwitchLimit: { type: Number, default: 3 }, // auto-submit after N switches
      markDeductionOnCheat: { type: Number, default: 4 },
    },
  },
  { timestamps: true }
);

// Auto-compute totalMarks before save
TestSchema.pre('save', async function (next) {
  if (this.isModified('questions')) {
    const Question = mongoose.model('Question');
    const qs = await Question.find({ _id: { $in: this.questions } });
    this.totalMarks = qs.reduce((sum, q) => sum + (q.marksCorrect || 4), 0);
  }
  next();
});

// Virtual: is the test currently within its scheduled window?
TestSchema.methods.isWithinSchedule = function (now = new Date()) {
  if (this.availableFrom && now < this.availableFrom) return false;
  if (this.availableUntil && now > this.availableUntil) return false;
  return true;
};

// Virtual: is the test currently attemptable by students at all?
// (published + active + inside the time window)
TestSchema.methods.isLiveNow = function (now = new Date()) {
  return this.isPublished && this.isActive && this.isWithinSchedule(now);
};

export default mongoose.models.Test || mongoose.model('Test', TestSchema);
