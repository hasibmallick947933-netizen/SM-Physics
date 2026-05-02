import { dbConnect } from '../../../lib/db';
import Response from '../../../models/Response';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();

  const { testId, export: doExport } = req.query;
  if (!testId) return res.status(400).json({ error: 'testId is required' });

  const results = await Response.find({ test: testId })
    .populate('student', 'name email phone class location')
    .populate('test', 'title totalMarks duration')
    .sort({ score: -1 });

  // Assign ranks
  const ranked = results.map((r, i) => ({ ...r.toObject(), rank: i + 1 }));

  if (doExport === 'true') {
    // Return CSV
    const rows = [
      ['Rank', 'Name', 'Email', 'Phone', 'Class', 'Location', 'Score', 'Total', 'Correct', 'Incorrect', 'Unattempted', 'Status', 'Time Used (min)'],
      ...ranked.map((r) => [
        r.rank,
        r.student?.name,
        r.student?.email,
        r.student?.phone,
        r.student?.class,
        r.student?.location,
        r.score,
        r.totalMarks,
        r.correctCount,
        r.incorrectCount,
        r.unattemptedCount,
        r.status,
        Math.floor(r.timeUsed / 60),
      ]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="results-${testId}.csv"`);
    return res.send(csv);
  }

  return res.status(200).json({ results: ranked });
}

export default requireAdmin(handler);
