import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

const testimonials = [
  {
    name: 'Arjun Sharma',
    exam: 'JEE Advanced 2024',
    rank: 'AIR 2847',
    avatar: 'A',
    color: '#1A6FD4',
    text: 'SM Physics transformed how I think about problems. The conceptual depth here is unmatched. I cleared JEE Advanced in my first attempt!',
    centre: 'Uluberia Centre',
  },
  {
    name: 'Priya Mondal',
    exam: 'NEET 2024',
    rank: 'Score: 680/720',
    avatar: 'P',
    color: '#7C3AED',
    text: 'The CBT practice tests were exactly like the real exam. The anti-cheat system and detailed score analysis helped me identify my weak topics.',
    centre: 'Bauria Centre',
  },
  {
    name: 'Rohan Das',
    exam: 'WBJEE 2024',
    rank: 'Rank: 234',
    avatar: 'R',
    color: '#059669',
    text: 'Best physics coaching in Howrah. The teacher explains every concept from scratch and never leaves any student behind. Highly recommended!',
    centre: 'Ranihati Centre',
  },
  {
    name: 'Sneha Ghosh',
    exam: 'JEE Mains 2024',
    rank: '98.7 Percentile',
    avatar: 'S',
    color: '#D97706',
    text: 'I had zero confidence in physics before joining. After just 6 months, I was scoring 90+ consistently. The results speak for themselves.',
    centre: 'Khalisani Centre',
  },
  {
    name: 'Mihir Roy',
    exam: 'JEE Advanced 2023',
    rank: 'AIR 1892',
    avatar: 'M',
    color: '#DC2626',
    text: 'The small batch size means you get personalized attention. Every doubt gets addressed. This coaching changed my life.',
    centre: 'Uluberia Centre',
  },
  {
    name: 'Ananya Pal',
    exam: 'NEET 2023',
    rank: 'Score: 710/720',
    avatar: 'N',
    color: '#0891B2',
    text: 'The online tests with the JEE-style interface prepared me perfectly for the real exam atmosphere. Excellent infrastructure!',
    centre: 'Bauria Centre',
  },
];

function TestimonialCard({ t, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group p-6 rounded-2xl h-full"
      style={{
        background: 'white',
        border: '1px solid rgba(11,30,61,0.06)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex text-yellow-400 mb-4">
        {[...Array(5)].map((_, i) => <HiStar key={i} size={14} />)}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-5" style={{ fontFamily: 'var(--font-body)' }}>
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
          {t.avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            {t.name}
          </p>
          <p className="text-xs text-gray-400">{t.exam} · <span className="font-medium" style={{ color: t.color }}>{t.rank}</span></p>
          <p className="text-xs text-gray-400">{t.centre}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const headRef = useRef(null);
  const isInView = useInView(headRef, { once: true });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(180deg, var(--color-cream) 0%, #EEF4FF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(26,111,212,0.08)', color: 'var(--color-blue)', border: '1px solid rgba(26,111,212,0.15)' }}>
            Student Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
            Results that{' '}
            <span style={{
              background: 'linear-gradient(135deg, #1A6FD4, #D4A017)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Speak
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
            Real achievements from real students who trusted SM Physics.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
