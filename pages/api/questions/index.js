import { dbConnect } from '../../../lib/db';
import Question from '../../../models/Question';
import { requireAuth, requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { topic, subject, difficulty, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({ questions, total, pages: Math.ceil(total / limit) });
  }

  if (req.method === 'POST') {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const question = await Question.create({ ...req.body, createdBy: req.user.id });
    return res.status(201).json({ question });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
