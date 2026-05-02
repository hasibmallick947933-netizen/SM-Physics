import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { HiPhone, HiMail, HiLocationMarker, HiChatAlt2 } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll reply within 24 hours.');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setSending(false);
  };

  const contacts = [
    {
      icon: HiPhone,
      label: 'Phone (Primary)',
      value: '+91 89611 77121',
      href: 'tel:+918961177121',
      color: '#1A6FD4',
      sub: 'Call or WhatsApp · Mon–Sat 8AM–8PM',
    },
    {
      icon: HiPhone,
      label: 'Phone (Secondary)',
      value: '+91 94325 86817',
      href: 'tel:+919432586817',
      color: '#7C3AED',
      sub: 'Queries, Admissions · Mon–Sat',
    },
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      value: 'Chat on WhatsApp',
      href: 'https://wa.me/918961177121',
      color: '#25D366',
      sub: 'Quick responses during working hours',
    },
    {
      icon: HiMail,
      label: 'Email',
      value: 'info@smphysics.in',
      href: 'mailto:info@smphysics.in',
      color: '#D97706',
      sub: 'For formal queries and documents',
    },
    {
      icon: HiLocationMarker,
      label: 'Main Centre',
      value: 'Uluberia, Howrah, WB',
      href: 'https://maps.google.com/?q=Uluberia,Howrah',
      color: '#059669',
      sub: 'Near Uluberia Municipality Office',
    },
  ];

  return (
    <>
      <Head><title>Contact SM Physics</title></Head>
      <Layout>
        {/* Hero */}
        <section className="py-20 px-4 text-center"
          style={{ background: 'linear-gradient(135deg, #0B1E3D, #122B56)' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Get in{' '}
            <span style={{ background: 'linear-gradient(135deg, #4A9AFF, #D4A017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Touch
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-blue-200/70 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}>
            Have questions about admissions, batches, or our CBT system? We&apos;re always happy to help.
          </motion.p>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact info */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy)' }}>
                  Contact Information
                </h2>
                {contacts.map((c, i) => (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 rounded-2xl group transition-all duration-200"
                    style={{ background: 'white', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(11,30,61,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${c.color}12` }}>
                      <c.icon style={{ color: c.color, fontSize: '18px' }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium" style={{ fontFamily: 'var(--font-body)' }}>{c.label}</p>
                      <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{c.value}</p>
                      <p className="text-xs text-gray-400">{c.sub}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Contact form */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-8 rounded-3xl"
                  style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <HiChatAlt2 className="text-blue-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                      Send a Message
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { field: 'name', label: 'Your Name', placeholder: 'Arjun Sharma', type: 'text' },
                        { field: 'phone', label: 'Phone Number', placeholder: '+91 9876543210', type: 'tel' },
                      ].map(({ field, label, placeholder, type }) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                            {label}
                          </label>
                          <input
                            type={type}
                            value={form[field]}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                            style={{ border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input type="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="arjun@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                      <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                        style={{ border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' }}>
                        <option value="">Select a topic...</option>
                        <option>Admission Enquiry</option>
                        <option>Batch Schedule</option>
                        <option>Fee Structure</option>
                        <option>CBT / Online Test</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={4} placeholder="Write your message here..."
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                        style={{ border: '1.5px solid #E5E7EB', fontFamily: 'var(--font-body)' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                    </div>
                    <button type="submit" disabled={sending}
                      className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300"
                      style={{ background: 'linear-gradient(135deg, #1A6FD4, #4A9AFF)', opacity: sending ? 0.7 : 1 }}>
                      {sending ? 'Sending...' : 'Send Message →'}
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
