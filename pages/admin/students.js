import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSearch, HiUserAdd, HiBan, HiCheckCircle, HiPhone, HiMail, HiEye, HiEyeOff } from 'react-icons/hi';

const classes = ['Class 11', 'Class 12', 'Dropper', 'Other'];
const locations = ['Ranihati', 'Bauria', 'Uluberia', 'Khalisani Kalitala', 'Online', 'Other'];
const inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };
const fo = (e) => (e.target.style.borderColor = 'var(--color-blue)');
const fb = (e) => (e.target.style.borderColor = '#E5E7EB');
const defaultForm = { name: '', email: '', phone: '', password: '', class: '', location: '' };

export default function AdminStudents() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') { router.push('/login'); return; }
      fetchStudents();
    }
  }, [user, loading]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/users/students', { headers: { Authorization: `Bearer ${getToken()}` } });
      setStudents(data.students);
    } catch { toast.error('Failed to load students'); }
    finally { setFetching(false); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Name, email, phone and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await axios.post('/api/admin/add-student', form, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success('Student added successfully!');
      setForm(defaultForm); setShowForm(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add student');
    } finally { setSaving(false); }
  };

  const toggleActive = async (id, cur) => {
    try {
      await axios.put(`/api/users/${id}`, { isActive: !cur }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setStudents((prev) => prev.map((s) => s._id === id ? { ...s, isActive: !cur } : s));
      toast.success(cur ? 'Student deactivated' : 'Student activated');
    } catch { toast.error('Update failed'); }
  };

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  const locColor = { Ranihati: '#1A6FD4', Bauria: '#7C3AED', Uluberia: '#059669', 'Khalisani Kalitala': '#D97706', Online: '#0891B2', Other: '#6B7280' };

  return (
    <>
      <Head><title>Students – Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>
        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: 'var(--color-navy)' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm"><HiArrowLeft /> Dashboard</Link>
          <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Students</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">{students.length} total</span>
          <div className="ml-auto">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1A6FD4' }}>
              <HiUserAdd size={16} /> Add Student
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="relative mb-6">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or phone..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: 'white', border: '1.5px solid rgba(11,30,61,0.08)', boxShadow: 'var(--shadow-card)' }} />
          </div>

          {fetching ? <div className="text-center py-16 text-gray-400">Loading...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">👥</p>
              <p className="text-gray-500 mb-4">No students found</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">+ Add First Student</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="p-5 rounded-2xl" style={{ background: 'white', boxShadow: 'var(--shadow-card)', opacity: s.isActive ? 1 : 0.6 }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.class || 'Class not set'}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleActive(s._id, s.isActive)} className="p-1.5 rounded-lg transition" style={{ background: s.isActive ? '#FEF2F2' : '#ECFDF5' }}>
                      {s.isActive ? <HiBan size={15} className="text-red-500" /> : <HiCheckCircle size={15} className="text-green-500" />}
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2"><HiMail size={12} className="text-gray-400 shrink-0" /><span className="truncate">{s.email}</span></div>
                    {s.phone && <div className="flex items-center gap-2"><HiPhone size={12} className="text-gray-400 shrink-0" /><span>{s.phone}</span></div>}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {s.location && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${locColor[s.location] || '#6B7280'}12`, color: locColor[s.location] || '#6B7280' }}>
                        📍 {s.location}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium ml-auto" style={{ background: s.isActive ? '#ECFDF5' : '#F3F4F6', color: s.isActive ? '#059669' : '#9CA3AF' }}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-gray-300" style={{ borderColor: 'rgba(11,30,61,0.06)' }}>
                    Joined {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(11,30,61,0.75)', backdropFilter: 'blur(8px)' }}>
              <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                className="w-full max-w-md p-6 rounded-3xl" style={{ background: 'white' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>Add New Student</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Student will login with these credentials</p>
                  </div>
                  <button onClick={() => { setShowForm(false); setForm(defaultForm); }} className="text-gray-400 text-xl">✕</button>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Student's full name"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle} onFocus={fo} onBlur={fb} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input type="email" value={form.email} onChange={handleChange('email')} placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle} onFocus={fo} onBlur={fb} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                      <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+91 9876543210"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle} onFocus={fo} onBlur={fb} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                      <select value={form.class} onChange={handleChange('class')} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}>
                        <option value="">Select...</option>
                        {classes.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Centre</label>
                      <select value={form.location} onChange={handleChange('location')} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}>
                        <option value="">Select...</option>
                        {locations.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange('password')}
                        placeholder="Set login password (min 6 chars)"
                        className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none" style={inputStyle} onFocus={fo} onBlur={fb} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <HiEyeOff size={17} /> : <HiEye size={17} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Share these credentials with the student so they can login</p>
                  </div>

                  {form.email && form.password && (
                    <div className="p-3 rounded-xl text-xs" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <p className="font-semibold text-green-700 mb-1">📋 Credentials to share with student:</p>
                      <p className="text-green-600">📧 {form.email}</p>
                      <p className="text-green-600">🔑 {form.password}</p>
                      <p className="text-green-600">🌐 sm-physics.vercel.app/login</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setShowForm(false); setForm(defaultForm); }}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium text-gray-600">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Adding...' : '✓ Add Student'}
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
