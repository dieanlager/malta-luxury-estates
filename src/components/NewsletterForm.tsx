'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Loader2, Mail, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const NewsletterForm = () => {
  const t = useTranslations('common');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
          >
            <CheckCircle2 className="text-emerald-500 mx-auto mb-3" size={32} />
            <p className="text-white/60 text-sm">
              {t('footer.newsletter.success_title', { defaultValue: 'You\'re subscribed!' })}
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-gold transition-colors" size={16} />
              <input
                type="email"
                required
                placeholder={t('footer.newsletter.placeholder', { defaultValue: 'your@email.com' })}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-gold/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full gold-gradient text-luxury-black font-bold uppercase tracking-[0.2em] text-[10px] py-3.5 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  {t('common.join_list', { defaultValue: 'Subscribe' })}
                  <Send size={12} />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-white/70">
              <Shield size={10} />
              {t('common.privacy_guaranteed', { defaultValue: 'No spam, unsubscribe anytime' })}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
