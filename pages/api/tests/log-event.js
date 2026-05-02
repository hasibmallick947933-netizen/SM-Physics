import { dbConnect } from '../../../lib/db';
import ActivityLog from '../../../models/ActivityLog';
import Response from '../../../models/Response';
import Test from '../../../models/Test';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await dbConnect();

  const { testId, responseId, eventType, description, metadata } = req.body;

  const severityMap = {
    'tab-switch': 'high',
    'window-blur': 'high',
    'window-minimize': 'high',
    'fullscreen-exit': 'medium',
    'copy-attempt': 'medium',
    'paste-attempt': 'medium',
    'right-click': 'low',
    'screen-capture': 'critical',
  };

  const severity = severityMap[eventType] || 'medium';

  // Count previous violations for this response
  const violationCount = await ActivityLog.countDocuments({
    student: req.user.id,
    test: testId,
    eventType: { $in: ['tab-switch', 'window-blur', 'window-minimize'] },
  });

  // Get test settings
  const test = await Test.findById(testId);
  const tabSwitchLimit = test?.settings?.tabSwitchLimit || 3;
  const markDeduction = test?.settings?.markDeductionOnCheat || 4;

  let marksDeducted = 0;
  let autoSubmit = false;

  if (['tab-switch', 'window-blur', 'window-minimize'].includes(eventType)) {
    marksDeducted = markDeduction;

    // Update response to add deduction
    await Response.findByIdAndUpdate(responseId, {
      $inc: { cheatDeduction: markDeduction },
    });

    // Auto-submit if limit exceeded
    if (violationCount + 1 >= tabSwitchLimit) {
      autoSubmit = true;
      await Response.findByIdAndUpdate(responseId, {
        status: 'cheating-detected',
      });
    }
  }

  await ActivityLog.create({
    student: req.user.id,
    test: testId,
    response: responseId,
    eventType,
    severity,
    description,
    marksDeducted,
    metadata: metadata || {},
    ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  return res.status(200).json({
    logged: true,
    marksDeducted,
    autoSubmit,
    violationCount: violationCount + 1,
    warningMessage: autoSubmit
      ? 'Test auto-submitted due to repeated violations'
      : `Warning ${violationCount + 1}/${tabSwitchLimit}: ${markDeduction} marks deducted`,
  });
}

export default requireAuth(handler);
