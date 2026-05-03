import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();

  const { name, email, phone, password, class: cls, location } = req.body;

  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'Name, email, phone and password are required' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'A student with this email already exists' });

  const student = await User.create({
    name, email, phone, password,
    class: cls, location,
    role: 'student',
    isActive: true,
  });

  return res.status(201).json({
    message: 'Student added successfully',
    student: student.toJSON(),
  });
}

export default requireAdmin(handler);
