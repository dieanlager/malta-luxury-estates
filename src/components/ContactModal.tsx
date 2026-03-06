import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Phone, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import type { ContactFormData } from '../hooks/useContactForm';

interface ContactModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    isSuccess: boolean;
    error: string | null;
    formData: ContactFormData;
    onClose: () => void;
    onUpdateField: (field: keyof ContactFormData, value: string) => void;
    onSubmit: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
    isOpen,
    isSubmitting,
    isSuccess,
    error,
    formData,
    onClose,
    onUpdateField,
    onSubmit,
}) => {
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
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-luxury-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-lg bg-[#111] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 pt-8 pb-4">
                            <div>
                                <h3 className="text-2xl font-serif">
                                    {formData.propertyTitle ? 'Enquire About This Property' : 'Contact Us'}
                                </h3>
                                {formData.propertyTitle && (
                                    <p className="text-gold text-sm mt-1 font-medium">{formData.propertyTitle}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 pb-8">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-green-400" size={32} />
                                    </div>
                                    <h4 className="text-xl font-serif mb-2">Inquiry Sent Successfully</h4>
                                    <p className="text-white/40 text-sm mb-8">
                                        We'll forward your inquiry to the agent. You should receive a response within 24 hours.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 gold-gradient text-luxury-black rounded-full text-xs font-bold uppercase tracking-widest"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    {error && (
                                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                                            <AlertCircle className="text-red-400 shrink-0" size={18} />
                                            <span className="text-red-300 text-sm">{error}</span>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Full Name *"
                                                value={formData.name}
                                                onChange={(e) => onUpdateField('name', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-gold transition-colors placeholder:text-white/20"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={(e) => onUpdateField('email', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-gold transition-colors placeholder:text-white/20"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number (optional)"
                                                value={formData.phone}
                                                onChange={(e) => onUpdateField('phone', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-gold transition-colors placeholder:text-white/20"
                                            />
                                        </div>

                                        {/* Message */}
                                        <textarea
                                            placeholder="Your message..."
                                            value={formData.message}
                                            onChange={(e) => onUpdateField('message', e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-gold transition-colors placeholder:text-white/20 resize-none"
                                        />

                                        {/* Submit */}
                                        <button
                                            onClick={onSubmit}
                                            disabled={isSubmitting}
                                            className="w-full gold-gradient text-luxury-black py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-luxury-black/20 border-t-luxury-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    Send Inquiry
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-white/20 text-center leading-relaxed">
                                            By submitting this form, you agree to our Privacy Policy. Your details will be shared with the listing agent.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
