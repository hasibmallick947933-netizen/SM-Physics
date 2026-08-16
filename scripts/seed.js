/**
 * Seed Script – SM Physics
 * Run: node scripts/seed.js
 * Creates the default admin account defined in .env.local
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await User.create({
      name: 'SM Physics Admin',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
      isActive: true,
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   → Change your password after first login!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
