import { dbConnect } from '../../../lib/db';
import Test from '../../../models/Test';
import Question from '../../../models/Question';
import Response from '../../../models/Response';
import ActivityLog from '../../../models/ActivityLog';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    // Start a test session
    const { testId } = req.body;
    const test = await Test.findById(testId);
    if (!test || !test.isPublished) return res.status(404).json({ error: 'Test not found' });

    const existing = await Response.findOne({ student: req.user.id, test: testId });
    if (existing) {
      if (existing.status === 'in-progress') return res.status(200).json({ response: existing });
      return res.status(400).json({ error: 'Already attempted' });
    }

    const response = await Response.create({
      student: req.user.id,
      test: testId,
      status: 'in-progress',
      totalMarks: test.totalMarks,
      answers: test.questions.map((q) => ({ question: q })),
    });

    await ActivityLog.create({
      student: req.user.id,
      test: testId,
      response: response._id,
      eventType: 'test-started',
      severity: 'low',
      description: 'Student started the test',
    });

    return res.status(201).json({ response });
  }

  if (req.method === 'PUT') {
    // Submit test
    const { responseId, answers, status = 'completed' } = req.body;

    const response = await Response.findById(responseId);
    if (!response) return res.status(404).json({ error: 'Session not found' });
    if (response.student.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    const test = await Test.findById(response.test).populate('questions');
    const questions = test.questions;

    let score = 0, correct = 0, incorrect = 0, unattempted = 0;
    const processedAnswers = [];

    for (const q of questions) {
      const studentAnswer = answers?.find((a) => a.question === q._id.toString());
      let isCorrect = false, marksAwarded = 0;

      if (!studentAnswer || (!studentAnswer.selectedOption && studentAnswer.numericalInput == null)) {
        unattempted++;
      } else if (q.type === 'mcq') {
        isCorrect = studentAnswer.selectedOption === q.correctOption;
        marksAwarded = isCorrect ? q.marksCorrect : q.marksIncorrect;
        isCorrect ? correct++ : incorrect++;
      } else if (q.type === 'numerical') {
        const diff = Math.abs(studentAnswer.numericalInput - q.numericalAnswer);
        isCorrect = diff <= (q.numericalTolerance || 0);
        marksAwarded = isCorrect ? q.marksCorrect : q.marksIncorrect;
        isCorrect ? correct++ : incorrect++;
      }

      score += marksAwarded;
      processedAnswers.push({
        question: q._id,
        selectedOption: studentAnswer?.selectedOption || null,
        numericalInput: studentAnswer?.numericalInput ?? null,
        isCorrect,
        marksAwarded,
        isMarkedForReview: studentAnswer?.isMarkedForReview || false,
        timeSpent: studentAnswer?.timeSpent || 0,
        answeredAt: new Date(),
      });
    }

    // Apply cheat deductions
    score -= response.cheatDeduction || 0;

    const timeUsed = Math.floor((Date.now() - response.startedAt.getTime()) / 1000);

    await Response.findByIdAndUpdate(responseId, {
      answers: processedAnswers,
      status,
      submittedAt: new Date(),
      score,
      correctCount: correct,
      incorrectCount: incorrect,
      unattemptedCount: unattempted,
      timeUsed,
    });

    if (status === 'auto-submitted') {
      await ActivityLog.create({
        student: req.user.id,
        test: response.test,
        response: responseId,
        eventType: 'auto-submitted',
        severity: 'high',
        description: 'Test was auto-submitted due to suspicious activity',
      });
    }

    return res.status(200).json({ message: 'Test submitted', score, correct, incorrect, unattempted });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
