import { dbConnect } from '../../../lib/db';
import Test from '../../../models/Test';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Identify the caller (optional — students filtered by class, admin sees all)
    const token = getTokenFromRequest(req);
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let filter = {};

    if (decoded.role !== 'admin') {
      // Students only see published + active tests for their class (or 'All')
      filter = {
        isPublished: true,
        isActive: true,
        $or: [{ targetClass: 'All' }, { targetClass: decoded.class || '__none__' }],
      };
    }

    const tests = await Test.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // For students, also drop tests outside their schedule window
    const now = new Date();
    const visible =
      decoded.role === 'admin'
        ? tests
        : tests.filter((t) => {
            if (t.availableFrom && now < new Date(t.availableFrom)) return false;
            if (t.availableUntil && now > new Date(t.availableUntil)) return false;
            return true;
          });

    return res.status(200).json({ tests: visible });
  }

  if (req.method === 'POST') {
    const token = getTokenFromRequest(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    try {
      const body = req.body;

      if (!body.title) return res.status(400).json({ error: 'Test title is required' });
      if (!body.questions || body.questions.length === 0) {
        return res.status(400).json({ error: 'Select at least one question' });
      }

      const test = await Test.create({
        title: body.title,
        description: body.description || '',
        subject: body.subject || 'Physics',
        duration: body.duration || 180,
        targetClass: body.targetClass || 'All',
        availableFrom: body.availableFrom || undefined,
        availableUntil: body.availableUntil || undefined,
        isPublished: !!body.isPublished,
        isActive: body.isActive !== undefined ? !!body.isActive : true,
        instructions: body.instructions || '',
        questions: body.questions,
        settings: body.settings || {},
        createdBy: decoded.id,
      });

      return res.status(201).json({ test });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to create test' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
