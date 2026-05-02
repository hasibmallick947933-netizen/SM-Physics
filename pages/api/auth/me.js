import { serialize } from 'cookie';
import { requireAuth } from '../../../lib/auth';
import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';

async function meHandler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.status(200).json({ user });
}

export default requireAuth(meHandler);
