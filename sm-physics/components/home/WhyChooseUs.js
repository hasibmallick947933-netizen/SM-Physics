import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '🔬',
    title: 'Concept-First Approach',
    desc: 'We build deep conceptual understanding before tackling problems — the foundation of true exam readiness.',
    color: '#1A6FD4',
    bg: '#EFF6FF',
  },
  {
    icon: '📊',
    title: 'Data-Driven Progress',
    desc: 'Track your performance with our CBT system. Identify weak areas and improve with targeted practice.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    icon: '⚡',
    title: 'JEE / NEET Focused',
    desc: 'Curriculum meticulously aligned with JEE Mains, JEE Advanced, NEET and WBJEE patterns.',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    icon: '🧠',
    title: 'Expert Faculty',
    desc: 'Taught by experienced educators with a decade of proven results across competitive exams.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: '📍',
    title: '4 Centre Locations',
    desc: 'Conveniently located centres at Ranihati, Bauria, Uluberia, and Khalisani Kalitala.',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    icon: '💻',
    title: 'Online CBT Practice',
    desc: 'JEE-pattern computer-based tests with real-time anti-cheat, timer, and detailed analytics.',
    color: '#0891B2',
    bg: '#ECFEFF',
  },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative p-6 rounded-2xl cursor-default"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid rgba(11,30,61,0.05)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}08, transparent 60%)` }} />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ background: feature.bg }}>
          {feature.icon}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: '1rem' }}>
          {feature.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          {feature.desc}
        </p>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.color}40, transparent)` }} />
    </motion.div>
  );
}

export default function WhyChooseUs() {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{
              background: 'rgba(26,111,212,0.08)',
              color: 'var(--color-blue)',
              fontFamily: 'var(--font-body)',
              border: '1px solid rgba(26,111,212,0.15)',
            }}>
            Why SM Physics?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
            Everything You Need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Excel
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
            A complete ecosystem designed to take students from confusion to confidence, and from average scores to top ranks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
