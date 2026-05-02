import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export default function Layout({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-cream)', fontFamily: 'var(--font-body)' }}>
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1"
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
    </div>
  );
}
