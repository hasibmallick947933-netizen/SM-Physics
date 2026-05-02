import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiArrowRight, HiPlay, HiStar, HiAcademicCap } from 'react-icons/hi';

const particles = [
  { size: 300, top: '10%', left: '-5%', duration: '12s', delay: '0s', color: '#1A6FD4' },
  { size: 200, top: '60%', right: '-8%', duration: '9s', delay: '2s', color: '#4A9AFF' },
  { size: 150, top: '30%', right: '20%', duration: '14s', delay: '4s', color: '#D4A017' },
  { size: 100, bottom: '20%', left: '15%', duration: '10s', delay: '1s', color: '#1A6FD4' },
];

const stats = [
  { number: '2000+', label: 'Students Taught' },
  { number: '98%', label: 'Selection Rate' },
  { number: '8+', label: 'Years Experience' },
  { number: '4', label: 'Centres' },
];

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0B1E3D 0%, #122B56 50%, #0D4B9E 100%)' }}
    >
      {/* Animated particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="hero-particle absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            background: `radial-gradient(circle, ${p.color}22, transparent 70%)`,
            '--duration': p.duration,
            '--delay': p.delay,
            animation: `float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            opacity: 0.5,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orb center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(26,111,212,0.15) 0%, transparent 70%)',
          animation: 'glow 5s ease-in-out infinite',
        }}
      />

      {/* Content */}
      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{
                  background: 'rgba(26,111,212,0.15)',
                  border: '1px solid rgba(74,154,255,0.3)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-300 text-sm font-medium">JEE · NEET · WBJEE Preparation</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6 text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Master{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #4A9AFF, #D4A017)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Physics
                </span>
                <br />
                <em>Like Never</em>
                <br />
                Before.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-blue-100/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Expert coaching that demystifies physics. Conceptual clarity, problem-solving mastery, and exam excellence — all under one roof.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Link href="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)',
                    boxShadow: '0 4px 30px rgba(26,111,212,0.45)',
                  }}>
                  Join Now — It&apos;s Free
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/about" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-blue-200 transition-all duration-300 hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                  <HiPlay className="text-blue-400" />
                  Learn More
                </Link>
              </motion.div>

              {/* Proof badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {['S', 'R', 'A', 'P', 'M'].map((letter, i) => (
                    <div key={i}
                      className="w-8 h-8 rounded-full border-2 border-blue-900 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `hsl(${200 + i * 30}, 70%, ${40 + i * 5}%)` }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => <HiStar key={i} />)}
                  </div>
                  <p className="text-blue-200 text-xs mt-0.5">Trusted by 2000+ students</p>
                </div>
              </motion.div>
            </div>

            {/* Right – Stats cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              {/* Main card */}
              <div className="relative">
                <div className="glass-card-dark p-8 rounded-3xl relative overflow-hidden"
                  style={{ border: '1px solid rgba(74,154,255,0.15)' }}>
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                    style={{ background: 'rgba(26,111,212,0.2)' }} />

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                      <HiAcademicCap className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        SM Physics
                      </h3>
                      <p className="text-blue-300 text-xs">Est. 2015 · West Bengal</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="text-3xl font-bold text-white mb-1"
                          style={{
                            fontFamily: 'var(--font-display)',
                            background: 'linear-gradient(135deg, #4A9AFF, #fff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}>
                          {stat.number}
                        </div>
                        <div className="text-blue-300 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Live indicator */}
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs">Live CBT Tests Available</span>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #D4A017, #F0C040)',
                    boxShadow: '0 8px 30px rgba(212,160,23,0.4)',
                  }}
                >
                  <p className="text-sm font-bold text-white">🏆 Top Ranked</p>
                  <p className="text-yellow-100 text-xs">Howrah District</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-blue-300/60 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-blue-400/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-blue-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
