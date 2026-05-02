import Head from 'next/head';
import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const categories = ['All', 'Classrooms', 'Students', 'Events', 'Labs', 'Results'];

// Placeholder gallery items (in production these come from DB/Cloudinary)
const galleryItems = [
  { id: 1, category: 'Classrooms', title: 'Main Lecture Hall – Uluberia', color: '#1A6FD4', emoji: '🏛️', aspect: 'landscape' },
  { id: 2, category: 'Students', title: 'CBT Exam Session', color: '#7C3AED', emoji: '💻', aspect: 'landscape' },
  { id: 3, category: 'Results', title: 'JEE 2024 Selections', color: '#D97706', emoji: '🏆', aspect: 'portrait' },
  { id: 4, category: 'Events', title: 'Annual Physics Olympiad', color: '#059669', emoji: '🔬', aspect: 'landscape' },
  { id: 5, category: 'Classrooms', title: 'Bauria Study Room', color: '#DC2626', emoji: '📚', aspect: 'portrait' },
  { id: 6, category: 'Students', title: 'Batch of 2024 – Ranihati', color: '#0891B2', emoji: '👨‍🎓', aspect: 'landscape' },
  { id: 7, category: 'Labs', title: 'Physics Experiment Lab', color: '#1A6FD4', emoji: '⚗️', aspect: 'landscape' },
  { id: 8, category: 'Results', title: 'NEET 2024 Toppers', color: '#7C3AED', emoji: '⭐', aspect: 'portrait' },
  { id: 9, category: 'Events', title: 'Farewell Ceremony 2024', color: '#D97706', emoji: '🎓', aspect: 'landscape' },
  { id: 10, category: 'Students', title: 'Problem-Solving Session', color: '#059669', emoji: '🧮', aspect: 'landscape' },
  { id: 11, category: 'Classrooms', title: 'Khalisani Centre', color: '#DC2626', emoji: '🏫', aspect: 'portrait' },
  { id: 12, category: 'Labs', title: 'Optics Demonstration', color: '#0891B2', emoji: '🔭', aspect: 'landscape' },
  { id: 13, category: 'Results', title: 'WBJEE 2024 Ranks', color: '#1A6FD4', emoji: '📊', aspect: 'landscape' },
  { id: 14, category: 'Events', title: 'Parent-Teacher Meet', color: '#7C3AED', emoji: '🤝', aspect: 'landscape' },
  { id: 15, category: 'Students', title: 'Group Study – Uluberia', color: '#D97706', emoji: '📖', aspect: 'portrait' },
];

function GalleryCard({ item, index, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={() => onClick(item)}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
        item.aspect === 'portrait' ? 'row-span-2' : 'row-span-1'
      }`}
      style={{
        minHeight: item.aspect === 'portrait' ? '340px' : '200px',
        background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`,
        border: `1px solid ${item.color}30`,
      }}
    >
      {/* Simulated image */}
      <div className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${item.color}18 0%, ${item.color}35 100%)` }}>
        <span style={{ fontSize: item.aspect === 'portrait' ? '72px' : '56px' }}>{item.emoji}</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
        style={{ background: `linear-gradient(transparent 30%, ${item.color}CC)` }}>
        <div className="p-4 w-full">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {item.category}
          </span>
          <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
            {item.title}
          </p>
        </div>
      </div>

      {/* Category tag always visible */}
      <div className="absolute top-3 left-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: `${item.color}20`, color: item.color, backdropFilter: 'blur(8px)', border: `1px solid ${item.color}30` }}>
          {item.category}
        </span>
      </div>
    </motion.div>
  );
}

function Lightbox({ item, items, onClose, onPrev, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(11,30,61,0.95)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-3xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`, minHeight: '400px' }}>
          <div className="h-80 flex items-center justify-center">
            <span style={{ fontSize: '120px' }}>{item.emoji}</span>
          </div>
          <div className="p-6" style={{ background: 'rgba(11,30,61,0.6)' }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
              style={{ background: `${item.color}30`, color: item.color }}>
              {item.category}
            </span>
            <h3 className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {item.title}
            </h3>
            <p className="text-blue-200/60 text-sm mt-1">SM Physics Coaching Centre</p>
          </div>
        </div>

        {/* Controls */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <HiX size={18} />
        </button>
        <button onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <HiChevronLeft size={20} />
        </button>
        <button onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <HiChevronRight size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filtered = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter((g) => g.category === activeCategory);

  const openLightbox = (item) => setLightboxItem(item);
  const closeLightbox = () => setLightboxItem(null);

  const navigateLightbox = (dir) => {
    if (!lightboxItem) return;
    const idx = filtered.findIndex((i) => i.id === lightboxItem.id);
    const next = (idx + dir + filtered.length) % filtered.length;
    setLightboxItem(filtered[next]);
  };

  return (
    <>
      <Head><title>Gallery – SM Physics</title></Head>
      <Layout>
        {/* Hero */}
        <section className="py-20 px-4 text-center"
          style={{ background: 'linear-gradient(135deg, #0B1E3D, #122B56)' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Our{' '}
            <span style={{ background: 'linear-gradient(135deg, #4A9AFF, #D4A017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Gallery
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-blue-200/70 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}>
            A glimpse into the world of SM Physics — classrooms, labs, events, and the students who make it all worth it.
          </motion.p>
        </section>

        {/* Filter tabs */}
        <div className="sticky top-16 z-30 py-4 px-4 sm:px-6"
          style={{ background: 'rgba(250,247,240,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={activeCategory === cat
                  ? { background: 'var(--color-navy)', color: 'white', fontFamily: 'var(--font-body)' }
                  : { background: 'white', color: 'var(--color-navy)', border: '1px solid rgba(11,30,61,0.1)', fontFamily: 'var(--font-body)' }
                }
              >
                {cat}
                <span className="ml-1.5 text-xs opacity-60">
                  {cat === 'All' ? galleryItems.length : galleryItems.filter(g => g.category === cat).length}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Gallery grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]"
              >
                {filtered.map((item, i) => (
                  <GalleryCard key={item.id} item={item} index={i} onClick={openLightbox} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
                No images in this category yet.
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxItem && (
            <Lightbox
              item={lightboxItem}
              items={filtered}
              onClose={closeLightbox}
              onPrev={() => navigateLightbox(-1)}
              onNext={() => navigateLightbox(1)}
            />
          )}
        </AnimatePresence>
      </Layout>
    </>
  );
}
