import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

const defaultQ = {
  type: 'mcq',
  subject: 'Physics',
  topic: '',
  difficulty: 'medium',
  questionText: '',
  options: [
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ],
  correctOption: 'A',
  numericalAnswer: '',
  numericalTolerance: 0,
  marksCorrect: 4,
  marksIncorrect: -1,
  solution: '',
};

export default function AdminQuestions() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultQ);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchQuestions();
    }
  }, [user, loading]);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get('/api/questions?limit=50', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setQuestions(data.questions);
    } catch { toast.error('Failed to load questions'); }
    finally { setFetching(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.questionText.trim()) return toast.error('Question text is required');
    if (form.type === 'mcq' && !form.options.every(o => o.text.trim()))
      return toast.error('All 4 options are required for MCQ');
    setSaving(true);
    try {
      const payload = {
        ...form,
        numericalAnswer: form.type === 'numerical' ? Number(form.numericalAnswer) : undefined,
        options: form.type === 'mcq' ? form.options : [],
        correctOption: form.type === 'mcq' ? form.correctOption : undefined,
      };
      if (editId) {
        await axios.put(`/api/questions/${editId}`, payload, { headers: { Authorization: `Bearer ${getToken()}` } });
        toast.success('Question updated');
      } else {
        await axios.post('/api/questions', payload, { headers: { Authorization: `Bearer ${getToken()}` } });
        toast.success('Question added!');
      }
      setShowForm(false);
      setForm(defaultQ);
      setEditId(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qId) => {
    if (!confirm('Delete this question?')) return;
    try {
      await axios.delete(`/api/questions/${qId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success('Question deleted');
      setQuestions((prev) => prev.filter(q => q._id !== qId));
    } catch { toast.error('Delete failed'); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all";
  const inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };
  const fo = (e) => e.target.style.borderColor = 'var(--color-blue)';
  const fb = (e) => e.target.style.borderColor = '#E5E7EB';

  const diffColor = { easy: '#059669', medium: '#D97706', hard: '#DC2626' };

  return (
    <>
      <Head><title>Questions – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        {/* Top bar */}
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Question Bank</span>
          <div className="ml-auto">
            <button onClick={() => { setShowForm(true); setForm(defaultQ); setEditId(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1A6FD4' }}>
              <HiPlus /> Add Question
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Question list */}
          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📝</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions yet</h3>
              <p className="text-gray-400 mb-5">Add questions to start building tests</p>
              <button onClick={() => setShowForm(true)}
                className="btn-primary">
                + Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-3">{questions.length} questions in bank</p>
              {questions.map((q, i) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-2xl flex items-start gap-4"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: '#EFF6FF', color: 'var(--color-blue)' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">{q.questionText}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{q.type.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: `${diffColor[q.difficulty]}15`, color: diffColor[q.difficulty] }}>
                        {q.difficulty}
                      </span>
                      {q.topic && <span className="text-xs text-gray-400">{q.topic}</span>}
                      <span className="text-xs text-gray-400">+{q.marksCorrect}/{q.marksIncorrect}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setForm({ ...q, numericalAnswer: q.numericalAnswer ?? '' }); setEditId(q._id); setShowForm(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition">
                      <HiPencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(q._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition">
                      <HiTrash size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit form modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(11,30,61,0.7)', backdropFilter: 'blur(8px)' }}>
              <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6"
                style={{ background: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                    {editId ? 'Edit Question' : 'Add New Question'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select className={inputCls} style={inputStyle}
                        value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="mcq">MCQ</option>
                        <option value="numerical">Numerical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                      <select className={inputCls} style={inputStyle}
                        value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                        {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                      <select className={inputCls} style={inputStyle}
                        value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
                    <input className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                      value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      placeholder="e.g. Electrostatics, Kinematics..." />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Text *</label>
                    <textarea rows={3} className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                      value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                      placeholder="Write the question here..." required />
                  </div>

                  {form.type === 'mcq' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Options *</label>
                      {form.options.map((opt, i) => (
                        <div key={opt.label} className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ background: form.correctOption === opt.label ? '#EFF6FF' : '#F3F4F6', color: form.correctOption === opt.label ? '#1D4ED8' : '#374151' }}>
                            {opt.label}
                          </span>
                          <input className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none" style={inputStyle} onFocus={fo} onBlur={fb}
                            value={opt.text} onChange={(e) => {
                              const opts = [...form.options];
                              opts[i] = { ...opts[i], text: e.target.value };
                              setForm({ ...form, options: opts });
                            }}
                            placeholder={`Option ${opt.label}`} />
                          <button type="button" onClick={() => setForm({ ...form, correctOption: opt.label })}
                            className="px-3 py-2 rounded-xl text-xs font-medium border transition"
                            style={{
                              background: form.correctOption === opt.label ? '#EFF6FF' : 'white',
                              color: form.correctOption === opt.label ? '#1D4ED8' : '#6B7280',
                              borderColor: form.correctOption === opt.label ? '#BFDBFE' : '#E5E7EB',
                            }}>
                            {form.correctOption === opt.label ? '✓ Correct' : 'Mark Correct'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.type === 'numerical' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Correct Answer *</label>
                        <input type="number" className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                          value={form.numericalAnswer} onChange={(e) => setForm({ ...form, numericalAnswer: e.target.value })}
                          placeholder="0" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tolerance (±)</label>
                        <input type="number" className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                          value={form.numericalTolerance} onChange={(e) => setForm({ ...form, numericalTolerance: Number(e.target.value) })}
                          min="0" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marks (Correct)</label>
                      <input type="number" className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                        value={form.marksCorrect} onChange={(e) => setForm({ ...form, marksCorrect: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marks (Incorrect)</label>
                      <input type="number" className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                        value={form.marksIncorrect} onChange={(e) => setForm({ ...form, marksIncorrect: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Solution / Explanation (optional)</label>
                    <textarea rows={2} className={inputCls} style={inputStyle} onFocus={fo} onBlur={fb}
                      value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })}
                      placeholder="Explain how to solve this question..." />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium text-gray-600">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Saving...' : editId ? '✓ Update Question' : '✓ Add Question'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
