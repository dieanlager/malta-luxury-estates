import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Welcome to Malta Luxury Real Estate. I am your private intelligence assistant. How may I assist your property search or residency inquiries today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // In a real implementation, this would call /api/chat
            // For now, we simulate the intelligence based on the guide data
            const response = await simulateAIResponse(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I'm experiencing a temporary connection issue. Please try again or contact our specialists directly." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 left-8 z-[60] w-14 h-14 gold-gradient rounded-full shadow-2xl flex items-center justify-center text-luxury-black group"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                            <MessageSquare size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Glow Effect */}
                <span className="absolute inset-0 rounded-full bg-gold/50 blur-lg animate-pulse -z-10" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
                        className="fixed bottom-28 left-8 z-[60] w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] glass-card rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center relative">
                                    <Bot className="text-gold" size={20} />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-luxury-black" />
                                </div>
                                <div>
                                    <h3 className="text-white font-serif text-sm">Luxury Intelligence</h3>
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles size={10} className="text-gold" />
                                        <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">AI Concierge</span>
                                    </div>
                                </div>
                            </div>
                            <ShieldCheck className="text-white/20" size={18} />
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                            ? 'bg-gold-gradient text-luxury-black rounded-tr-none font-medium'
                                            : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'
                                        }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
                                        <Loader2 size={16} className="text-gold animate-spin" />
                                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Analyzing guides...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask about residency, taxes, or areas..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder-white/20 outline-none focus:border-gold/50 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gold/10 hover:bg-gold/20 flex items-center justify-center transition-all disabled:opacity-0"
                                >
                                    <Send size={16} className="text-gold" />
                                </button>
                            </div>
                            <p className="text-[9px] text-center text-white/20 mt-4 uppercase tracking-widest">
                                Powered by Malta Intelligence Hub
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ─── AI SIMULATION LOGIC ──────────────────────────────────────────────────────
// In a real app, this logic would be on the server using an LLM (Claude)
// We provide specific answers based on the site's expert guides.

async function simulateAIResponse(query: string): Promise<string> {
    await new Promise(r => setTimeout(r, 1500));
    const q = query.toLowerCase();

    if (q.includes('usa') || q.includes('american') || q.includes('citizen')) {
        if (q.includes('mdina') || q.includes('buy')) {
            return "As a US citizen, you can certainly buy property in Mdina. However, since Mdina is not a Special Designated Area (SDA), you would typically need an AIP (Acquisition of Immovable Property) permit. This permit is usually granted for a single primary residence with a minimum value (approx. €167,000 for apartments). For unrestricted multiple purchases, I recommend looking at SDAs like Tigne Point or Portomaso.";
        }
    }

    if (q.includes('sda') || q.includes('designated')) {
        return "Special Designated Areas (SDAs) like Portomaso Lagoon or Tigne Point are luxury developments where non-EU citizens can buy property with no AIP permit required, and can rent out the property immediately. This is the most popular route for high-end international investors.";
    }

    if (q.includes('tax') || q.includes('cost')) {
        return "Property transactions in Malta involve a 5% Stamp Duty for the buyer. On the selling side, there is typically an 8% Final Settlement Tax on the transfer value. If you are buying your first home in Malta, there are various stamp duty concessions available.";
    }

    if (q.includes('mprp') || q.includes('residency')) {
        return "The Malta Permanent Residency Programme (MPRP) requires a property purchase of at least €350,000 (or €300,000 in the South/Gozo) or a lease of €12,000/year. It's a fantastic way for families to gain EU residency through a real estate investment.";
    }

    return "That is an excellent question. Based on our 2026 Market Intelligence, the Maltese market is particularly favorable for that type of inquiry. To give you a precise legal and financial answer, would you like to speak with one of our specialized acquisition consultants?";
}
