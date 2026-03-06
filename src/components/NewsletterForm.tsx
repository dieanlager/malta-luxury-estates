import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Loader2, Mail, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NewsletterForm = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus('success');
            setEmail('');
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                    >
                        <CheckCircle2 className="text-emerald-500 mx-auto mb-3" size={32} />
                        <h4 className="text-white font-serif text-lg mb-1">{t('footer.newsletter.success_title')}</h4>
                        <p className="text-white/50 text-xs leading-relaxed">{t('footer.newsletter.success_message')}</p>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                placeholder={t('footer.newsletter.placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
                            />
                        </div>

                        <button
                            disabled={status === 'loading'}
                            className="w-full gold-gradient text-luxury-black font-bold uppercase tracking-[0.2em] text-[10px] py-4 rounded-2xl shadow-xl shadow-gold/10 hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    {t('common.join_list')}
                                    <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-white/20 mt-4">
                            <Shield size={10} />
                            {t('common.privacy_guaranteed')}
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};
