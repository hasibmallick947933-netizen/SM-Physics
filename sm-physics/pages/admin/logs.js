import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { HiArrowLeft, HiShieldExclamation, HiFilter } from 'react-icons/hi';

export default function AdminLogs() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchLogs();
    }
  }, [user, loading]);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLogs(data.recentLogs || []);
    } catch { } finally { setFetching(false); }
  };

  const severityColor = { low: '#059669', medium: '#D97706', high: '#DC2626', critical: '#7C2D12' };
  const eventIcon = {
    'tab-switch': '🔄', 'window-blur': '👁️', 'window-minimize': '📐',
    'copy-attempt': '📋', 'paste-attempt': '📌', 'right-click': '🖱️',
    'auto-submitted': '🚨', 'cheating-detected': '⛔', 'test-started': '▶️',
    'test-submitted': '✅', 'screen-capture': '📸', 'fullscreen-exit': '🔲',
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.eventType === filter);

  const eventTypes = [...new Set(logs.map(l => l.eventType))];

  return (
    <>
      <Head><title>Activity Logs – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Activity Logs</span>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Filter bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6 p-4 rounded-2xl flex-wrap"
            style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
            <HiFilter className="text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">Filter:</span>
            <button onClick={() => setFilter('all')}
              className="px-3 py-1 rounded-full text-xs font-medium transition"
              style={{ background: filter === 'all' ? 'var(--color-navy)' : '#F3F4F6', color: filter === 'all' ? 'white' : '#6B7280' }}>
              All ({logs.length})
            </button>
            {eventTypes.map(et => (
              <button key={et} onClick={() => setFilter(et)}
                className="px-3 py-1 rounded-full text-xs font-medium transition capitalize"
                style={{ background: filter === et ? '#EFF6FF' : '#F3F4F6', color: filter === et ? '#1D4ED8' : '#6B7280' }}>
                {eventIcon[et]} {et.replace(/-/g, ' ')}
              </button>
            ))}
          </motion.div>

          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading logs...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">✅</p>
              <p className="text-gray-500 font-medium">No logs found</p>
              <p className="text-gray-400 text-sm mt-1">No activity matching the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((log, i) => (
                <motion.div key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-4 rounded-2xl flex items-start gap-4"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)', borderLeft: `3px solid ${severityColor[log.severity] || '#D97706'}` }}>
                  <span className="text-xl shrink-0">{eventIcon[log.eventType] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{log.student?.name}</span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-500">{log.student?.email}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{log.description || log.eventType}</p>
                    <p className="text-xs text-gray-400">{log.test?.title}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className="block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${severityColor[log.severity]}15`, color: severityColor[log.severity] }}>
                      {log.severity}
                    </span>
                    {log.marksDeducted > 0 && (
                      <span className="block text-xs font-bold text-red-500">–{log.marksDeducted} marks</span>
                    )}
                    <span className="block text-[10px] text-gray-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
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
