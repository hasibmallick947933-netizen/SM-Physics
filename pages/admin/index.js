import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  HiUsers, HiAcademicCap, HiClipboardList, HiShieldExclamation,
  HiPlusCircle, HiEye, HiChartBar, HiCog,
} from 'react-icons/hi';

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="p-6 rounded-2xl flex items-center gap-4"
      style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}>
        <Icon style={{ color, fontSize: '26px' }} />
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>{value}</p>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/login'); return; }
      if (user.role !== 'admin') { router.push('/'); return; }
      fetchStats();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStats(data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setFetching(false); }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
        <div className="w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }} />
      </div>
    );
  }

  const quickActions = [
  { icon: HiClipboardList, label: 'Manage Tests', href: '/admin/tests', color: '#1A6FD4', bg: '#EFF6FF' },
  { icon: HiPlusCircle, label: 'Create Test', href: '/admin/tests/create', color: '#1A6FD4', bg: '#EFF6FF' },
  { icon: HiClipboardList, label: 'Add Question', href: '/admin/questions', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: HiChartBar, label: 'View Results', href: '/admin/results', color: '#059669', bg: '#ECFDF5' },
  { icon: HiUsers, label: 'Manage Students', href: '/admin/students', color: '#D97706', bg: '#FFFBEB' },
];

  return (
    <>
      <Head><title>Admin Dashboard – SM Physics</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-6 shadow-sm"
          style={{ background: 'var(--color-navy)' }}>
          <div className="flex items-center gap-3">
            <HiAcademicCap className="text-blue-400 text-xl" />
            <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>SM Physics Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-300 text-sm">{user?.name}</span>
            <Link href="/" className="text-xs text-blue-400 hover:text-white transition">← Back to site</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm">Here&apos;s what&apos;s happening at SM Physics today.</p>
          </motion.div>

          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <StatCard icon={HiUsers} label="Total Students" value={stats?.stats.totalStudents || 0} color="#1A6FD4" delay={0} />
            <StatCard icon={HiAcademicCap} label="Tests Created" value={stats?.stats.totalTests || 0} color="#7C3AED" delay={0.08} />
            <StatCard icon={HiClipboardList} label="Tests Attempted" value={stats?.stats.totalResponses || 0} color="#059669" delay={0.16} />
          </div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl mb-8" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-semibold text-gray-800 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((a) => (
                <Link key={a.label} href={a.href}>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer text-center transition-all"
                    style={{ background: a.bg, border: `1px solid ${a.color}20` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${a.color}15` }}>
                      <a.icon style={{ color: a.color, fontSize: '22px' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: a.color }}>{a.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Tests */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Live Test Sessions
                </h2>
                <Link href="/admin/monitor" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <HiEye size={12} /> Monitor All
                </Link>
              </div>
              {(!stats?.activeTests || stats.activeTests.length === 0) ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">No active sessions right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.activeTests.slice(0, 5).map((r) => (
                    <div key={r._id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.student?.name}</p>
                        <p className="text-xs text-gray-400">{r.test?.title}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        In Progress
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Violations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
              className="p-6 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <HiShieldExclamation className="text-red-500" />
                  Recent Violations
                </h2>
                <Link href="/admin/logs" className="text-xs text-blue-600 hover:underline">View All Logs</Link>
              </div>
              {(!stats?.recentLogs || stats.recentLogs.length === 0) ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm">No violations logged</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {stats.recentLogs.slice(0, 8).map((log) => {
                    const severityColor = { low: '#059669', medium: '#D97706', high: '#DC2626', critical: '#7C2D12' };
                    return (
                      <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: '#FFF7F7', border: '1px solid #FED7D7' }}>
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: severityColor[log.severity] || '#D97706' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {log.student?.name} · <span className="text-red-600">{log.eventType}</span>
                          </p>
                          <p className="text-xs text-gray-400 truncate">{log.test?.title}</p>
                          <p className="text-xs text-gray-300">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        {log.marksDeducted > 0 && (
                          <span className="text-xs font-bold text-red-500 shrink-0">–{log.marksDeducted}pts</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
