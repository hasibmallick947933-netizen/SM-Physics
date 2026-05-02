import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';
import { signToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await dbConnect();

  const { name, email, password, phone, class: cls, location } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const user = await User.create({ name, email, password, phone, class: cls, location, role: 'student' });

  const token = signToken({ id: user._id, email: user.email, role: user.role, name: user.name });

  res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  }));

  return res.status(201).json({
    message: 'Registration successful',
    token,
    user: user.toJSON(),
  });
}
