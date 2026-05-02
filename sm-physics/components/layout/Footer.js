import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';

const footerLinks = [
  {
    title: 'Navigation',
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
      { href: '/locations', label: 'Locations' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Student',
    links: [
      { href: '/register', label: 'Register' },
      { href: '/login', label: 'Login' },
      { href: '/test', label: 'Take a Test' },
    ],
  },
  {
    title: 'Centres',
    links: [
      { href: '/locations#ranihati', label: 'Ranihati' },
      { href: '/locations#bauria', label: 'Bauria' },
      { href: '/locations#uluberia', label: 'Uluberia' },
      { href: '/locations#khalisani', label: 'Khalisani Kalitala' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'var(--color-navy)' }}
    >
      {/* Decorative top border */}
      <div className="h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(26,111,212,0.6), rgba(212,160,23,0.4), transparent)',
      }} />

      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'rgba(26,111,212,0.06)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)' }}>
                <HiAcademicCap className="text-white text-2xl" />
              </div>
              <div>
                <span className="font-display font-bold text-2xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  SM <span style={{ color: '#4A9AFF' }}>Physics</span>
                </span>
                <p className="text-xs text-gray-400 -mt-0.5">Excellence in Education</p>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              Nurturing the next generation of scientists and engineers through expert physics coaching since 2015. JEE · NEET · WBJEE.
            </p>

            <div className="space-y-2.5 mb-6">
              <a href="tel:+918961177121" className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors text-sm">
                <HiPhone className="text-blue-500 shrink-0" />
                +91 89611 77121
              </a>
              <a href="tel:+919432586817" className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors text-sm">
                <HiPhone className="text-blue-500 shrink-0" />
                +91 94325 86817
              </a>
              <a href="mailto:info@smphysics.in" className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors text-sm">
                <HiMail className="text-blue-500 shrink-0" />
                info@smphysics.in
              </a>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <HiLocationMarker className="text-blue-500 shrink-0" />
                Uluberia, Howrah, West Bengal
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaFacebook, href: '#', color: '#1877F2' },
                { icon: FaInstagram, href: '#', color: '#E1306C' },
                { icon: FaYoutube, href: '#', color: '#FF0000' },
                { icon: FaWhatsapp, href: 'https://wa.me/918961177121', color: '#25D366' },
              ].map(({ icon: Icon, href, color }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon style={{ color }} size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase"
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.08em' }}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            © {currentYear} SM Physics. All rights reserved.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span className="text-gray-500">Designed & Created by </span>
            <span
              className="font-semibold"
              style={{ background: 'linear-gradient(135deg, #4A9AFF, #D4A017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Hasib Mallick
            </span>
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
