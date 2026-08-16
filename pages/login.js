import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') router.push('/admin');
      else router.push('/test');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Sign In – SM Physics</title></Head>
      <div className="min-h-screen flex" style={{ background: 'var(--color-cream)' }}>
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0B1E3D 0%, #122B56 60%, #0D4B9E 100%)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }} />
          {[
            { size: 280, top: '5%', left: '-10%', color: '#1A6FD4', dur: '10s', del: '0s' },
            { size: 200, bottom: '10%', right: '-5%', color: '#4A9AFF', dur: '13s', del: '3s' },
            { size: 150, top: '40%', right: '15%', color: '#D4A017', dur: '9s', del: '1.5s' },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size, height: p.size, top: p.top, left: p.left, right: p.right, bottom: p.bottom,
                background: `radial-gradient(circle, ${p.color}25, transparent 70%)`,
                animation: `float ${p.dur} ease-in-out infinite`,
                animationDelay: p.del,
              }} />
          ))}

          <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
            <Link href="/" className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                <HiAcademicCap className="text-white text-2xl" />
              </div>
              <div>
                <p className="font-bold text-2xl" style={{ fontFamily: 'var(--font-display)' }}>SM <span style={{ color: '#4A9AFF' }}>Physics</span></p>
                <p className="text-blue-300 text-xs">Excellence in Education</p>
              </div>
            </Link>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}>
              Welcome<br />Back,<br /><em style={{ color: '#4A9AFF' }}>Scholar</em>
            </motion.h2>
            <p className="text-blue-200/70 text-base max-w-xs leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Log in to access your CBT tests, track your scores, and continue your journey to exam success.
            </p>

            <div className="mt-10 flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex -space-x-2">
                {['A', 'S', 'P', 'R'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-900 flex items-center justify-center text-xs font-bold"
                    style={{ background: `hsl(${200 + i * 40}, 70%, 45%)`, color: 'white' }}>{l}</div>
                ))}
              </div>
              <p className="text-blue-200 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                Join 2000+ students already learning with SM Physics
              </p>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                <HiAcademicCap className="text-white" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                SM Physics
              </span>
            </Link>

            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
              Sign In
            </h1>
            <p className="text-gray-500 text-sm mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium" style={{ color: 'var(--color-blue)' }}>Register free</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Email</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 mt-6"
                style={{
                  background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)',
                  boxShadow: '0 4px 20px rgba(26,111,212,0.35)',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
                
            <p className="text-center text-xs text-gray-400 mt-6" style={{ fontFamily: 'var(--font-body)' }}>
              By signing in you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
