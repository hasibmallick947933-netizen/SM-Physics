import { dbConnect } from '../../../lib/db';
import Question from '../../../models/Question';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    return res.status(200).json({ question });
  }

  if (req.method === 'PUT') {
    const question = await Question.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({ question });
  }

  if (req.method === 'DELETE') {
    await Question.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Question deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
