import { dbConnect } from '../../../lib/db';
import Test from '../../../models/Test';
import { requireAuth, requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Students see published tests; admins see all
    const filter = req.user.role === 'admin' ? {} : { isPublished: true, isActive: true };
    const tests = await Test.find(filter)
      .select('-questions')
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    return res.status(200).json({ tests });
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const test = await Test.create({ ...req.body, createdBy: req.user.id });
    return res.status(201).json({ test });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
