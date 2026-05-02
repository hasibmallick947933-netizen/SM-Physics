import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';
import { signToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await dbConnect();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id, email: user.email, role: user.role, name: user.name });

  res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  }));

  return res.status(200).json({
    message: 'Login successful',
    token,
    user: user.toJSON(),
  });
}
