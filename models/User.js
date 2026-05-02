import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    class: { type: String, enum: ['Class 11', 'Class 12', 'Dropper', 'Other'] },
    location: { type: String, enum: ['Ranihati', 'Bauria', 'Uluberia', 'Khalisani Kalitala', 'Online', 'Other'] },
    isActive: { type: Boolean, default: true },
    profilePicture: { type: String, default: '' },
    testsAttempted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
