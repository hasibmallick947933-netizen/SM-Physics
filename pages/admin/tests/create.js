import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPlusCircle, HiTrash, HiSearch } from 'react-icons/hi';

export default function CreateTest() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'Physics',
    duration: 180,
    isPublished: false,
    instructions: '',
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showResult: true,
      antiCheatEnabled: true,
      tabSwitchLimit: 3,
      markDeductionOnCheat: 4,
    },
  });

  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qLoading, setQLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchQuestions();
    }
  }, [user, loading]);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get('/api/questions?limit=100', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setAllQuestions(data.questions);
    } catch { toast.error('Failed to load questions'); }
    finally { setQLoading(false); }
  };

  const toggleQuestion = (qId) => {
    setSelectedQIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Test title is required');
    if (selectedQIds.length === 0) return toast.error('Add at least one question');
    setSubmitting(true);
    try {
      await axios.post('/api/tests', { ...form, questions: selectedQIds }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success('Test created successfully!');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create test');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = allQuestions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all";
  const inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };
  const onFocus = (e) => e.target.style.borderColor = 'var(--color-blue)';
  const onBlur = (e) => e.target.style.borderColor = '#E5E7EB';

  return (
    <>
      <Head><title>Create Test – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        {/* Top bar */}
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Create New Test</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Test details */}
              <div className="lg:col-span-2 space-y-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-semibold text-gray-800 mb-5">Test Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Title *</label>
                      <input className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. JEE Mock Test – Electrostatics" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea rows={2} className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Brief description for students..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                        <select className={inputCls} style={inputStyle}
                          value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                          {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                        <input type="number" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                          value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                          min="10" max="300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions (optional)</label>
                      <textarea rows={2} className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                        placeholder="Any special instructions for students..." />
                    </div>
                  </div>
                </motion.div>

                {/* Anti-cheat settings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-semibold text-gray-800 mb-5">🛡️ Anti-Cheat Settings</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'antiCheatEnabled', label: 'Enable Anti-Cheat Monitoring', desc: 'Detect tab switches and window blur' },
                      { key: 'shuffleQuestions', label: 'Shuffle Question Order', desc: 'Randomize question sequence per student' },
                      { key: 'shuffleOptions', label: 'Shuffle MCQ Options', desc: 'Randomize answer choices per student' },
                      { key: 'showResult', label: 'Show Result After Submission', desc: 'Students can see their score immediately' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, settings: { ...f.settings, [key]: !f.settings[key] } }))}
                          className="w-12 h-6 rounded-full transition-all duration-200 relative"
                          style={{ background: form.settings[key] ? 'var(--color-blue)' : '#D1D5DB' }}>
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200"
                            style={{ left: form.settings[key] ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tab Switch Limit</label>
                        <input type="number" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                          value={form.settings.tabSwitchLimit}
                          onChange={(e) => setForm(f => ({ ...f, settings: { ...f.settings, tabSwitchLimit: Number(e.target.value) } }))}
                          min="1" max="10" />
                        <p className="text-xs text-gray-400 mt-1">Auto-submit after N violations</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Marks Deducted Per Violation</label>
                        <input type="number" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                          value={form.settings.markDeductionOnCheat}
                          onChange={(e) => setForm(f => ({ ...f, settings: { ...f.settings, markDeductionOnCheat: Number(e.target.value) } }))}
                          min="0" max="20" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Publish */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <div>
                    <p className="font-medium text-gray-800">Publish Immediately</p>
                    <p className="text-xs text-gray-400">Make the test visible to students right away</p>
                  </div>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                    className="w-12 h-6 rounded-full transition-all duration-200 relative"
                    style={{ background: form.isPublished ? '#059669' : '#D1D5DB' }}>
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200"
                      style={{ left: form.isPublished ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                </motion.div>
              </div>

              {/* Right: Question selector */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="p-6 rounded-2xl flex flex-col" style={{ background: 'white', boxShadow: 'var(--shadow-card)', maxHeight: '80vh', position: 'sticky', top: '20px' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">Select Questions</h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: '#EFF6FF', color: 'var(--color-blue)' }}>
                    {selectedQIds.length} selected
                  </span>
                </div>

                <div className="relative mb-3">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB' }}
                    placeholder="Search questions..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                  {qLoading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading questions...</div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No questions found</p>
                      <Link href="/admin/questions" className="text-xs text-blue-600 mt-1 inline-block">+ Add Questions</Link>
                    </div>
                  ) : (
                    filtered.map((q) => {
                      const sel = selectedQIds.includes(q._id);
                      return (
                        <div key={q._id}
                          onClick={() => toggleQuestion(q._id)}
                          className="p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: sel ? '#EFF6FF' : '#F9FAFB',
                            border: `1.5px solid ${sel ? 'var(--color-blue)' : '#E5E7EB'}`,
                          }}>
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center"
                              style={{ background: sel ? 'var(--color-blue)' : 'white', border: `1.5px solid ${sel ? 'var(--color-blue)' : '#D1D5DB'}` }}>
                              {sel && <span className="text-white text-[10px]">✓</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{q.questionText}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#E5E7EB', color: '#6B7280' }}>
                                  {q.type.toUpperCase()}
                                </span>
                                {q.topic && <span className="text-[10px] text-gray-400">{q.topic}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedQIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    {selectedQIds.length} question{selectedQIds.length > 1 ? 's' : ''} selected ·{' '}
                    ~{selectedQIds.length * 4} marks (est.)
                  </div>
                )}
              </motion.div>
            </div>

            {/* Submit button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-6 flex gap-4">
              <Link href="/admin" className="px-6 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: submitting ? 0.75 : 1 }}>
                {submitting ? 'Creating Test...' : `✓ Create Test${selectedQIds.length > 0 ? ` (${selectedQIds.length} questions)` : ''}`}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </>
  );
}
