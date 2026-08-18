import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPlusCircle, HiTrash, HiClock, HiAcademicCap } from 'react-icons/hi';

export default function AdminTestsList() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [fetching, setFetching] = useState(true);

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
    finally { setFetching(false); }
  };

  const toggleActive = async (test) => {
    try {
      const { data } = await axios.patch(`/api/tests/${test._id}`, { isActive: !test.isActive },
        { headers: { Authorization: `Bearer ${getToken()}` } });
      setTests((prev) => prev.map((t) => (t._id === test._id ? data.test : t)));
      toast.success(data.test.isActive ? 'Test turned ON' : 'Test turned OFF');
    } catch { toast.error('Failed to update'); }
  };

  const togglePublish = async (test) => {
    try {
      const { data } = await axios.patch(`/api/tests/${test._id}`, { isPublished: !test.isPublished },
        { headers: { Authorization: `Bearer ${getToken()}` } });
      setTests((prev) => prev.map((t) => (t._id === test._id ? data.test : t)));
      toast.success(data.test.isPublished ? 'Published' : 'Unpublished');
    } catch { toast.error('Failed to update'); }
  };

  const deleteTest = async (id) => {
    if (!confirm('Delete this test permanently?')) return;
    try {
      await axios.delete(`/api/tests/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setTests((prev) => prev.filter((t) => t._id !== id));
      toast.success('Test deleted');
    } catch { toast.error('Delete failed'); }
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

  const classColor = {
    All: '#6B7280',
    'Class 11': '#1A6FD4',
    'Class 12': '#7C3AED',
    Dropper: '#D97706',
    Other: '#059669',
  };

  return (
    <>
      <Head><title>Manage Tests – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Manage Tests</span>
          <div className="ml-auto">
            <Link href="/admin/tests/create"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1A6FD4' }}>
              <HiPlusCircle size={16} /> Create Test
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : tests.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📋</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tests yet</h3>
              <Link href="/admin/tests/create" className="btn-primary mt-3 inline-block">+ Create First Test</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((t, i) => (
                <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-5 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-semibold text-gray-800">{t.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                          style={{ background: `${classColor[t.targetClass] || '#6B7280'}15`, color: classColor[t.targetClass] || '#6B7280' }}>
                          <HiAcademicCap size={11} /> {t.targetClass || 'All'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: t.isPublished ? '#ECFDF5' : '#F3F4F6', color: t.isPublished ? '#059669' : '#6B7280' }}>
                          {t.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{t.questions?.length || 0} questions · {t.duration} min · {t.totalMarks} marks</p>
                      {(t.availableFrom || t.availableUntil) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <HiClock size={12} />
                          {t.availableFrom ? fmtDate(t.availableFrom) : 'Open'} → {t.availableUntil ? fmtDate(t.availableUntil) : 'No end date'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Publish toggle */}
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Published</p>
                        <button onClick={() => togglePublish(t)}
                          className="w-11 h-6 rounded-full transition-all relative"
                          style={{ background: t.isPublished ? '#059669' : '#D1D5DB' }}>
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                            style={{ left: t.isPublished ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>

                      {/* Active on/off toggle */}
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">{t.isActive ? 'ON' : 'OFF'}</p>
                        <button onClick={() => toggleActive(t)}
                          className="w-11 h-6 rounded-full transition-all relative"
                          style={{ background: t.isActive ? '#059669' : '#DC2626' }}>
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                            style={{ left: t.isActive ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>

                      <button onClick={() => deleteTest(t._id)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition">
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
