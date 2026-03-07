import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Sparkles, ArrowRight, RefreshCcw,
    MapPin, Home, Coffee, Wine, Ship,
    Share2, Heart, CheckCircle2, Trophy,
    TrendingUp
} from 'lucide-react';
import { usePageMeta } from '../lib/seo/meta';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ─── Quiz Configuration ─────────────────────────────────────────────────────

interface Question {
    id: number;
    text: string;
    options: {
        id: string;
        text: string;
        icon: any;
        scores: Record<string, number>;
    }[];
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        text: "How do you envision your perfect morning?",
        options: [
            { id: 'a', text: "Coffee on a seafront balcony with harbor views", icon: Coffee, scores: { sliema: 10, apartment: 10, stjulians: 5 } },
            { id: 'b', text: "Stroll through quiet, historic limestone streets", icon: MapPin, scores: { valletta: 10, mdina: 10, houseOfCharacter: 10 } },
            { id: 'c', text: "A dip in your private pool overlooking Gozo's hills", icon: Ship, scores: { gozo: 15, villa: 10, farmHouse: 15 } },
            { id: 'd', text: "Waking up in a modern, smart-home penthouse", icon: Home, scores: { tigne: 10, penthouse: 15, modern: 10 } }
        ]
    },
    {
        id: 2,
        text: "What's your ideal Friday evening?",
        options: [
            { id: 'a', text: "Fine dining and social clubs in a vibrant hub", icon: Wine, scores: { stjulians: 10, sliema: 10, highEnd: 10 } },
            { id: 'b', text: "A quiet wine at a 400-year-old local 'Gozitan' farmhouse", icon: Wine, scores: { gozo: 10, farmHouse: 15, rustic: 10 } },
            { id: 'c', text: "Art gallery opening followed by a boutique jazz club", icon: Sparkles, scores: { valletta: 15, palazzo: 10, culture: 10 } },
            { id: 'd', text: "Hosting a sunset BBQ on a massive terrace", icon: Home, scores: { penthouse: 10, mellieha: 10, villa: 5 } }
        ]
    },
    {
        id: 3,
        text: "Choose your 'Malta Vibe':",
        options: [
            { id: 'a', text: "Cosmopolitan & High-Energy", icon: Sparkles, scores: { sliema: 10, stjulians: 10, modern: 10 } },
            { id: 'b', text: "Historic & Majestic", icon: Trophy, scores: { valletta: 10, mdina: 15, palazzo: 10 } },
            { id: 'c', text: "Serene & Mediterranean", icon: Ship, scores: { gozo: 10, mellieha: 5, village: 10 } },
            { id: 'd', text: "Exclusive & Gated", icon: CheckCircle2, scores: { madliena: 15, villa: 10, tigne: 5 } }
        ]
    },
    {
        id: 4,
        text: "What defines 'Luxury' for you?",
        options: [
            { id: 'a', text: "24/7 Concierge & Ultra-Modern Amenities", icon: CheckCircle2, scores: { sliema: 5, tigne: 15, penthouse: 10 } },
            { id: 'b', text: "Privacy, space, and a mature garden", icon: Home, scores: { madliena: 10, villa: 15, mellieha: 5 } },
            { id: 'c', text: "Unique architectural heritage and soul", icon: Heart, scores: { valletta: 5, houseOfCharacter: 15, palazzo: 15 } },
            { id: 'd', text: "Breathtaking, unobstructed sea views", icon: Ship, scores: { seafront: 15, penthouse: 5, sliema: 5 } }
        ]
    },
    {
        id: 5,
        text: "Your investment priority is...",
        options: [
            { id: 'a', text: "Maximum rental yield and liquidity", icon: TrendingUp, scores: { sliema: 10, stjulians: 10, apartment: 10 } },
            { id: 'b', text: "Long-term capital gains in emerging areas", icon: TrendingUp, scores: { gozo: 10, gzira: 10, investment: 10 } },
            { id: 'c', text: "A secondary residence/lifestyle trophy", icon: Trophy, scores: { villa: 10, palazzo: 10, prestigious: 10 } },
            { id: 'd', text: "A sustainable, green-certified home", icon: Sparkles, scores: { modern: 5, epcA: 15, green: 10 } }
        ]
    }
];

const RESULTS_MAP: Record<string, { title: string, area: string, type: string, description: string, image: string, slug: string }> = {
    sliema_stjulians: {
        title: "The Cosmopolitan Elite",
        area: "Sliema & St. Julian's",
        type: "Seafront Penthouse",
        description: "You love being where the action is. High-energy, luxury amenities, and the sparkling Mediterranean at your doorstep. Your lifestyle demands convenience, style, and the best nightspots on the island.",
        image: "https://images.unsplash.com/photo-1548543604-a87c9909aeec?auto=format&fit=crop&q=80&w=800",
        slug: "/properties/sliema"
    },
    valletta_mdina: {
        title: "The Heritage Collector",
        area: "Valletta & Mdina",
        type: "Converted Palazzo",
        description: "History isn't just a category for you; it's a way of life. You appreciate the soul of 400-year-old limestone walls, boutique culture, and the majestic silence of the Silent City.",
        image: "https://images.unsplash.com/photo-1596436889104-cf7503554481?auto=format&fit=crop&q=80&w=800",
        slug: "/properties/valletta"
    },
    gozo_farmhouse: {
        title: "The Mediterranean Soul",
        area: "Gozo Island",
        type: "Historic Farmhouse",
        description: "You seek serenity, authenticity, and space. Gozo is your sanctuary. You value the 'Bridge Effect' potential but prioritize the slow, beautiful pace of village life and rolling hills.",
        image: "https://images.unsplash.com/photo-1623190886577-d65be009fa3e?auto=format&fit=crop&q=80&w=800",
        slug: "/properties/victoria--gozo-"
    },
    madliena_villa: {
        title: "The Privacy Seeker",
        area: "Madliena & High Ridge",
        type: "Detached Villa with Pool",
        description: "Privacy is the ultimate luxury. You want space, mature gardens, and a gated-feel environment. You prefer the quiet prestige of Malta's most exclusive residential heights.",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
        slug: "/properties/all?type=villa"
    }
};

export const MaltaPropertyQuiz: React.FC = () => {
    const { t, i18n } = useTranslation();
    usePageMeta({
        title: t('seo:tools.quiz.title', 'Quiz: What Property Type Suits Your Malta Lifestyle? | Malta Luxury Real Estate'),
        description: t('seo:tools.quiz.description', 'Take our 1-minute interactive lifestyle quiz to discover your perfect Malta location and property type.'),
        canonicalPath: '/tools/property-quiz',
        currentLang: i18n.language,
    });

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleOptionClick = (optionScores: Record<string, number>) => {
        const newScores = { ...scores };
        Object.entries(optionScores).forEach(([key, val]) => {
            newScores[key] = (newScores[key] || 0) + val;
        });
        setScores(newScores);

        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setAnalyzing(true);
            setTimeout(() => {
                setAnalyzing(false);
                setIsFinished(true);
            }, 2000);
        }
    };

    const getResultKey = () => {
        const s = scores;
        if ((s.gozo || 0) > 15) return 'gozo_farmhouse';
        if ((s.valletta || 0) > 15 || (s.mdina || 0) > 15) return 'valletta_mdina';
        if ((s.madliena || 0) > 10 || (s.villa || 0) > 10) return 'madliena_villa';
        return 'sliema_stjulians';
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setScores({});
        setIsFinished(false);
    };

    const resultKey = isFinished ? getResultKey() : null;
    const resultContent = resultKey ? {
        ...RESULTS_MAP[resultKey],
        title: t(`common:quiz_content.results.${resultKey}.title`),
        area: t(`common:quiz_content.results.${resultKey}.area`),
        type: t(`common:quiz_content.results.${resultKey}.type`),
        description: t(`common:quiz_content.results.${resultKey}.description`),
    } : null;

    return (
        <main className="min-h-screen bg-luxury-black pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                {!isFinished && !analyzing && (
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> {t('quiz.interactive')}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">{t('quiz.title_part1')} <span className="text-gold italic">{t('quiz.title_part2')}</span> {t('quiz.title_part3')}</h1>
                        <p className="text-white/40">{t('quiz.subtitle')}</p>
                        <div className="mt-12 max-w-xs mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gold"
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentQuestion / QUESTIONS.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {analyzing ? (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="relative w-24 h-24 mb-10">
                                    <motion.div
                                        className="absolute inset-0 border-4 border-gold/20 border-t-gold rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-2 tracking-widest uppercase">{t('quiz.analyzing')}</h3>
                                <p className="text-white/20 text-sm">{t('quiz.analyzing_subtitle')}</p>
                            </motion.div>
                        ) : isFinished && resultKey && resultContent ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-[3rem] border border-white/10 overflow-hidden bg-black/40"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="h-64 md:h-auto overflow-hidden">
                                        <img src={resultContent.image} alt={resultContent.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-10 md:p-16">
                                        <div className="flex items-center gap-2 text-gold mb-6">
                                            <Trophy size={20} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('quiz.result_badge')}</span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">{resultContent.title}</h2>
                                        <div className="flex flex-col gap-4 mb-8">
                                            <div className="flex items-center gap-3 text-white/60">
                                                <MapPin size={16} className="text-gold" />
                                                <span className="text-sm font-medium">{resultContent.area}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-white/60">
                                                <Home size={16} className="text-gold" />
                                                <span className="text-sm font-medium">{resultContent.type}</span>
                                            </div>
                                        </div>
                                        <p className="text-white/40 leading-relaxed mb-10 text-sm italic">
                                            "{resultContent.description}"
                                        </p>
                                        <div className="flex flex-col gap-4">
                                            <Link to={resultContent.slug} className="w-full py-5 bg-gold text-luxury-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all text-center">
                                                {t('quiz.explore')}
                                            </Link>
                                            <button onClick={resetQuiz} className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors py-4">
                                                <RefreshCcw size={12} /> {t('quiz.take_again')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border-t border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                            <Share2 size={18} />
                                        </div>
                                        <p className="text-xs text-white/50">{t('quiz.share_desc')}</p>
                                    </div>
                                    <button className="px-8 py-3 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2">
                                        {t('quiz.copy_link')}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="text-center">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 block">{t('quiz.question_counter', { current: currentQuestion + 1, total: QUESTIONS.length })}</span>
                                    <h3 className="text-3xl md:text-5xl font-serif text-white">{t(`quiz_content.questions.${currentQuestion}.text`)}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {QUESTIONS[currentQuestion].options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionClick(option.scores)}
                                            className="group p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-gold/50 hover:bg-gold/5 transition-all text-left flex items-start gap-6 hover:scale-[1.02]"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-gold group-hover:text-luxury-black transition-all shrink-0">
                                                <option.icon size={20} />
                                            </div>
                                            <span className="text-lg text-white/70 group-hover:text-white transition-colors pt-2 leading-relaxed">
                                                {t(`quiz_content.questions.${currentQuestion}.options.${option.id}`)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!isFinished && (
                    <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/2">
                            <div className="text-gold mb-4"><CheckCircle2 size={24} /></div>
                            <h4 className="text-white font-serif mb-2">{t('quiz.bottom.fun_title')}</h4>
                            <p className="text-xs text-white/30 leading-relaxed">{t('quiz.bottom.fun_desc')}</p>
                        </div>
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/2">
                            <div className="text-gold mb-4"><TrendingUp size={24} /></div>
                            <h4 className="text-white font-serif mb-2">{t('quiz.bottom.market_title')}</h4>
                            <p className="text-xs text-white/30 leading-relaxed">{t('quiz.bottom.market_desc')}</p>
                        </div>
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/2">
                            <div className="text-gold mb-4"><MapPin size={24} /></div>
                            <h4 className="text-white font-serif mb-2">{t('quiz.bottom.area_title')}</h4>
                            <p className="text-xs text-white/30 leading-relaxed">{t('quiz.bottom.area_desc')}</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
