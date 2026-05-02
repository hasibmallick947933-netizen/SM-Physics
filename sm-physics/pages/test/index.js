import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { HiAcademicCap, HiClock, HiPlay, HiCheckCircle, HiLockClosed } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TestList() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (user) fetchTests();
  }, [user, loading]);

  const fetchTests = async () => {
    try {
      const { data } = await axios.get('/api/tests', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTests(data.tests);
    } catch { toast.error('Failed to load tests'); }
    finally { setFetching(false); }
  };

  if (loading || fetching) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }} />
            <p className="text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>Loading tests...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head><title>My Tests – SM Physics CBT</title></Head>
      <Layout>
        {/* Header */}
        <section className="py-16 px-4"
          style={{ background: 'linear-gradient(135deg, #0B1E3D, #122B56)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-blue-300 text-sm mb-1">Hello, {user?.name} 👋</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Available Tests
              </h1>
              <p className="text-blue-200/60 mt-2" style={{ fontFamily: 'var(--font-body)' }}>
                Select a test below to begin. Ensure you&apos;re in a quiet environment before starting.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CBT Rules banner */}
        <div className="px-4 py-4" style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A' }}>
          <div className="max-w-5xl mx-auto flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Important Instructions</p>
              <p className="text-amber-700 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                Do NOT switch tabs, minimize the window, or use external tools during the test. Each violation deducts 4 marks and is logged. After {3} violations, the test auto-submits. Once started, the timer cannot be paused.
              </p>
            </div>
          </div>
        </div>

        {/* Tests */}
        <section className="py-12 px-4 sm:px-6" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-5xl mx-auto">
            {tests.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20">
                <p className="text-6xl mb-4">📭</p>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No tests available yet</h3>
                <p className="text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>Check back soon — your teacher is preparing tests!</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {tests.map((test, i) => {
                  const isExpired = test.expiresAt && new Date(test.expiresAt) < new Date();
                  const notStarted = test.scheduledAt && new Date(test.scheduledAt) > new Date();
                  const statusColor = isExpired ? '#DC2626' : notStarted ? '#D97706' : '#059669';
                  const statusLabel = isExpired ? 'Expired' : notStarted ? 'Upcoming' : 'Available';

                  return (
                    <motion.div
                      key={test._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-6 rounded-2xl"
                      style={{ background: 'white', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(11,30,61,0.05)' }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0B1E3D, #1A6FD4)' }}>
                            <HiAcademicCap className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>{test.title}</h3>
                            <p className="text-xs text-gray-400">{test.subject}</p>
                          </div>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: `${statusColor}12`, color: statusColor }}>
                          {statusLabel}
                        </span>
                      </div>

                      {test.description && (
                        <p className="text-gray-500 text-sm mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                          {test.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mb-5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiClock size={13} />
                          {test.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <HiAcademicCap size={13} />
                          {test.totalMarks} marks
                        </span>
                        <span className="flex items-center gap-1">
                          📝 {test.questions?.length || '–'} questions
                        </span>
                      </div>

                      {isExpired || notStarted ? (
                        <button disabled
                          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                          style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
                          <HiLockClosed size={14} />
                          {isExpired ? 'Test Expired' : `Starts ${new Date(test.scheduledAt).toLocaleDateString()}`}
                        </button>
                      ) : (
                        <Link href={`/test/${test._id}`}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                          <HiPlay size={14} />
                          Start Test
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
}
