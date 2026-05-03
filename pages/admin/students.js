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

export default function AdminStudents() {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cls, setCls] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
        return;
      }
      fetchStudents();
    }
  }, [user, loading]);

  function fetchStudents() {
    axios.get('/api/users/students', {
      headers: { Authorization: 'Bearer ' + getToken() },
    }).then(function(res) {
      setStudents(res.data.students);
    }).catch(function() {
      toast.error('Failed to load students');
    }).finally(function() {
      setFetching(false);
    });
  }

  function handleAddStudent(e) {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error('Name, email, phone and password are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    axios.post('/api/admin/add-student', {
      name: name, email: email, phone: phone,
      password: password, class: cls, location: location,
    }, {
      headers: { Authorization: 'Bearer ' + getToken() },
    }).then(function() {
      toast.success('Student added successfully!');
      setName(''); setEmail(''); setPhone('');
      setPassword(''); setCls(''); setLocation('');
      setShowForm(false);
      fetchStudents();
    }).catch(function(err) {
      var msg = err.response && err.response.data ? err.response.data.error : 'Failed to add student';
      toast.error(msg);
    }).finally(function() {
      setSaving(false);
    });
  }

  function toggleActive(id, currentStatus) {
    axios.put('/api/users/' + id, { isActive: !currentStatus }, {
      headers: { Authorization: 'Bearer ' + getToken() },
    }).then(function() {
      setStudents(function(prev) {
        return prev.map(function(s) {
          return s._id === id ? Object.assign({}, s, { isActive: !currentStatus }) : s;
        });
      });
      toast.success(currentStatus ? 'Student deactivated' : 'Student activated');
    }).catch(function() {
      toast.error('Update failed');
    });
  }

  var filtered = students.filter(function(s) {
    var q = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(search))
    );
  });

  var locColor = {
    Ranihati: '#1A6FD4', Bauria: '#7C3AED', Uluberia: '#059669',
    'Khalisani Kalitala': '#D97706', Online: '#0891B2', Other: '#6B7280',
  };

  var inputStyle = { border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' };

  return (
    <div>
      <Head><title>Students - Admin</title></Head>
      <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: 'var(--font-body)' }}>

        <div className="h-14 flex items-center gap-4 px-6 shadow-sm" style={{ background: '#0B1E3D' }}>
          <Link href="/admin" className="text-blue-300 hover:text-white transition flex items-center gap-1.5 text-sm">
            <HiArrowLeft /> Dashboard
          </Link>
          <span className="text-white font-semibold">Students</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">{students.length} total</span>
          <div className="ml-auto">
            <button
              onClick={function() { setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1A6FD4' }}
            >
              <HiUserAdd size={16} /> Add Student
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="relative mb-6">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              value={search}
              onChange={function(e) { setSearch(e.target.value); }}
              placeholder="Search by name, email or phone..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: 'white', border: '1.5px solid rgba(11,30,61,0.08)', boxShadow: '0 4px 24px rgba(11,30,61,0.08)' }}
            />
          </div>

          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">👥</p>
              <p className="text-gray-500 mb-4">No students found</p>
              <button onClick={function() { setShowForm(true); }} className="btn-primary">+ Add First Student</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(function(s, i) {
                return (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-5 rounded-2xl"
                    style={{ background: 'white', boxShadow: '0 4px 24px rgba(11,30,61,0.08)', opacity: s.isActive ? 1 : 0.6 }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                          {s.name ? s.name[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.class || 'Class not set'}</p>
                        </div>
                      </div>
                      <button
                        onClick={function() { toggleActive(s._id, s.isActive); }}
                        className="p-1.5 rounded-lg transition"
                        style={{ background: s.isActive ? '#FEF2F2' : '#ECFDF5' }}
                      >
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
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: (locColor[s.location] || '#6B7280') + '20', color: locColor[s.location] || '#6B7280' }}>
                          {s.location}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium ml-auto"
                        style={{ background: s.isActive ? '#ECFDF5' : '#F3F4F6', color: s.isActive ? '#059669' : '#9CA3AF' }}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-gray-300" style={{ borderColor: 'rgba(11,30,61,0.06)' }}>
                      Joined {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(11,30,61,0.75)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                className="w-full max-w-md p-6 rounded-3xl"
                style={{ background: 'white' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: '#0B1E3D' }}>Add New Student</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Student will login with these credentials</p>
                  </div>
                  <button onClick={function() { setShowForm(false); }} className="text-gray-400 text-xl">x</button>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      type="text" value={name}
                      onChange={function(e) { setName(e.target.value); }}
                      placeholder="Student full name"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input
                        type="email" value={email}
                        onChange={function(e) { setEmail(e.target.value); }}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                      <input
                        type="tel" value={phone}
                        onChange={function(e) { setPhone(e.target.value); }}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                      <select value={cls} onChange={function(e) { setCls(e.target.value); }}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}>
                        <option value="">Select...</option>
                        {classes.map(function(c) { return <option key={c}>{c}</option>; })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Centre</label>
                      <select value={location} onChange={function(e) { setLocation(e.target.value); }}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputStyle}>
                        <option value="">Select...</option>
                        {locations.map(function(l) { return <option key={l}>{l}</option>; })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'} value={password}
                        onChange={function(e) { setPassword(e.target.value); }}
                        placeholder="Set login password (min 6 chars)"
                        className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none"
                        style={inputStyle}
                      />
                      <button type="button" onClick={function() { setShowPass(!showPass); }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <HiEyeOff size={17} /> : <HiEye size={17} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Share these credentials with the student to login</p>
                  </div>

                  {email && password && (
                    <div className="p-3 rounded-xl text-xs" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <p className="font-semibold text-green-700 mb-1">Credentials to share:</p>
                      <p className="text-green-600">Email: {email}</p>
                      <p className="text-green-600">Password: {password}</p>
                      <p className="text-green-600">Login at: sm-physics.vercel.app/login</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={function() { setShowForm(false); }}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium text-gray-600">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Adding...' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
