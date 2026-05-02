import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSearch, HiUser, HiPhone, HiMail, HiBan, HiCheckCircle } from 'react-icons/hi';

export default function AdminStudents() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchStudents();
    }
  }, [user, loading]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/users/students', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStudents(data.students);
    } catch { toast.error('Failed to load students'); }
    finally { setFetching(false); }
  };

  const toggleActive = async (studentId, currentStatus) => {
    try {
      await axios.put(`/api/users/${studentId}`, { isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStudents(prev => prev.map(s => s._id === studentId ? { ...s, isActive: !currentStatus } : s));
      toast.success(currentStatus ? 'Student deactivated' : 'Student activated');
    } catch { toast.error('Update failed'); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  const locationColor = {
    'Ranihati': '#1A6FD4', 'Bauria': '#7C3AED', 'Uluberia': '#059669',
    'Khalisani Kalitala': '#D97706', 'Online': '#0891B2', 'Other': '#6B7280',
  };

  return (
    <>
      <Head><title>Students – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Students</span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
            {students.length} total
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="relative mb-6">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: 'white', border: '1.5px solid rgba(11,30,61,0.08)', boxShadow: 'var(--shadow-card)' }}
            />
          </motion.div>

          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">👥</p>
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((s, i) => (
                <motion.div key={s._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)', opacity: s.isActive ? 1 : 0.6 }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.class || 'Class not set'}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleActive(s._id, s.isActive)}
                      className="p-1.5 rounded-lg transition"
                      style={{ background: s.isActive ? '#FEF2F2' : '#ECFDF5' }}
                      title={s.isActive ? 'Deactivate' : 'Activate'}>
                      {s.isActive
                        ? <HiBan size={15} className="text-red-500" />
                        : <HiCheckCircle size={15} className="text-green-500" />
                      }
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <HiMail size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <HiPhone size={12} className="text-gray-400 shrink-0" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {s.location && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          background: `${locationColor[s.location] || '#6B7280'}12`,
                          color: locationColor[s.location] || '#6B7280',
                        }}>
                        📍 {s.location}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium ml-auto"
                      style={{ background: s.isActive ? '#ECFDF5' : '#F3F4F6', color: s.isActive ? '#059669' : '#9CA3AF' }}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-gray-300" style={{ borderColor: 'rgba(11,30,61,0.06)' }}>
                    Joined {new Date(s.createdAt).toLocaleDateString()}
                    {s.lastLogin && ` · Last login ${new Date(s.lastLogin).toLocaleDateString()}`}
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
