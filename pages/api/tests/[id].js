import { dbConnect } from '../../../lib/db';
import Test from '../../../models/Test';
import Response from '../../../models/Response';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    const test = await Test.findById(id).populate('questions');
    if (!test) return res.status(404).json({ error: 'Test not found' });

    if (req.user.role !== 'admin') {
      if (!test.isPublished || !test.isActive)
        return res.status(403).json({ error: 'Test not available' });

      // Check if student already attempted
      const existing = await Response.findOne({ student: req.user.id, test: id });
      if (existing && existing.status !== 'in-progress')
        return res.status(400).json({ error: 'You have already attempted this test' });
    }

    return res.status(200).json({ test });
  }

  if (req.method === 'PUT') {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const test = await Test.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({ test });
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    await Test.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Test deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
