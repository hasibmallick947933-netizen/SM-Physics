import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSearch, HiPlus, HiTrash } from 'react-icons/hi';

const defaultQ = {
  type: 'mcq', subject: 'Physics', topic: '', difficulty: 'medium',
  questionText: '',
  options: [
    { label: 'A', text: '' }, { label: 'B', text: '' },
    { label: 'C', text: '' }, { label: 'D', text: '' }
  ],
  correctOption: 'A', numericalAnswer: '', numericalTolerance: 0,
  marksCorrect: 4, marksIncorrect: -1, solution: '',
};

const inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };
const fo = (e) => (e.target.style.borderColor = '#1A6FD4');
const fb = (e) => (e.target.style.borderColor = '#E5E7EB');

export default function CreateTest() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', description: '', subject: 'Physics', duration: 180,
    isPublished: false, instructions: '',
    settings: {
      shuffleQuestions: false, shuffleOptions: false,
      showResult: true, antiCheatEnabled: true,
      tabSwitchLimit: 3, markDeductionOnCheat: 4,
    },
  });

  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qLoading, setQLoading] = useState(true);
  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState(defaultQ);
  const [savingQ, setSavingQ] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchQuestions();
    }
  }, [user, loading]);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get('/api/questions?limit=200', {
        headers: { Authorization: 'Bearer ' + getToken() },
      });
      setAllQuestions(data.questions);
    } catch (e) {
      toast.error('Failed to load questions');
    } finally {
      setQLoading(false);
    }
  };

  const toggleQuestion = (qId) => {
    setSelectedQIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSaveNewQ = async (e) => {
    e.preventDefault();
    if (!newQ.questionText.trim()) return toast.error('Question text required');
    if (newQ.type === 'mcq' && !newQ.options.every((o) => o.text.trim()))
      return toast.error('All 4 options required');
    setSavingQ(true);
    try {
      const payload = {
        ...newQ,
        numericalAnswer: newQ.type === 'numerical' ? Number(newQ.numericalAnswer) : undefined,
        options: newQ.type === 'mcq' ? newQ.options : [],
        correctOption: newQ.type === 'mcq' ? newQ.correctOption : undefined,
      };
      const { data } = await axios.post('/api/questions', payload, {
        headers: { Authorization: 'Bearer ' + getToken() },
      });
      setAllQuestions((prev) => [data.question, ...prev]);
      setSelectedQIds((prev) => [...prev, data.question._id]);
      setNewQ(defaultQ);
      setShowAddQ(false);
      toast.success('Question added and selected!');
    } catch (err) {
      toast.error(err.response && err.response.data ? err.response.data.error : 'Failed');
    } finally {
      setSavingQ(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Test title is required');
    if (selectedQIds.length === 0) return toast.error('Select at least one question');
    setSubmitting(true);
    try {
      await axios.post('/api/tests', { ...form, questions: selectedQIds }, {
        headers: { Authorization: 'Bearer ' + getToken() },
      });
      toast.success('Test created!');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response && err.response.data ? err.response.data.error : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSetting = (key) =>
    setForm((f) => ({ ...f, settings: { ...f.settings, [key]: !f.settings[key] } }));

  const filtered = allQuestions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <Head><title>Create Test - Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>

        {/* Top bar */}
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: '#0B1E3D' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold">Create New Test</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Left column */}
              <div className="lg:col-span-2 space-y-5">

                {/* Test info */}
                <div className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}>
                  <h2 className="font-semibold text-gray-800 mb-5">Test Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Title *</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={inputStyle} onFocus={fo} onBlur={fb}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. JEE Mock Test - Electrostatics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={inputStyle} onFocus={fo} onBlur={fb}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Brief description for students..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                          style={inputStyle}
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        >
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Mathematics</option>
                          <option>Biology</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                        <input
                          type="number" min="5" max="300"
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb}
                          value={form.duration}
                          onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={inputStyle} onFocus={fo} onBlur={fb}
                        value={form.instructions}
                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                        placeholder="Any special instructions for students..."
                      />
                    </div>
                  </div>
                </div>

                {/* Anti-cheat */}
                <div className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}>
                  <h2 className="font-semibold text-gray-800 mb-5">Anti-Cheat Settings</h2>
                  <div className="space-y-3">
                    {[
                      { key: 'antiCheatEnabled', label: 'Enable Anti-Cheat Monitoring', desc: 'Detect tab switches and window blur' },
                      { key: 'shuffleQuestions', label: 'Shuffle Question Order', desc: 'Randomize per student' },
                      { key: 'shuffleOptions', label: 'Shuffle MCQ Options', desc: 'Randomize answer choices' },
                      { key: 'showResult', label: 'Show Result After Submit', desc: 'Students see score immediately' },
                    ].map(function(item) {
                      return (
                        <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSetting(item.key)}
                            className="w-11 h-6 rounded-full transition-all duration-200 relative shrink-0"
                            style={{ background: form.settings[item.key] ? '#1A6FD4' : '#D1D5DB' }}
                          >
                            <div
                              className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200"
                              style={{ left: form.settings[item.key] ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                            />
                          </button>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tab Switch Limit</label>
                        <input
                          type="number" min="1" max="10"
                          className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb}
                          value={form.settings.tabSwitchLimit}
                          onChange={(e) => setForm((f) => ({ ...f, settings: { ...f.settings, tabSwitchLimit: Number(e.target.value) } }))}
                        />
                        <p className="text-xs text-gray-400 mt-1">Auto-submit after N violations</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Marks Deducted Per Violation</label>
                        <input
                          type="number" min="0" max="20"
                          className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb}
                          value={form.settings.markDeductionOnCheat}
                          onChange={(e) => setForm((f) => ({ ...f, settings: { ...f.settings, markDeductionOnCheat: Number(e.target.value) } }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publish toggle */}
                <div className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}>
                  <div>
                    <p className="font-medium text-gray-800">Publish Immediately</p>
                    <p className="text-xs text-gray-400">Make test visible to students right away</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                    className="w-11 h-6 rounded-full transition-all duration-200 relative shrink-0"
                    style={{ background: form.isPublished ? '#059669' : '#D1D5DB' }}
                  >
                    <div
                      className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200"
                      style={{ left: form.isPublished ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                    />
                  </button>
                </div>
              </div>

              {/* Right column: Question selector */}
              <div className="p-5 rounded-2xl flex flex-col"
                style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)', maxHeight: '85vh', position: 'sticky', top: '20px' }}>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800 text-sm">Select Questions</h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#EFF6FF', color: '#1A6FD4' }}>
                    {selectedQIds.length} selected
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    className="w-full pl-8 pr-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB' }}
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Add question inline button */}
                <button
                  type="button"
                  onClick={() => setShowAddQ(!showAddQ)}
                  className="w-full mb-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
                  style={{
                    background: showAddQ ? '#EFF6FF' : '#F9FAFB',
                    color: showAddQ ? '#1A6FD4' : '#374151',
                    border: '1.5px dashed',
                    borderColor: showAddQ ? '#1A6FD4' : '#D1D5DB',
                  }}
                >
                  <HiPlus size={15} />
                  {showAddQ ? 'Cancel' : '+ Add New Question Here'}
                </button>

                {/* Inline add question form */}
                {showAddQ && (
                  <div className="mb-3 p-4 rounded-xl border overflow-y-auto"
                    style={{ border: '1.5px solid rgba(26,111,212,0.2)', background: '#F8FAFF', maxHeight: '320px' }}>
                    <p className="text-xs font-semibold text-blue-700 mb-3">Quick Add Question</p>
                    <form onSubmit={handleSaveNewQ} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="px-2 py-2 rounded-lg border text-xs outline-none"
                          style={inputStyle}
                          value={newQ.type}
                          onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}
                        >
                          <option value="mcq">MCQ</option>
                          <option value="numerical">Numerical</option>
                        </select>
                        <input
                          className="px-2 py-2 rounded-lg border text-xs outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb}
                          value={newQ.topic}
                          onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })}
                          placeholder="Topic (optional)"
                        />
                      </div>

                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                        style={inputStyle} onFocus={fo} onBlur={fb}
                        value={newQ.questionText}
                        onChange={(e) => setNewQ({ ...newQ, questionText: e.target.value })}
                        placeholder="Question text *"
                        required
                      />

                      {newQ.type === 'mcq' && (
                        <div className="space-y-1.5">
                          {newQ.options.map((opt, i) => (
                            <div key={opt.label} className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setNewQ({ ...newQ, correctOption: opt.label })}
                                className="w-6 h-6 rounded text-xs font-bold shrink-0 transition"
                                style={{
                                  background: newQ.correctOption === opt.label ? '#1A6FD4' : '#E5E7EB',
                                  color: newQ.correctOption === opt.label ? 'white' : '#374151',
                                }}
                              >
                                {opt.label}
                              </button>
                              <input
                                className="flex-1 px-2 py-1.5 rounded-lg border text-xs outline-none"
                                style={inputStyle} onFocus={fo} onBlur={fb}
                                value={opt.text}
                                onChange={(e) => {
                                  var opts = newQ.options.map((o, idx) => idx === i ? { ...o, text: e.target.value } : o);
                                  setNewQ({ ...newQ, options: opts });
                                }}
                                placeholder={'Option ' + opt.label}
                              />
                            </div>
                          ))}
                          <p className="text-xs text-gray-400">Click the letter to mark correct answer</p>
                        </div>
                      )}

                      {newQ.type === 'numerical' && (
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb}
                          value={newQ.numericalAnswer}
                          onChange={(e) => setNewQ({ ...newQ, numericalAnswer: e.target.value })}
                          placeholder="Correct answer *"
                          required
                        />
                      )}

                      <button
                        type="submit"
                        disabled={savingQ}
                        className="w-full py-2 rounded-lg text-xs font-bold text-white transition"
                        style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: savingQ ? 0.7 : 1 }}
                      >
                        {savingQ ? 'Adding...' : 'Add and Select Question'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Questions list */}
                <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                  {qLoading ? (
                    <div className="text-center py-6 text-gray-400 text-xs">Loading...</div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-xs">No questions found</p>
                      <button type="button" onClick={() => setShowAddQ(true)} className="text-blue-600 text-xs mt-1">
                        + Add a question above
                      </button>
                    </div>
                  ) : (
                    filtered.map((q) => {
                      var sel = selectedQIds.includes(q._id);
                      return (
                        <div
                          key={q._id}
                          onClick={() => toggleQuestion(q._id)}
                          className="p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: sel ? '#EFF6FF' : '#F9FAFB',
                            border: '1.5px solid ' + (sel ? '#1A6FD4' : '#E5E7EB'),
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center"
                              style={{
                                background: sel ? '#1A6FD4' : 'white',
                                border: '1.5px solid ' + (sel ? '#1A6FD4' : '#D1D5DB'),
                              }}
                            >
                              {sel && <span className="text-white" style={{ fontSize: '9px' }}>checkmark</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {q.questionText}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#E5E7EB', color: '#6B7280' }}>
                                  {q.type.toUpperCase()}
                                </span>
                                {q.topic && <span className="text-xs text-gray-400">{q.topic}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedQIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex items-center justify-between">
                    <span>{selectedQIds.length} question(s) selected</span>
                    <button type="button" onClick={() => setSelectedQIds([])} className="text-red-400 hover:text-red-600 flex items-center gap-1">
                      <HiTrash size={11} /> Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex gap-4">
              <Link href="/admin" className="px-6 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: submitting ? 0.75 : 1 }}
              >
                {submitting ? 'Creating...' : ('Create Test' + (selectedQIds.length > 0 ? ' (' + selectedQIds.length + ' questions)' : ''))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
