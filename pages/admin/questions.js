import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPlus, HiTrash, HiPencil, HiPhotograph, HiDocumentText, HiPlusCircle } from 'react-icons/hi';

const defaultQ = {
  type: 'mcq', subject: 'Physics', topic: '', difficulty: 'medium',
  questionText: '', questionImage: '',
  options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }],
  correctOption: 'A', numericalAnswer: '', numericalTolerance: 0,
  marksCorrect: 4, marksIncorrect: -1, solution: '',
};

const inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };
const fo = (e) => (e.target.style.borderColor = 'var(--color-blue)');
const fb = (e) => (e.target.style.borderColor = '#E5E7EB');

export default function AdminQuestions() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultQ);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploadTab, setUploadTab] = useState('type');
  const [uploadPreview, setUploadPreview] = useState(null);
  const imgRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchQuestions();
    }
  }, [user, loading]);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get('/api/questions?limit=100', { headers: { Authorization: `Bearer ${getToken()}` } });
      setQuestions(data.questions);
    } catch { toast.error('Failed to load questions'); }
    finally { setFetching(false); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return toast.error('Only JPG, PNG images allowed');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadPreview(ev.target.result);
      setForm((prev) => ({ ...prev, questionImage: ev.target.result }));
      toast.success('Image attached!');
      setUploadTab('type');
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF file');
    toast('📄 Reading PDF text...');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = ev.target.result.split(',')[1];
        const { data } = await axios.post('/api/admin/extract-pdf', { base64 }, { headers: { Authorization: `Bearer ${getToken()}` } });
        if (data.text) {
          setForm((prev) => ({ ...prev, questionText: data.text.slice(0, 800) }));
          toast.success('PDF text extracted! Review and edit it.');
          setUploadTab('type');
        }
      } catch {
        toast.error('Could not read PDF. Please type the question manually.');
        setUploadTab('type');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.questionText.trim()) return toast.error('Question text is required');
    if (form.type === 'mcq' && !form.options.every((o) => o.text.trim()))
      return toast.error('All 4 options are required');
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
      setShowForm(false); setForm(defaultQ); setEditId(null); setUploadPreview(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (qId) => {
    if (!confirm('Delete this question?')) return;
    try {
      await axios.delete(`/api/questions/${qId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success('Deleted');
      setQuestions((prev) => prev.filter((q) => q._id !== qId));
    } catch { toast.error('Delete failed'); }
  };

  const openAdd = () => { setForm(defaultQ); setEditId(null); setUploadPreview(null); setUploadTab('type'); setShowForm(true); };
  const diffColor = { easy: '#059669', medium: '#D97706', hard: '#DC2626' };

  return (
    <>
      <Head><title>Questions – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Question Bank</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">{questions.length} total</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/admin/tests/create"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-200 transition hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              <HiPlusCircle size={16} /> Create Test
            </Link>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1A6FD4' }}>
              <HiPlus /> Add Question
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📝</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions yet</h3>
              <button onClick={openAdd} className="btn-primary mt-3">+ Add First Question</button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-4 rounded-2xl flex items-start gap-4"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: '#EFF6FF', color: 'var(--color-blue)' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    {q.questionImage && (
                      <img src={q.questionImage} alt="" className="w-20 h-14 object-cover rounded-lg mb-2 border" />
                    )}
                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">{q.questionText}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{q.type.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${diffColor[q.difficulty]}15`, color: diffColor[q.difficulty] }}>{q.difficulty}</span>
                      {q.topic && <span className="text-xs text-gray-400">{q.topic}</span>}
                      <span className="text-xs text-gray-400">+{q.marksCorrect}/{q.marksIncorrect}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setForm({ ...q, numericalAnswer: q.numericalAnswer ?? '' }); setEditId(q._id); setUploadPreview(q.questionImage || null); setUploadTab('type'); setShowForm(true); }}
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

        {/* Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(11,30,61,0.75)', backdropFilter: 'blur(8px)' }}>
              <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6"
                style={{ background: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                    {editId ? 'Edit Question' : 'Add New Question'}
                  </h2>
                  <button onClick={() => { setShowForm(false); setUploadPreview(null); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                {/* Upload tabs */}
                <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: '#F3F4F6' }}>
                  {[
                    { key: 'type', label: '⌨️ Type' },
                    { key: 'image', label: '🖼️ Image (JPG/PNG)' },
                    { key: 'pdf', label: '📄 PDF' },
                  ].map((tab) => (
                    <button key={tab.key} onClick={() => setUploadTab(tab.key)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{ background: uploadTab === tab.key ? 'white' : 'transparent', color: uploadTab === tab.key ? 'var(--color-navy)' : '#6B7280', boxShadow: uploadTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Image upload area */}
                {uploadTab === 'image' && (
                  <div className="mb-4">
                    <div onClick={() => imgRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                      style={{ borderColor: '#D1D5DB' }}>
                      {uploadPreview ? (
                        <div>
                          <img src={uploadPreview} alt="Preview" className="max-h-48 mx-auto rounded-xl mb-3 object-contain" />
                          <p className="text-sm text-green-600 font-medium">✅ Image attached! Switch to &ldquo;Type&rdquo; tab to add options.</p>
                        </div>
                      ) : (
                        <div>
                          <HiPhotograph className="mx-auto text-gray-300 mb-3" size={48} />
                          <p className="text-sm font-medium text-gray-600">Click to upload question image</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5MB</p>
                        </div>
                      )}
                    </div>
                    <input ref={imgRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload} className="hidden" />
                  </div>
                )}

                {/* PDF upload area */}
                {uploadTab === 'pdf' && (
                  <div className="mb-4">
                    <div onClick={() => pdfRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                      style={{ borderColor: '#D1D5DB' }}>
                      <HiDocumentText className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-sm font-medium text-gray-600">Click to upload PDF</p>
                      <p className="text-xs text-gray-400 mt-1">Text will be auto-extracted — max 10MB</p>
                    </div>
                    <input ref={pdfRef} type="file" accept="application/pdf"
                      onChange={handlePdfUpload} className="hidden" />
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}
                        value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="mcq">MCQ</option>
                        <option value="numerical">Numerical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                      <select className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}
                        value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                        {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                      <select className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}
                        value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
                    <input className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}
                      onFocus={fo} onBlur={fb} value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      placeholder="e.g. Electrostatics, Kinematics..." />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Text *</label>
                    {uploadPreview && (
                      <img src={uploadPreview} alt="" className="w-full max-h-40 object-contain rounded-xl mb-2 border" />
                    )}
                    <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={inputStyle} onFocus={fo} onBlur={fb} value={form.questionText}
                      onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                      placeholder="Write or paste question text here..." required />
                  </div>

                  {form.type === 'mcq' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Options *</label>
                      {form.options.map((opt, i) => (
                        <div key={opt.label} className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ background: form.correctOption === opt.label ? '#EFF6FF' : '#F3F4F6', color: form.correctOption === opt.label ? '#1D4ED8' : '#374151' }}>
                            {opt.label}
                          </span>
                          <input className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none" style={inputStyle}
                            onFocus={fo} onBlur={fb} value={opt.text}
                            onChange={(e) => {
                              const opts = [...form.options];
                              opts[i] = { ...opts[i], text: e.target.value };
                              setForm({ ...form, options: opts });
                            }}
                            placeholder={`Option ${opt.label}`} />
                          <button type="button" onClick={() => setForm({ ...form, correctOption: opt.label })}
                            className="px-3 py-2 rounded-xl text-xs font-medium border transition shrink-0"
                            style={{ background: form.correctOption === opt.label ? '#EFF6FF' : 'white', color: form.correctOption === opt.label ? '#1D4ED8' : '#6B7280', borderColor: form.correctOption === opt.label ? '#BFDBFE' : '#E5E7EB' }}>
                            {form.correctOption === opt.label ? '✓' : 'Mark'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.type === 'numerical' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Correct Answer *</label>
                        <input type="number" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb} value={form.numericalAnswer}
                          onChange={(e) => setForm({ ...form, numericalAnswer: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tolerance (±)</label>
                        <input type="number" min="0" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                          style={inputStyle} onFocus={fo} onBlur={fb} value={form.numericalTolerance}
                          onChange={(e) => setForm({ ...form, numericalTolerance: Number(e.target.value) })} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marks (Correct)</label>
                      <input type="number" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                        style={inputStyle} onFocus={fo} onBlur={fb} value={form.marksCorrect}
                        onChange={(e) => setForm({ ...form, marksCorrect: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marks (Wrong)</label>
                      <input type="number" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                        style={inputStyle} onFocus={fo} onBlur={fb} value={form.marksIncorrect}
                        onChange={(e) => setForm({ ...form, marksIncorrect: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Solution (optional)</label>
                    <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={inputStyle} onFocus={fo} onBlur={fb} value={form.solution}
                      onChange={(e) => setForm({ ...form, solution: e.target.value })}
                      placeholder="Explain how to solve..." />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowForm(false); setUploadPreview(null); }}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium text-gray-600">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Saving...' : editId ? '✓ Update' : '✓ Add Question'}
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
