import Head from 'next/head';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  HiX, HiMenu, HiFlag, HiCheckCircle, HiArrowLeft, HiArrowRight,
  HiClock, HiExclamation,
} from 'react-icons/hi';

// ── Question status codes ────────────────────────────────
const STATUS = {
  NOT_VISITED: 'not-visited',
  NOT_ANSWERED: 'not-answered',
  ANSWERED: 'answered',
  MARKED_REVIEW: 'marked-review',
  ANSWERED_MARKED: 'answered-marked',
};

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TestPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading, getToken } = useAuth();

  const [test, setTest] = useState(null);
  const [response, setResponse] = useState(null);
  const [answers, setAnswers] = useState([]);       // { question, selectedOption, numericalInput, isMarkedForReview, status, timeSpent }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [warningMsg, setWarningMsg] = useState('');
  const [warningVisible, setWarningVisible] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const timerRef = useRef(null);
  const questionStartTime = useRef(Date.now());
  const responseRef = useRef(null);

  // ── Fetch test ────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (id && user) fetchTest();
  }, [id, user, loading]);

  const fetchTest = async () => {
    try {
      const { data } = await axios.get(`/api/tests/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTest(data.test);
      initAnswers(data.test.questions);
      setTimeLeft(data.test.duration * 60);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load test');
      router.push('/test');
    } finally {
      setFetchLoading(false);
    }
  };

  const initAnswers = (questions) => {
    setAnswers(questions.map((q) => ({
      question: q._id,
      selectedOption: null,
      numericalInput: null,
      isMarkedForReview: false,
      status: STATUS.NOT_VISITED,
      timeSpent: 0,
    })));
  };

  // ── Start test ────────────────────────────────────────
  const startTest = async () => {
    try {
      const { data } = await axios.post('/api/tests/submit', { testId: id }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setResponse(data.response);
      responseRef.current = data.response;
      setStarted(true);
      // Mark first question as not-answered
      setAnswers((prev) => {
        const copy = [...prev];
        if (copy[0]) copy[0].status = STATUS.NOT_ANSWERED;
        return copy;
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start test');
    }
  };

  // ── Timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  // ── Anti-cheat: visibilitychange ─────────────────────
  useEffect(() => {
    if (!started || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) logViolation('tab-switch', 'Tab switch detected');
    };
    const handleBlur = () => logViolation('window-blur', 'Window lost focus');
    const handleContextMenu = (e) => { e.preventDefault(); logViolation('right-click', 'Right-click attempt'); };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        logViolation('copy-attempt', `Key shortcut: Ctrl+${e.key.toUpperCase()}`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [started, submitted, violations]);

  const logViolation = async (eventType, description) => {
    if (submitted) return;
    try {
      const { data } = await axios.post('/api/tests/log-event', {
        testId: id,
        responseId: responseRef.current?._id,
        eventType,
        description,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });

      setViolations(data.violationCount);
      setWarningMsg(data.warningMessage);
      setWarningVisible(true);
      setTimeout(() => setWarningVisible(false), 4000);

      if (data.autoSubmit) {
        toast.error('Test auto-submitted due to repeated violations!');
        handleSubmit('auto-submitted');
      }
    } catch { /* silent */ }
  };

  // ── Navigate questions ────────────────────────────────
  const goToQuestion = (idx) => {
    // Record time spent on current
    const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx].timeSpent += elapsed;
      if (copy[idx].status === STATUS.NOT_VISITED) {
        copy[idx].status = STATUS.NOT_ANSWERED;
      }
      return copy;
    });
    questionStartTime.current = Date.now();
    setCurrentIdx(idx);
  };

  // ── Answer handlers ───────────────────────────────────
  const selectOption = (option) => {
    setAnswers((prev) => {
      const copy = [...prev];
      const cur = { ...copy[currentIdx] };
      cur.selectedOption = option;
      cur.status = cur.isMarkedForReview ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED;
      copy[currentIdx] = cur;
      return copy;
    });
  };

  const setNumerical = (val) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx] = {
        ...copy[currentIdx],
        numericalInput: val === '' ? null : Number(val),
        status: val === '' ? STATUS.NOT_ANSWERED : (copy[currentIdx].isMarkedForReview ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED),
      };
      return copy;
    });
  };

  const clearResponse = () => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx] = {
        ...copy[currentIdx],
        selectedOption: null,
        numericalInput: null,
        status: copy[currentIdx].isMarkedForReview ? STATUS.MARKED_REVIEW : STATUS.NOT_ANSWERED,
      };
      return copy;
    });
  };

  const markForReview = () => {
    setAnswers((prev) => {
      const copy = [...prev];
      const cur = { ...copy[currentIdx] };
      cur.isMarkedForReview = true;
      const hasAnswer = cur.selectedOption || cur.numericalInput != null;
      cur.status = hasAnswer ? STATUS.ANSWERED_MARKED : STATUS.MARKED_REVIEW;
      copy[currentIdx] = cur;
      return copy;
    });
    if (currentIdx < answers.length - 1) goToQuestion(currentIdx + 1);
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (status = 'completed') => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const finalAnswers = answers.map((a, i) => ({
        ...a,
        timeSpent: a.timeSpent + (i === currentIdx ? elapsed : 0),
      }));

      const { data } = await axios.put('/api/tests/submit', {
        responseId: responseRef.current?._id,
        answers: finalAnswers,
        status,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });

      setResult(data);
      setSubmitted(true);
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Palette status color map ──────────────────────────
  const paletteCls = (status, isCurrent) => {
    const base = 'question-palette-btn';
    const current = isCurrent ? ' q-current' : '';
    const map = {
      [STATUS.NOT_VISITED]: 'q-not-visited',
      [STATUS.NOT_ANSWERED]: 'q-not-answered',
      [STATUS.ANSWERED]: 'q-answered',
      [STATUS.MARKED_REVIEW]: 'q-marked-review',
      [STATUS.ANSWERED_MARKED]: 'q-answered-marked',
    };
    return `${base} ${map[status] || 'q-not-visited'}${current}`;
  };

  // ── Loading ───────────────────────────────────────────
  if (fetchLoading || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream)' }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 animate-pulse"
            style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }} />
          <p className="text-gray-500">Loading test...</p>
        </div>
      </div>
    );
  }

  // ── PRE-TEST SCREEN ───────────────────────────────────
  if (!started) {
    return (
      <>
        <Head><title>{test.title} – SM Physics CBT</title></Head>
        <div className="min-h-screen flex items-center justify-center px-4"
          style={{ background: 'var(--color-cream)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl p-8 rounded-3xl"
            style={{ background: 'white', boxShadow: 'var(--shadow-card-hover)' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0B1E3D, #1A6FD4)' }}>
                <span className="text-3xl">📋</span>
              </div>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                {test.title}
              </h1>
              <p className="text-gray-500 text-sm">{test.subject}</p>
            </div>

            {/* Test info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Questions', value: test.questions?.length || 0, icon: '📝' },
                { label: 'Duration', value: `${test.duration} min`, icon: '⏱️' },
                { label: 'Total Marks', value: test.totalMarks, icon: '🎯' },
              ].map((info) => (
                <div key={info.label} className="text-center p-4 rounded-2xl"
                  style={{ background: 'var(--color-cream)', border: '1px solid rgba(11,30,61,0.06)' }}>
                  <p className="text-2xl mb-1">{info.icon}</p>
                  <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'var(--font-display)' }}>{info.value}</p>
                  <p className="text-xs text-gray-400">{info.label}</p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-2xl mb-6 text-sm space-y-2"
              style={{ background: '#FEF9C3', border: '1px solid #FDE68A' }}>
              <p className="font-semibold text-amber-800">⚠️ Read before starting:</p>
              {[
                'MCQ carries +4 for correct, –1 for wrong. Numerical carries +4, no negative.',
                'Do NOT switch browser tabs or minimize the window.',
                'Each tab switch deducts 4 marks. After 3 violations, the test auto-submits.',
                'Once started, the timer cannot be paused.',
                'Ensure stable internet before beginning.',
              ].map((rule, i) => (
                <p key={i} className="text-amber-700 flex items-start gap-2">
                  <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                  {rule}
                </p>
              ))}
              {test.instructions && (
                <p className="text-amber-700 font-medium mt-2">{test.instructions}</p>
              )}
            </div>

            {/* Palette legend */}
            <div className="flex flex-wrap gap-3 text-xs mb-6 justify-center">
              {[
                { cls: 'q-not-visited', label: 'Not Visited' },
                { cls: 'q-not-answered', label: 'Not Answered' },
                { cls: 'q-answered', label: 'Answered' },
                { cls: 'q-marked-review', label: 'Marked for Review' },
                { cls: 'q-answered-marked', label: 'Answered + Marked' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`question-palette-btn w-6 h-6 text-[10px] ${item.cls}`} style={{ minWidth: 24 }}>1</div>
                  <span className="text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>

            <button onClick={startTest}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', boxShadow: '0 6px 30px rgba(26,111,212,0.4)' }}>
              ▶ Start Test Now
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────────────
  if (submitted && result) {
    const pct = test.totalMarks > 0 ? Math.max(0, (result.score / test.totalMarks) * 100).toFixed(1) : 0;
    return (
      <>
        <Head><title>Result – {test.title}</title></Head>
        <div className="min-h-screen flex items-center justify-center px-4"
          style={{ background: 'var(--color-cream)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-8 rounded-3xl text-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card-hover)' }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-7xl mb-4">
              {pct >= 75 ? '🏆' : pct >= 50 ? '🎯' : '📚'}
            </motion.div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
              Test Submitted!
            </h1>
            <p className="text-gray-500 mb-8">Here&apos;s your performance summary</p>

            {/* Score circle */}
            <div className="w-36 h-36 rounded-full mx-auto mb-8 flex items-center justify-center relative"
              style={{ background: `conic-gradient(var(--color-blue) ${pct * 3.6}deg, #E5E7EB 0deg)` }}>
              <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blue)' }}>
                  {result.score}
                </p>
                <p className="text-xs text-gray-400">of {test.totalMarks}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Correct', value: result.correct, color: '#059669' },
                { label: 'Incorrect', value: result.incorrect, color: '#DC2626' },
                { label: 'Unattempted', value: result.unattempted, color: '#6B7280' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-2xl" style={{ background: 'var(--color-cream)' }}>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {violations > 0 && (
              <div className="mb-4 p-3 rounded-xl text-sm text-red-700"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                ⚠️ {violations} violation(s) detected · Marks deducted accordingly
              </div>
            )}

            <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blue)' }}>
              {pct}%
            </p>
            <p className="text-sm text-gray-400 mb-8">Overall Score Percentage</p>

            <button onClick={() => router.push('/test')}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
              Back to Tests
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // ── MAIN CBT INTERFACE ────────────────────────────────
  const currentQuestion = test.questions[currentIdx];
  const currentAnswer = answers[currentIdx] || {};
  const isLowTime = timeLeft <= 300; // 5 min warning

  // Counts for palette
  const answered = answers.filter(a => a.status === STATUS.ANSWERED || a.status === STATUS.ANSWERED_MARKED).length;
  const marked = answers.filter(a => a.status === STATUS.MARKED_REVIEW || a.status === STATUS.ANSWERED_MARKED).length;
  const notAnswered = answers.filter(a => a.status === STATUS.NOT_ANSWERED).length;
  const notVisited = answers.filter(a => a.status === STATUS.NOT_VISITED).length;

  return (
    <>
      <Head><title>{test.title} – CBT · SM Physics</title></Head>
      <div className="h-screen flex flex-col overflow-hidden select-none"
        style={{ background: '#F8FAFC', fontFamily: 'var(--font-body)' }}>

        {/* ── TOP BAR ── */}
        <div className="h-14 shrink-0 flex items-center justify-between px-4 z-50 shadow-sm"
          style={{ background: 'var(--color-navy)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <span className="text-white text-sm">⚛️</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm truncate max-w-[200px]">{test.title}</p>
              <p className="text-blue-300 text-xs">{user?.name} · Q {currentIdx + 1} of {test.questions.length}</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-lg transition-colors ${
            isLowTime ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white'
          }`}>
            <HiClock size={16} />
            {formatTime(timeLeft)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {violations > 0 && (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                ⚠️ {violations} violation{violations > 1 ? 's' : ''}
              </div>
            )}
            <button onClick={() => setConfirmSubmit(true)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition"
              style={{ background: '#1A6FD4' }}>
              Submit
            </button>
            <button onClick={() => setPanelOpen(!panelOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center md:hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <HiMenu className="text-white" size={18} />
            </button>
          </div>
        </div>

        {/* ── VIOLATION WARNING ── */}
        <AnimatePresence>
          {warningVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="px-4 py-2 text-sm font-medium text-white z-40"
              style={{ background: '#EF4444' }}>
              <HiExclamation className="inline mr-1" />
              {warningMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BODY ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Question Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Question */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--color-blue)' }}>
                    {currentIdx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: currentQuestion.type === 'mcq' ? '#EFF6FF' : '#ECFDF5',
                      color: currentQuestion.type === 'mcq' ? '#1D4ED8' : '#065F46',
                    }}>
                    {currentQuestion.type === 'mcq' ? 'MCQ' : 'Numerical'}
                  </span>
                  <span className="text-xs text-gray-400">
                    +{currentQuestion.marksCorrect} / {currentQuestion.marksIncorrect}
                  </span>
                </div>
                <button onClick={markForReview}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition"
                  style={{
                    background: currentAnswer.isMarkedForReview ? '#EDE9FE' : '#F9FAFB',
                    color: currentAnswer.isMarkedForReview ? '#7C3AED' : '#6B7280',
                    border: '1px solid',
                    borderColor: currentAnswer.isMarkedForReview ? '#DDD6FE' : '#E5E7EB',
                  }}>
                  <HiFlag size={12} />
                  {currentAnswer.isMarkedForReview ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              {/* Question text */}
              <div className="mb-6 p-5 rounded-2xl"
                style={{ background: 'white', border: '1px solid rgba(11,30,61,0.06)', boxShadow: 'var(--shadow-card)' }}>
                <p className="text-gray-900 text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {currentQuestion.questionText}
                </p>
                {currentQuestion.questionImage && (
                  <img src={currentQuestion.questionImage} alt="Question" className="mt-4 max-h-60 rounded-xl object-contain" />
                )}
              </div>

              {/* MCQ Options */}
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((opt) => {
                    const selected = currentAnswer.selectedOption === opt.label;
                    return (
                      <motion.button
                        key={opt.label}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectOption(opt.label)}
                        className="w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200"
                        style={{
                          background: selected ? '#EFF6FF' : 'white',
                          border: `2px solid ${selected ? 'var(--color-blue)' : 'rgba(11,30,61,0.08)'}`,
                          boxShadow: selected ? '0 2px 12px rgba(26,111,212,0.15)' : 'none',
                        }}>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background: selected ? 'var(--color-blue)' : '#F3F4F6',
                            color: selected ? 'white' : '#374151',
                          }}>
                          {opt.label}
                        </span>
                        <div className="flex-1 pt-0.5">
                          <p className="text-gray-800 text-sm leading-relaxed">{opt.text}</p>
                          {opt.image && <img src={opt.image} alt="" className="mt-2 max-h-24 rounded-lg object-contain" />}
                        </div>
                        {selected && <HiCheckCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Numerical Input */}
              {currentQuestion.type === 'numerical' && (
                <div className="p-5 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(11,30,61,0.06)' }}>
                  <p className="text-sm text-gray-500 mb-3">Enter your numerical answer:</p>
                  <input
                    type="number"
                    value={currentAnswer.numericalInput ?? ''}
                    onChange={(e) => setNumerical(e.target.value)}
                    placeholder="Type answer here..."
                    className="w-full px-5 py-4 rounded-xl text-xl font-mono outline-none transition-all"
                    style={{ border: '2px solid rgba(26,111,212,0.2)', fontFamily: 'var(--font-mono)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(26,111,212,0.2)'}
                  />
                  {currentQuestion.numericalTolerance > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Accepted tolerance: ±{currentQuestion.numericalTolerance}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-t"
              style={{ background: 'white', borderColor: 'rgba(11,30,61,0.06)' }}>
              <button onClick={clearResponse}
                className="px-4 py-2 rounded-xl text-sm font-medium transition"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                Clear
              </button>
              <div className="flex-1" />
              <button
                onClick={() => goToQuestion(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40"
                style={{ background: '#F3F4F6', color: '#374151' }}>
                <HiArrowLeft size={15} /> Prev
              </button>
              <button
                onClick={() => {
                  if (currentIdx < test.questions.length - 1) {
                    goToQuestion(currentIdx + 1);
                  } else {
                    setConfirmSubmit(true);
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white transition"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                {currentIdx < test.questions.length - 1 ? (
                  <><span>Next</span> <HiArrowRight size={15} /></>
                ) : (
                  <><HiCheckCircle size={15} /> Submit</>
                )}
              </button>
            </div>
          </div>

          {/* ── Question Palette (desktop sidebar) ── */}
          <div className={`shrink-0 overflow-y-auto md:flex flex-col ${panelOpen ? 'flex' : 'hidden'} md:relative absolute right-0 top-0 bottom-0 z-40`}
            style={{ width: '260px', background: 'white', borderLeft: '1px solid rgba(11,30,61,0.06)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'rgba(11,30,61,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Question Palette</h3>
                <button onClick={() => setPanelOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                  <HiX size={16} />
                </button>
              </div>
              {/* Legend */}
              <div className="space-y-1.5 text-xs text-gray-500">
                {[
                  { cls: 'q-not-visited', label: `Not Visited (${notVisited})` },
                  { cls: 'q-not-answered', label: `Not Answered (${notAnswered})` },
                  { cls: 'q-answered', label: `Answered (${answered})` },
                  { cls: 'q-marked-review', label: `Marked Review (${marked})` },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`question-palette-btn w-5 h-5 text-[8px] ${l.cls}`} style={{ minWidth: 20 }}>1</div>
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="p-4 flex-1">
              <div className="grid grid-cols-5 gap-1.5">
                {answers.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => goToQuestion(i)}
                    className={paletteCls(a.status, i === currentIdx)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t" style={{ borderColor: 'rgba(11,30,61,0.06)' }}>
              <button onClick={() => setConfirmSubmit(true)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            style={{ background: 'rgba(11,30,61,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="w-full max-w-sm p-6 rounded-3xl"
              style={{ background: 'white' }}>
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                  Submit Test?
                </h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                <div className="p-3 rounded-xl" style={{ background: '#ECFDF5' }}>
                  <p className="text-xl font-bold text-green-600">{answered}</p>
                  <p className="text-xs text-gray-400">Answered</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#FEF2F2' }}>
                  <p className="text-xl font-bold text-red-500">{notAnswered}</p>
                  <p className="text-xs text-gray-400">Not Answered</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#F5F3FF' }}>
                  <p className="text-xl font-bold text-purple-600">{marked}</p>
                  <p className="text-xs text-gray-400">Marked</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmSubmit(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-600 border">
                  Cancel
                </button>
                <button onClick={() => { setConfirmSubmit(false); handleSubmit('completed'); }}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                  {submitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
