import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, default: 'Physics' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, required: true, default: 180 }, // in minutes
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 1 },
    scheduledAt: { type: Date },
    expiresAt: { type: Date },
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
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

export default mongoose.models.Test || mongoose.model('Test', TestSchema);
