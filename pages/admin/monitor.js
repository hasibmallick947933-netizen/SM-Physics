import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { HiArrowLeft, HiRefresh, HiShieldExclamation, HiUser, HiClock } from 'react-icons/hi';

export default function AdminMonitor() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchData();
      // Auto-refresh every 15 seconds
      intervalRef.current = setInterval(fetchData, 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStats(data);
      setLastUpdated(new Date());
    } catch { /* silent refresh */ }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
        <div className="w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }} />
      </div>
    );
  }

  const severityColor = { low: '#059669', medium: '#D97706', high: '#DC2626', critical: '#7C2D12' };

  return (
    <>
      <Head><title>Live Monitor – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        {/* Top bar */}
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>🔴 Live Monitor</span>
          <div className="ml-auto flex items-center gap-3">
            {lastUpdated && (
              <span className="text-blue-300 text-xs">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button onClick={fetchData}
              className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white px-3 py-1.5 rounded-lg transition"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <HiRefresh size={13} /> Refresh
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Live banner */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-gray-800">Live Session Monitor</span>
            </div>
            <span className="text-gray-400 text-sm">Auto-refreshes every 15 seconds</span>
            <div className="ml-auto px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: stats.activeTests?.length > 0 ? '#DCFCE7' : '#F3F4F6', color: stats.activeTests?.length > 0 ? '#15803D' : '#6B7280' }}>
              {stats.activeTests?.length || 0} active session{stats.activeTests?.length !== 1 ? 's' : ''}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Active sessions */}
            <div className="lg:col-span-3">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HiUser className="text-green-500" /> Active Test Sessions
              </h2>

              {!stats.activeTests || stats.activeTests.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-16 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <p className="text-4xl mb-3">😴</p>
                  <p className="text-gray-500 font-medium">No active test sessions</p>
                  <p className="text-gray-400 text-sm mt-1">Students are not currently taking any tests.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {stats.activeTests.map((session, i) => {
                      const startTime = new Date(session.startedAt);
                      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
                      const testDuration = (session.test?.duration || 180) * 60;
                      const progress = Math.min((elapsed / testDuration) * 100, 100);

                      return (
                        <motion.div
                          key={session._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-2xl"
                          style={{ background: 'white', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(11,30,61,0.05)' }}>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                                {session.student?.name?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{session.student?.name}</p>
                                <p className="text-xs text-gray-400">{session.student?.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-gray-600">{session.test?.title}</p>
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <HiClock size={11} className="text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  Started {startTime.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-1.5 rounded-full mb-2" style={{ background: '#E5E7EB' }}>
                            <div className="h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                background: progress > 80 ? '#EF4444' : progress > 60 ? '#F59E0B' : '#1A6FD4',
                              }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{Math.floor(elapsed / 60)}m {elapsed % 60}s elapsed</span>
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              In Progress
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Violation feed */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HiShieldExclamation className="text-red-500" /> Activity Feed
              </h2>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                {!stats.recentLogs || stats.recentLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-gray-400 text-sm">No violations logged</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ divideColor: 'rgba(11,30,61,0.04)', maxHeight: '500px', overflowY: 'auto' }}>
                    {stats.recentLogs.map((log, i) => (
                      <motion.div
                        key={log._id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="p-3 flex items-start gap-3"
                        style={{ borderBottom: '1px solid rgba(11,30,61,0.04)' }}>
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: severityColor[log.severity] || '#D97706' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {log.student?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{log.test?.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{
                                background: `${severityColor[log.severity]}15`,
                                color: severityColor[log.severity],
                              }}>
                              {log.eventType}
                            </span>
                            <span className="text-[10px] text-gray-300">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {log.marksDeducted > 0 && (
                          <span className="text-xs font-bold text-red-500 shrink-0">
                            –{log.marksDeducted}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
