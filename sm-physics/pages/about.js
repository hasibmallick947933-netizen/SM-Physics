import Head from 'next/head';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Layout from '../components/layout/Layout';
import { HiAcademicCap, HiStar, HiUsers, HiLightBulb, HiBookOpen } from 'react-icons/hi';

const milestones = [
  { year: '2015', title: 'Founded', desc: 'SM Physics opened its first centre in Uluberia with a vision to make quality physics education accessible.' },
  { year: '2017', title: 'Expanded', desc: 'Second centre launched at Bauria following overwhelming demand. First batch of JEE selections.' },
  { year: '2019', title: 'Digital', desc: 'Introduced online study materials, video resources, and digital practice tests.' },
  { year: '2021', title: 'Grew', desc: 'Third and fourth centres at Ranihati and Khalisani Kalitala. 500+ active students.' },
  { year: '2024', title: 'CBT System', desc: 'Launched state-of-the-art Computer Based Test system with JEE-pattern interface and anti-cheat technology.' },
];

const values = [
  { icon: HiLightBulb, title: 'Conceptual Clarity', desc: 'We never teach formulas without understanding. Every concept is built from first principles.', color: '#D97706' },
  { icon: HiUsers, title: 'Personal Attention', desc: 'Small batch sizes ensure every student gets personalized guidance and doubt resolution.', color: '#1A6FD4' },
  { icon: HiBookOpen, title: 'Structured Curriculum', desc: 'Carefully sequenced topics aligned with JEE, NEET, and WBJEE exam patterns.', color: '#7C3AED' },
  { icon: HiStar, title: 'Proven Results', desc: 'Consistent top ranks and selections in competitive exams year after year.', color: '#059669' },
];

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <>
      <Head>
        <title>About SM Physics – Our Story & Mission</title>
      </Head>
      <Layout>
        {/* Hero */}
        <section className="relative py-24 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0B1E3D 0%, #122B56 100%)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }} />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: 'rgba(26,111,212,0.15)', border: '1px solid rgba(74,154,255,0.3)', color: '#93C5FD' }}>
              Our Story
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-white mb-5"
              style={{ fontFamily: 'var(--font-display)' }}>
              Shaping Future{' '}
              <span style={{
                background: 'linear-gradient(135deg, #4A9AFF, #D4A017)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Scientists</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-blue-200/70 text-lg max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-body)' }}>
              Since 2015, SM Physics has been the most trusted physics coaching centre in Howrah, West Bengal — transforming curious minds into exam toppers.
            </motion.p>
          </div>
        </section>

        {/* Teacher profile */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <div className="relative">
                  <div className="w-full aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0B1E3D, #1A6FD4)' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HiAcademicCap className="text-white/10" style={{ fontSize: '200px' }} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6"
                      style={{ background: 'linear-gradient(transparent, rgba(11,30,61,0.9))' }}>
                      <p className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        Suresh Mondal
                      </p>
                      <p className="text-blue-300 text-sm">Founder & Lead Faculty</p>
                    </div>
                  </div>
                  {/* Stat badge */}
                  <motion.div
                    animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -bottom-4 -right-4 px-5 py-3 rounded-2xl shadow-xl"
                    style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blue)' }}>10+</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>Years Teaching</p>
                  </motion.div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                  style={{ background: 'rgba(26,111,212,0.08)', color: 'var(--color-blue)', border: '1px solid rgba(26,111,212,0.15)' }}>
                  About the Founder
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                  Passion for Physics,<br />
                  <em>Passion for Students</em>
                </h2>
                <div className="space-y-4 text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  <p>
                    With a Masters in Physics and over a decade of teaching experience, our founder built SM Physics on a simple belief: every student can excel at physics if taught correctly.
                  </p>
                  <p>
                    Starting with just 12 students in a single room in Uluberia, the coaching has grown into a network of four centres serving over 2,000 students across Howrah district.
                  </p>
                  <p>
                    The focus has always been on building strong conceptual foundations, developing problem-solving intuition, and fostering confidence in students who once feared physics.
                  </p>
                </div>
                <div className="mt-6 flex gap-8">
                  {[
                    { n: 'M.Sc', l: 'Physics' },
                    { n: 'B.Ed', l: 'Education' },
                    { n: '2000+', l: 'Students' },
                    { n: '98%', l: 'Selection Rate' },
                  ].map((s) => (
                    <div key={s.n}>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blue)' }}>{s.n}</p>
                      <p className="text-xs text-gray-400">{s.l}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#EEF4FF' }}>
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                Our Core Values
              </h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <FadeIn key={v.title} delay={i * 0.08}>
                  <motion.div whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl text-center"
                    style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                    <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                      style={{ background: `${v.color}15` }}>
                      <v.icon style={{ color: v.color, fontSize: '24px' }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-body)' }}>{v.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{v.desc}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-3xl mx-auto">
            <FadeIn className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                Our Journey
              </h2>
            </FadeIn>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px"
                style={{ background: 'linear-gradient(to bottom, transparent, var(--color-blue), transparent)' }} />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <FadeIn key={m.year} delay={i * 0.1}>
                    <div className="flex gap-6 items-start">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 z-10"
                        style={{ background: 'var(--color-navy)' }}>
                        <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{m.year}</span>
                      </div>
                      <div className="pt-3">
                        <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-body)' }}>{m.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{m.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
