import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, Loader2, Mail, Phone, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '../lib/seo/meta';

export const ContactPage = () => {
  const { t, i18n } = useTranslation();
  usePageMeta({
    title: 'Contact Us | Malta Luxury Real Estate',
    description: 'Get in touch with our luxury property specialists. We respond within 24 hours.',
    canonicalPath: '/contact',
    currentLang: i18n.language,
    ogType: 'website',
    i18n,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Property Inquiry',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gold/50" />
            <span className="text-gold uppercase tracking-widest text-[10px] font-bold">
              {t('nav.contact')}
            </span>
            <div className="w-12 h-px bg-gold/50" />
          </div>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">
            Get in <span className="text-gold">Touch</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Our luxury property specialists are here to help. Reach out and we'll respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-2xl mb-4">Contact Information</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Whether you have a property inquiry, investment question, or simply want to learn more about the Maltese real estate market, we're here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Mail className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:info@maltaluxuryrealestate.com" className="text-white hover:text-gold transition-colors">
                    info@maltaluxuryrealestate.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Response Time</p>
                  <p className="text-white">Within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Phone className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Specialists Available</p>
                  <p className="text-white">Mon – Fri, 9:00 – 18:00 CET</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Our Promise</p>
              <p className="text-white/70 text-sm leading-relaxed">
                Every inquiry is handled by a verified Malta luxury real estate specialist — not a generic support team. Your inquiry deserves expert attention.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center justify-center min-h-[500px]"
              >
                <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                <h3 className="font-serif text-2xl text-white mb-2">Message Sent</h3>
                <p className="text-white/50 text-sm">
                  Thank you for reaching out. We'll be in touch within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Name *</label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-gold/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-gold/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Phone (optional)</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+356 ..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-gold/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold/50 transition-all appearance-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <option value="Property Inquiry">Property Inquiry</option>
                    <option value="General Question">General Question</option>
                    <option value="Investment Advice">Investment Advice</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-gold/50 transition-all resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm">Something went wrong. Please try again or email us directly.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full gold-gradient text-luxury-black font-bold uppercase tracking-[0.2em] text-[11px] py-4 rounded-xl shadow-xl shadow-gold/10 hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

