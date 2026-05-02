import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiDownload, HiChartBar, HiAcademicCap, HiClock } from 'react-icons/hi';

export default function AdminResults() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [results, setResults] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchTests();
    }
  }, [user, loading]);

  const fetchTests = async () => {
    try {
      const { data } = await axios.get('/api/tests', { headers: { Authorization: `Bearer ${getToken()}` } });
      setTests(data.tests);
    } catch { toast.error('Failed to load tests'); }
    finally { setTestsLoading(false); }
  };

  const fetchResults = async (testId) => {
    if (!testId) return;
    setFetching(true);
    try {
      const { data } = await axios.get(`/api/admin/results?testId=${testId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setResults(data.results);
    } catch { toast.error('Failed to load results'); }
    finally { setFetching(false); }
  };

  const handleTestChange = (e) => {
    setSelectedTest(e.target.value);
    fetchResults(e.target.value);
  };

  const exportCSV = async () => {
    if (!selectedTest) return;
    try {
      const response = await axios.get(`/api/admin/results?testId=${selectedTest}&export=true`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${selectedTest}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Results exported!');
    } catch { toast.error('Export failed'); }
  };

  const currentTest = tests.find(t => t._id === selectedTest);
  const avg = results.length > 0 ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1) : 0;
  const highest = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const passCount = results.filter(r => r.score >= (currentTest?.passingMarks || 0)).length;

  const statusColor = { completed: '#059669', 'auto-submitted': '#DC2626', 'cheating-detected': '#7C2D12', 'in-progress': '#D97706' };
  const statusLabel = { completed: 'Completed', 'auto-submitted': 'Auto-Submitted', 'cheating-detected': 'Cheating Detected', 'in-progress': 'In Progress' };

  return (
    <>
      <Head><title>Results – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        {/* Top bar */}
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Test Results</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Test selector */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl mb-6 flex flex-wrap gap-4 items-center"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Select Test</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ border: '1.5px solid #E5E7EB' }}
                value={selectedTest}
                onChange={handleTestChange}
              >
                <option value="">-- Choose a test --</option>
                {tests.map(t => (
                  <option key={t._id} value={t._id}>{t.title} ({t.subject})</option>
                ))}
              </select>
            </div>
            {selectedTest && (
              <button onClick={exportCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-4 sm:mt-0"
                style={{ background: '#059669' }}>
                <HiDownload /> Export CSV
              </button>
            )}
          </motion.div>

          {/* Summary stats */}
          {selectedTest && results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Attempts', value: results.length, icon: '👥', color: '#1A6FD4' },
                { label: 'Average Score', value: avg, icon: '📊', color: '#7C3AED' },
                { label: 'Highest Score', value: highest, icon: '🏆', color: '#D97706' },
                { label: 'Pass Rate', value: `${results.length > 0 ? Math.round((passCount / results.length) * 100) : 0}%`, icon: '✅', color: '#059669' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-4 rounded-2xl text-center" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Results table */}
          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading results...</div>
          ) : !selectedTest ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">📊</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-1">Select a test to view results</h3>
              <p className="text-gray-400 text-sm">Choose a test from the dropdown above.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-gray-400">No students have attempted this test yet.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--color-navy)', color: 'white' }}>
                      {['Rank', 'Student', 'Email', 'Score', 'Correct', 'Wrong', 'Skipped', 'Time Used', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <motion.tr key={r._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b hover:bg-blue-50/30 transition-colors"
                        style={{ borderColor: 'rgba(11,30,61,0.04)' }}>
                        <td className="px-4 py-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            r.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            r.rank === 2 ? 'bg-gray-100 text-gray-600' :
                            r.rank === 3 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                              {r.student?.name?.[0] || '?'}
                            </div>
                            <span className="font-medium text-gray-800">{r.student?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{r.student?.email}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold" style={{ color: r.score >= 0 ? '#059669' : '#DC2626' }}>
                            {r.score}
                          </span>
                          <span className="text-gray-400 text-xs">/{r.totalMarks}</span>
                        </td>
                        <td className="px-4 py-3"><span className="text-green-600 font-medium">{r.correctCount}</span></td>
                        <td className="px-4 py-3"><span className="text-red-500 font-medium">{r.incorrectCount}</span></td>
                        <td className="px-4 py-3 text-gray-400">{r.unattemptedCount}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {r.timeUsed ? `${Math.floor(r.timeUsed / 60)}m ${r.timeUsed % 60}s` : '–'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: `${statusColor[r.status] || '#6B7280'}15`,
                              color: statusColor[r.status] || '#6B7280',
                            }}>
                            {statusLabel[r.status] || r.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 text-xs text-gray-400 border-t" style={{ borderColor: 'rgba(11,30,61,0.04)' }}>
                Showing {results.length} result{results.length !== 1 ? 's' : ''} ·{' '}
                <button onClick={exportCSV} className="text-blue-600 hover:underline">Download CSV</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
