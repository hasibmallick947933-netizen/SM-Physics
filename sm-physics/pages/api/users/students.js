import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    return res.status(200).json({ students });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
