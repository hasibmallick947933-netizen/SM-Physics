import '../styles/globals.css';
import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '../hooks/useAuth';

export default function App({ Component, pageProps, router }) {
  const cursorDot = useRef(null);
  const cursorRing = useRef(null);

  useEffect(() => {
    const dot = cursorDot.current;
    const ring = cursorRing.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(animate);
    };

    const onMouseEnterLink = () => {
      dot.style.width = '20px';
      dot.style.height = '20px';
      ring.style.width = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'var(--color-gold)';
    };

    const onMouseLeaveLink = () => {
      dot.style.width = '12px';
      dot.style.height = '12px';
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--color-blue)';
    };

    const links = document.querySelectorAll('a, button, [role="button"], .cursor-pointer');
    links.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterLink);
      el.addEventListener('mouseleave', onMouseLeaveLink);
    });

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <AuthProvider>
      {/* Custom cursor (desktop only) */}
      <div ref={cursorDot} className="custom-cursor hidden md:block" />
      <div ref={cursorRing} className="custom-cursor-ring hidden md:block" />

      <AnimatePresence mode="wait" initial={false}>
        <Component {...pageProps} key={router.pathname} />
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            borderRadius: '12px',
            background: '#fff',
            color: '#0B1E3D',
            boxShadow: '0 8px 30px rgba(11,30,61,0.12)',
            border: '1px solid rgba(26,111,212,0.12)',
          },
          success: { iconTheme: { primary: '#1A6FD4', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
