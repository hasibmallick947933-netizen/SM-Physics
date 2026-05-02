import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user });
  }

  if (req.method === 'PUT') {
    const allowed = ['isActive', 'name', 'phone', 'class', 'location'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    return res.status(200).json({ user });
  }

  if (req.method === 'DELETE') {
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: 'User deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
