import Head from 'next/head';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Layout from '../components/layout/Layout';
import { HiLocationMarker, HiPhone, HiClock, HiUsers } from 'react-icons/hi';

const centres = [
  {
    id: 'ranihati',
    name: 'Ranihati Centre',
    address: 'Near Ranihati Bus Stand, Howrah, West Bengal',
    phone: '+91 89611 77121',
    timings: 'Mon–Sat: 8 AM – 8 PM',
    batchSize: '20-25 students/batch',
    classes: ['Class 11', 'Class 12', 'Dropper Batch'],
    color: '#1A6FD4',
    gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    mapUrl: 'https://maps.google.com/?q=Ranihati,Howrah,West+Bengal',
    highlights: ['JEE Mains & Advanced', 'WBJEE Focused', 'Weekend Special Batches'],
  },
  {
    id: 'bauria',
    name: 'Bauria Centre',
    address: 'Near Bauria Railway Station, Howrah, West Bengal',
    phone: '+91 94325 86817',
    timings: 'Mon–Sat: 7 AM – 9 PM',
    batchSize: '15-20 students/batch',
    classes: ['Class 11', 'Class 12', 'NEET Batch'],
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    mapUrl: 'https://maps.google.com/?q=Bauria,Howrah,West+Bengal',
    highlights: ['NEET Preparation', 'Physics + Chemistry', 'Personal Mentoring'],
  },
  {
    id: 'uluberia',
    name: 'Uluberia Centre',
    address: 'Near Uluberia Municipality, Howrah, West Bengal',
    phone: '+91 89611 77121',
    timings: 'Mon–Sun: 6 AM – 9 PM',
    batchSize: '25-30 students/batch',
    classes: ['Class 11', 'Class 12', 'Dropper Batch', 'Class 9-10'],
    color: '#059669',
    gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
    mapUrl: 'https://maps.google.com/?q=Uluberia,Howrah,West+Bengal',
    highlights: ['Main Centre', 'CBT Lab Available', 'All Exam Patterns'],
  },
  {
    id: 'khalisani',
    name: 'Khalisani Kalitala',
    address: 'Khalisani Kalitala Area, Howrah, West Bengal',
    phone: '+91 94325 86817',
    timings: 'Mon–Sat: 8 AM – 8 PM',
    batchSize: '15-20 students/batch',
    classes: ['Class 11', 'Class 12'],
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
    mapUrl: 'https://maps.google.com/?q=Khalisani+Kalitala,Howrah,West+Bengal',
    highlights: ['JEE Focused', 'Weekend Crash Courses', 'Online + Offline'],
  },
];

function CentreCard({ centre, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      id={centre.id}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-3xl overflow-hidden"
      style={{ background: 'white', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(11,30,61,0.05)' }}
    >
      {/* Header */}
      <div className="p-6 pb-5" style={{ background: centre.gradient }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: centre.color }}>
              <HiLocationMarker className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                {centre.name}
              </h3>
              <p className="text-gray-500 text-xs">{centre.address}</p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: `${centre.color}15`, color: centre.color }}>
            Active
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <HiPhone style={{ color: centre.color, flexShrink: 0 }} />
            <a href={`tel:${centre.phone}`} className="hover:underline">{centre.phone}</a>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <HiClock style={{ color: centre.color, flexShrink: 0 }} />
            <span>{centre.timings}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <HiUsers style={{ color: centre.color, flexShrink: 0 }} />
            <span>{centre.batchSize}</span>
          </div>
        </div>

        {/* Classes */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            Batches Available
          </p>
          <div className="flex flex-wrap gap-2">
            {centre.classes.map((cls) => (
              <span key={cls} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${centre.color}10`, color: centre.color }}>
                {cls}
              </span>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            Highlights
          </p>
          <ul className="space-y-1.5">
            {centre.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: centre.color }} />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Map button */}
        <a href={centre.mapUrl} target="_blank" rel="noopener noreferrer"
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium text-center block transition-all duration-200 hover:opacity-90"
          style={{ background: centre.color, color: 'white' }}>
          View on Map →
        </a>
      </div>
    </motion.div>
  );
}

export default function Locations() {
  const headRef = useRef(null);
  const inView = useInView(headRef, { once: true });

  return (
    <>
      <Head><title>Locations – SM Physics Coaching Centres</title></Head>
      <Layout>
        {/* Hero */}
        <section className="py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #0B1E3D, #122B56)' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Our <span style={{ background: 'linear-gradient(135deg, #4A9AFF, #D4A017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Centres
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-blue-200/70 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}>
            4 conveniently located centres across Howrah district, making quality coaching accessible to every student.
          </motion.p>
        </section>

        {/* Stats bar */}
        <div className="py-8 px-4" style={{ background: 'var(--color-cream)', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { n: '4', l: 'Centres' },
              { n: '2000+', l: 'Students Enrolled' },
              { n: '20+', l: 'Weekly Batches' },
              { n: '6 AM–9 PM', l: 'Operating Hours' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blue)' }}>{s.n}</p>
                <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {centres.map((c, i) => <CentreCard key={c.id} centre={c} index={i} />)}
            </div>

            {/* Contact note */}
            <motion.div
              ref={headRef}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mt-16 p-8 rounded-3xl text-center"
              style={{ background: 'var(--color-navy)', color: 'white' }}>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Can&apos;t decide which centre?
              </h3>
              <p className="text-blue-200/70 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                Call us and we&apos;ll help you find the most convenient batch.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="tel:+918961177121" className="btn-primary">📞 +91 89611 77121</a>
                <a href="tel:+919432586817" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                  📞 +91 94325 86817
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
}
