import Link from 'next/link';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head><title>404 – Page Not Found | SM Physics</title></Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #0B1E3D, #122B56)', fontFamily: 'var(--font-body)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl mb-6">⚛️</motion.p>

          <h1 className="text-8xl font-bold text-white mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #4A9AFF, #D4A017)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            This page is in a superposition
          </h2>
          <p className="text-blue-200/60 mb-10 max-w-sm">
            Like Schrödinger&apos;s cat, this page both exists and doesn&apos;t. Let&apos;s collapse the wave function back to safety.
          </p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', boxShadow: '0 4px 30px rgba(26,111,212,0.45)' }}>
            ← Return to Home
          </Link>
        </motion.div>
        <p className="absolute bottom-6 text-blue-200/30 text-xs">
          Designed by Hasib Mallick
        </p>
      </div>
    </>
  );
}
