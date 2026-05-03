import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSearch, HiPlus, HiTrash } from 'react-icons/hi';

export default function CreateTest() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [duration, setDuration] = useState(180);
  const [instructions, setInstructions] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [antiCheat, setAntiCheat] = useState(true);
  const [shuffleQ, setShuffleQ] = useState(false);
  const [shuffleO, setShuffleO] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [tabLimit, setTabLimit] = useState(3);
  const [markDeduct, setMarkDeduct] = useState(4);

  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qLoading, setQLoading] = useState(true);

  const [showAddQ, setShowAddQ] = useState(false);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('mcq');
  const [qTopic, setQTopic] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [qNum, setQNum] = useState('');
  const [savingQ, setSavingQ] = useState(false);

  var inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };

  useEffect(function() {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
        return;
      }
      fetchQuestions();
    }
  }, [user, loading]);

  function fetchQuestions() {
    axios.get('/api/questions?limit=200', {
      headers: { Authorization: 'Bearer ' + getToken() },
    }).then(function(res) {
      setAllQuestions(res.data.questions);
    }).catch(function() {
      toast.error('Failed to load questions');
    }).finally(function() {
      setQLoading(false);
    });
  }

  function toggleQuestion(qId) {
    setSelectedQIds(function(prev) {
      if (prev.includes(qId)) {
        return prev.filter(function(id) { return id !== qId; });
      }
      return prev.concat([qId]);
    });
  }

  function handleSaveNewQ(e) {
    e.preventDefault();
    if (!qText.trim()) { toast.error('Question text required'); return; }
    if (qType === 'mcq' && (!qOptA || !qOptB || !qOptC || !qOptD)) {
      toast.error('All 4 options required');
      return;
    }
    setSavingQ(true);
    var payload = {
      type: qType, subject: subject, topic: qTopic,
      questionText: qText, difficulty: 'medium',
      marksCorrect: 4, marksIncorrect: -1,
    };
    if (qType === 'mcq') {
      payload.options = [
        { label: 'A', text: qOptA },
        { label: 'B', text: qOptB },
        { label: 'C', text: qOptC },
        { label: 'D', text: qOptD },
      ];
      payload.correctOption = qCorrect;
    } else {
      payload.numericalAnswer = Number(qNum);
      payload.options = [];
    }
    axios.post('/api/questions', payload, {
      headers: { Authorization: 'Bearer ' + getToken() },
    }).then(function(res) {
      var newQuestion = res.data.question;
      setAllQuestions(function(prev) { return [newQuestion].concat(prev); });
      setSelectedQIds(function(prev) { return prev.concat([newQuestion._id]); });
      setQText(''); setQTopic(''); setQOptA(''); setQOptB(''); setQOptC(''); setQOptD('');
      setQCorrect('A'); setQNum(''); setShowAddQ(false);
      toast.success('Question added and selected!');
    }).catch(function(err) {
      var msg = err.response && err.response.data ? err.response.data.error : 'Failed';
      toast.error(msg);
    }).finally(function() {
      setSavingQ(false);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title) { toast.error('Test title is required'); return; }
    if (selectedQIds.length === 0) { toast.error('Select at least one question'); return; }
    setSubmitting(true);
    var payload = {
      title: title, description: description, subject: subject,
      duration: duration, instructions: instructions, isPublished: isPublished,
      questions: selectedQIds,
      settings: {
        antiCheatEnabled: antiCheat, shuffleQuestions: shuffleQ,
        shuffleOptions: shuffleO, showResult: showResult,
        tabSwitchLimit: tabLimit, markDeductionOnCheat: markDeduct,
      },
    };
    axios.post('/api/tests', payload, {
      headers: { Authorization: 'Bearer ' + getToken() },
    }).then(function() {
      toast.success('Test created!');
      router.push('/admin');
    }).catch(function(err) {
      var msg = err.response && err.response.data ? err.response.data.error : 'Failed';
      toast.error(msg);
    }).finally(function() {
      setSubmitting(false);
    });
  }

  var filtered = allQuestions.filter(function(q) {
    var s = searchTerm.toLowerCase();
    return q.questionText.toLowerCase().includes(s) || (q.topic && q.topic.toLowerCase().includes(s));
  });

  return (
    <div>
      <Head><title>Create Test - Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>

        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: '#0B1E3D' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold">Create New Test</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-5">

                <div className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}>
                  <h2 className="font-semibold text-gray-800 mb-5">Test Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Title *</label>
                      <input className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}
                        value={title} onChange={function(e) { setTitle(e.target.value); }}
                        placeholder="e.g. JEE Mock Test - Electrostatics" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea rows={2} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}
                        value={description} onChange={function(e) { setDescription(e.target.value); }}
                        placeholder="Brief description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                        <select className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}
                          value={subject} onChange={function(e) { setSubject(e.target.value); }}>
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Mathematics</option>
                          <option>Biology</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                        <input type="number" min="5" max="300" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}
                          value={duration} onChange={function(e) { setDuration(Number(e.target.value)); }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
                      <textarea rows={2} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}
                        value={instructions} onChange={function(e) { setInstructions(e.target.value); }}
                        placeholder="Optional instructions for students..." />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}>
                  <h2 className="font-semibold text-gray-800 mb-5">Anti-Cheat Settings</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Enable Anti-Cheat Monitoring', desc: 'Detect tab switches', val: antiCheat, set: setAntiCheat },
                      { label: 'Shuffle Question Order', desc: 'Randomize per student', val: shuffleQ, set: setShuffleQ },
                      { label: 'Shuffle MCQ Options', desc: 'Randomize answer choices', val: shuffleO, set: setShuffleO },
                      { label: 'Show Result After Submit', desc: 'Students see score immediately', val: showResult, set: setShowResult },
                    ].map(function(item) {
                      return (
                        <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <button type="button" onClick={function() { item.set(!item.val); }}
                            className="w-11 h-6 rounded-full transition-all relative shrink-0"
                            style={{ background: item.val ? '#1A6FD4' : '#D1D5DB' }}>
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                              style={{ left: item.val ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </button>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tab Switch Limit</label>
                        <input type="number" min="1" max="10" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}
                          value={tabLimit} onChange={function(e) { setTabLimit(Number(e.target.value)); }} />
                        <p className="text-xs text-gray-400 mt-1">Auto-submit after N violations</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Marks Deducted Per Violation</label>
                        <input type="number" min="0" max="20" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}
                          value={markDeduct} onChange={function(e) { setMarkDeduct(Number(e.target.value)); }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}>
                  <div>
                    <p className="font-medium text-gray-800">Publish Immediately</p>
                    <p className="text-xs text-gray-400">Make test visible to students right away</p>
                  </div>
                  <button type="button" onClick={function() { setIsPublished(!isPublished); }}
                    className="w-11 h-6 rounded-full transition-all relative shrink-0"
                    style={{ background: isPublished ? '#059669' : '#D1D5DB' }}>
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                      style={{ left: isPublished ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl flex flex-col"
                style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)', maxHeight: '85vh', position: 'sticky', top: '20px' }}>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800 text-sm">Select Questions</h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#EFF6FF', color: '#1A6FD4' }}>
                    {selectedQIds.length} selected
                  </span>
                </div>

                <div className="relative mb-3">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input className="w-full pl-8 pr-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB' }}
                    placeholder="Search questions..."
                    value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} />
                </div>

                <button type="button" onClick={function() { setShowAddQ(!showAddQ); }}
                  className="w-full mb-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: showAddQ ? '#EFF6FF' : '#F9FAFB', color: showAddQ ? '#1A6FD4' : '#374151', border: '1.5px dashed', borderColor: showAddQ ? '#1A6FD4' : '#D1D5DB' }}>
                  <HiPlus size={15} />
                  {showAddQ ? 'Cancel' : '+ Add New Question Here'}
                </button>

                {showAddQ && (
                  <div className="mb-3 p-4 rounded-xl border overflow-y-auto"
                    style={{ border: '1.5px solid rgba(26,111,212,0.2)', background: '#F8FAFF', maxHeight: '320px' }}>
                    <p className="text-xs font-semibold text-blue-700 mb-3">Quick Add Question</p>
                    <form onSubmit={handleSaveNewQ} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select className="px-2 py-2 rounded-lg border text-xs outline-none" style={inputStyle}
                          value={qType} onChange={function(e) { setQType(e.target.value); }}>
                          <option value="mcq">MCQ</option>
                          <option value="numerical">Numerical</option>
                        </select>
                        <input className="px-2 py-2 rounded-lg border text-xs outline-none" style={inputStyle}
                          value={qTopic} onChange={function(e) { setQTopic(e.target.value); }}
                          placeholder="Topic (optional)" />
                      </div>
                      <textarea rows={2} className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}
                        value={qText} onChange={function(e) { setQText(e.target.value); }}
                        placeholder="Question text *" required />

                      {qType === 'mcq' && (
                        <div className="space-y-1.5">
                          {[
                            { label: 'A', val: qOptA, set: setQOptA },
                            { label: 'B', val: qOptB, set: setQOptB },
                            { label: 'C', val: qOptC, set: setQOptC },
                            { label: 'D', val: qOptD, set: setQOptD },
                          ].map(function(opt) {
                            return (
                              <div key={opt.label} className="flex items-center gap-1.5">
                                <button type="button" onClick={function() { setQCorrect(opt.label); }}
                                  className="w-6 h-6 rounded text-xs font-bold shrink-0"
                                  style={{ background: qCorrect === opt.label ? '#1A6FD4' : '#E5E7EB', color: qCorrect === opt.label ? 'white' : '#374151' }}>
                                  {opt.label}
                                </button>
                                <input className="flex-1 px-2 py-1.5 rounded-lg border text-xs outline-none" style={inputStyle}
                                  value={opt.val} onChange={function(e) { opt.set(e.target.value); }}
                                  placeholder={'Option ' + opt.label} />
                              </div>
                            );
                          })}
                          <p className="text-xs text-gray-400">Click letter to mark correct answer</p>
                        </div>
                      )}

                      {qType === 'numerical' && (
                        <input type="number" className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}
                          value={qNum} onChange={function(e) { setQNum(e.target.value); }}
                          placeholder="Correct answer *" required />
                      )}

                      <button type="submit" disabled={savingQ}
                        className="w-full py-2 rounded-lg text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: savingQ ? 0.7 : 1 }}>
                        {savingQ ? 'Adding...' : 'Add and Select Question'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                  {qLoading ? (
                    <div className="text-center py-6 text-gray-400 text-xs">Loading...</div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-xs">No questions found</p>
                      <button type="button" onClick={function() { setShowAddQ(true); }} className="text-blue-600 text-xs mt-1">
                        + Add a question above
                      </button>
                    </div>
                  ) : (
                    filtered.map(function(q) {
                      var sel = selectedQIds.includes(q._id);
                      return (
                        <div key={q._id} onClick={function() { toggleQuestion(q._id); }}
                          className="p-3 rounded-xl cursor-pointer transition-all"
                          style={{ background: sel ? '#EFF6FF' : '#F9FAFB', border: '1.5px solid ' + (sel ? '#1A6FD4' : '#E5E7EB') }}>
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center"
                              style={{ background: sel ? '#1A6FD4' : 'white', border: '1.5px solid ' + (sel ? '#1A6FD4' : '#D1D5DB') }}>
                              {sel && <span style={{ color: 'white', fontSize: '9px', fontWeight: 'bold' }}>✓</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{q.questionText}</p>
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
                    <button type="button" onClick={function() { setSelectedQIds([]); }}
                      className="text-red-400 hover:text-red-600 flex items-center gap-1">
                      <HiTrash size={11} /> Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Link href="/admin" className="px-6 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: submitting ? 0.75 : 1 }}>
                {submitting ? 'Creating...' : 'Create Test' + (selectedQIds.length > 0 ? ' (' + selectedQIds.length + ' questions)' : '')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
