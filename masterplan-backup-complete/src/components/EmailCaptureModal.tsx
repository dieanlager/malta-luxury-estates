import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Bell, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface EmailCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    favoritesCount: number;
}

export const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
    isOpen,
    onClose,
    favoritesCount,
}) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

        // Save email for alerts
        const alertsData = {
            email,
            createdAt: new Date().toISOString(),
            source: 'favorites_capture',
        };

        const existing = JSON.parse(localStorage.getItem('mle_alert_subscribers') || '[]');
        existing.push(alertsData);
        localStorage.setItem('mle_alert_subscribers', JSON.stringify(existing));
        localStorage.setItem('mle_email_captured', 'true');

        setIsSubmitted(true);

        // Auto-close after 3 seconds
        setTimeout(() => {
            onClose();
        }, 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-luxury-black/80 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md overflow-hidden"
                    >
                        {/* Decorative top bar */}
                        <div className="gold-gradient h-1 rounded-t-3xl" />

                        <div className="bg-[#111] rounded-b-3xl border border-white/10 border-t-0 p-8">
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X size={14} />
                            </button>

                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-400" size={32} />
                                    </div>
                                    <h4 className="text-xl font-serif mb-2">You're All Set!</h4>
                                    <p className="text-white/40 text-sm">
                                        We'll notify you when similar properties become available.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <Heart className="text-red-400" size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-serif">You've saved {favoritesCount} properties!</h3>
                                            <p className="text-white/40 text-xs">Never miss a similar listing</p>
                                        </div>
                                    </div>

                                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                        Get <span className="text-gold font-semibold">instant email alerts</span> when new properties matching your taste are listed. Be the first to know.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-gold transition-colors placeholder:text-white/20"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full gold-gradient text-luxury-black py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
                                        >
                                            <Bell size={16} />
                                            Get Property Alerts
                                        </button>
                                    </form>

                                    <button
                                        onClick={onClose}
                                        className="w-full text-center text-white/30 text-xs mt-4 hover:text-white/50 transition-colors"
                                    >
                                        No thanks, maybe later
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
