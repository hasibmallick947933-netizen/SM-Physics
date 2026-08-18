import { dbConnect } from '../../../lib/db';
import Test from '../../../models/Test';
import Question from '../../../models/Question';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  const token = getTokenFromRequest(req);
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const test = await Test.findById(id).populate('questions').lean();
    if (!test) return res.status(404).json({ error: 'Test not found' });

    if (decoded.role !== 'admin') {
      if (!test.isPublished || !test.isActive) {
        return res.status(403).json({ error: 'This test is not currently available' });
      }
      const now = new Date();
      if (test.availableFrom && now < new Date(test.availableFrom)) {
        return res.status(403).json({ error: 'This test has not started yet' });
      }
      if (test.availableUntil && now > new Date(test.availableUntil)) {
        return res.status(403).json({ error: 'This test has closed' });
      }
      if (test.targetClass !== 'All' && test.targetClass !== decoded.class) {
        return res.status(403).json({ error: 'This test is not available for your class' });
      }
    }

    return res.status(200).json({ test });
  }

  // Admin-only from here down
  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  if (req.method === 'PATCH') {
    try {
      // Used for: editing test details, toggling isActive (on/off),
      // toggling isPublished, changing targetClass, or the schedule window.
      const allowed = [
        'title', 'description', 'subject', 'duration', 'targetClass',
        'availableFrom', 'availableUntil', 'isPublished', 'isActive',
        'instructions', 'questions', 'settings', 'maxAttempts', 'passingMarks',
      ];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const test = await Test.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!test) return res.status(404).json({ error: 'Test not found' });

      return res.status(200).json({ test });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Update failed' });
    }
  }

  if (req.method === 'DELETE') {
    const test = await Test.findByIdAndDelete(id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
