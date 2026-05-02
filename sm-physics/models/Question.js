import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  label: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  text: { type: String, required: true },
  image: { type: String, default: '' },
});

const QuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['mcq', 'numerical'],
      required: true,
      default: 'mcq',
    },
    subject: {
      type: String,
      enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
      default: 'Physics',
    },
    topic: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },

    // MCQ fields
    options: [OptionSchema],
    correctOption: { type: String, enum: ['A', 'B', 'C', 'D'] },

    // Numerical fields
    numericalAnswer: { type: Number },
    numericalTolerance: { type: Number, default: 0 }, // ±tolerance

    // Marks
    marksCorrect: { type: Number, default: 4 },
    marksIncorrect: { type: Number, default: -1 },

    // Meta
    solution: { type: String },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sourceFile: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
