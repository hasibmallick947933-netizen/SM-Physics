import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiArrowRight, HiPhone } from 'react-icons/hi';

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl text-white text-center px-8 py-16 md:py-20"
          style={{ background: 'linear-gradient(135deg, #0B1E3D 0%, #122B56 50%, #1A6FD4 100%)' }}
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(74,154,255,0.15)' }} />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(212,160,23,0.1)' }} />

          <div className="relative z-10">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-medium mb-4"
              style={{ background: 'rgba(74,154,255,0.15)', border: '1px solid rgba(74,154,255,0.25)', color: '#93C5FD' }}>
              Limited Seats Available
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to Crack Your Dream Exam?
            </h2>
            <p className="text-blue-200/70 text-lg max-w-2xl mx-auto mb-10" style={{ fontFamily: 'var(--font-body)' }}>
              Join thousands of students who transformed their performance with SM Physics. Your journey to JEE / NEET / WBJEE success starts here.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 group"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', boxShadow: '0 4px 30px rgba(26,111,212,0.5)' }}>
                Start Free Today
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="tel:+918961177121"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all duration-300 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.25)' }}>
                <HiPhone className="text-blue-400" />
                Call Us Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
