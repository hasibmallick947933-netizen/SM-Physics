import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';
import Test from '../../../models/Test';
import Response from '../../../models/Response';
import ActivityLog from '../../../models/ActivityLog';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();

  const [totalStudents, totalTests, totalResponses, recentLogs, activeTests] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Test.countDocuments(),
    Response.countDocuments(),
    ActivityLog.find({
      eventType: { $in: ['tab-switch', 'window-blur', 'auto-submitted', 'cheating-detected'] },
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('student', 'name email')
      .populate('test', 'title'),
    Response.find({ status: 'in-progress' })
      .populate('student', 'name email')
      .populate('test', 'title duration')
      .sort({ startedAt: -1 }),
  ]);

  return res.status(200).json({
    stats: { totalStudents, totalTests, totalResponses },
    recentLogs,
    activeTests,
  });
}

export default requireAdmin(handler);
