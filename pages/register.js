import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiMail, HiLockClosed, HiUser, HiPhone, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const classes = ['Class 11', 'Class 12', 'Dropper', 'Other'];
const locations = ['Ranihati', 'Bauria', 'Uluberia', 'Khalisani Kalitala', 'Online', 'Other'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', class: '', location: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password are required');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, class: form.class, location: form.location,
      });
      toast.success(`Welcome to SM Physics, ${data.user.name}!`);
      router.push('/test');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    border: '1.5px solid #E5E7EB',
    fontFamily: 'var(--font-body)',
  };

  const InputField = ({ icon: Icon, field, type = 'text', placeholder, label, children, rightEl }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>{label}</label>
      {children || (
        <div className="relative">
          {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />}
          <input
            type={type}
            value={form[field]}
            onChange={handleChange(field)}
            placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${rightEl ? 'pr-11' : 'pr-4'} py-3 rounded-xl border text-sm outline-none transition-all`}
            style={inputBase}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          />
          {rightEl}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Head><title>Register – SM Physics</title></Head>
      <div className="min-h-screen flex" style={{ background: 'var(--color-cream)' }}>
        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-center px-14"
          style={{ background: 'linear-gradient(135deg, #0B1E3D 0%, #0D4B9E 100%)' }}>
          {[
            { size: 250, top: '5%', left: '-8%', color: '#4A9AFF', dur: '11s', del: '0s' },
            { size: 180, bottom: '15%', right: '-4%', color: '#D4A017', dur: '14s', del: '2s' },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: p.size, height: p.size, top: p.top, left: p.left, right: p.right, bottom: p.bottom,
                background: `radial-gradient(circle, ${p.color}22, transparent 70%)`,
                animation: `float ${p.dur} ease-in-out infinite`, animationDelay: p.del,
              }} />
          ))}

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                <HiAcademicCap className="text-white text-xl" />
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
                SM <span style={{ color: '#4A9AFF' }}>Physics</span>
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Start Your<br /><em style={{ color: '#4A9AFF' }}>Journey</em><br />Today
            </h2>
            <p className="text-blue-200/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Register for free to access Computer-Based Tests, track your progress, and compete with the best students in Howrah.
            </p>
            <div className="mt-10 space-y-3">
              {['✅ Free CBT Practice Tests', '✅ Live Score Analytics', '✅ JEE / NEET Pattern Papers', '✅ Anti-cheat Proctored Exams'].map((b) => (
                <p key={b} className="text-blue-200 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{b}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                <HiAcademicCap className="text-white" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>SM Physics</span>
            </Link>

            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
              Create Account
            </h1>
            <p className="text-gray-500 text-sm mb-7" style={{ fontFamily: 'var(--font-body)' }}>
              Already registered?{' '}
              <Link href="/login" className="font-medium" style={{ color: 'var(--color-blue)' }}>Sign in</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField icon={HiUser} field="name" label="Full Name" placeholder="Arjun Sharma" />
                <InputField icon={HiPhone} field="phone" label="Phone" placeholder="+91 9876543210" />
              </div>
              <InputField icon={HiMail} field="email" type="email" label="Email Address" placeholder="you@example.com" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Class</label>
                  <select value={form.class} onChange={handleChange('class')}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputBase}>
                    <option value="">Select...</option>
                    {classes.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Centre</label>
                  <select value={form.location} onChange={handleChange('location')}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={inputBase}>
                    <option value="">Select...</option>
                    {locations.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange('password')}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border text-sm outline-none transition-all" style={inputBase}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <HiEyeOff size={17} /> : <HiEye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input type="password" value={form.confirm} onChange={handleChange('confirm')}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all" style={inputBase}
                    onFocus={(e) => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? '#EF4444' : 'var(--color-blue)'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)',
                  boxShadow: '0 4px 20px rgba(26,111,212,0.35)',
                  opacity: loading ? 0.75 : 1,
                }}>
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5" style={{ fontFamily: 'var(--font-body)' }}>
              By registering you agree to our{' '}
              <span className="underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
