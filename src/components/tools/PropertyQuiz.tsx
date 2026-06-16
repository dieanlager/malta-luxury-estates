'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { LOCATIONS } from '@/src/lib/locations';

const steps = [
  {
    id: 'budget',
    question: 'What is your budget?',
    options: [
      { value: '<500k', label: '< €500,000' },
      { value: '500k-1m', label: '€500K – €1M' },
      { value: '1m-3m', label: '€1M – €3M' },
      { value: '3m+', label: '€3M+' },
    ],
  },
  {
    id: 'type',
    question: 'What type of property?',
    options: [
      { value: 'Villa', label: 'Villa' },
      { value: 'Penthouse', label: 'Penthouse' },
      { value: 'Apartment', label: 'Apartment' },
      { value: 'Palazzo', label: 'Palazzo / Character' },
    ],
  },
  {
    id: 'island',
    question: 'Which island?',
    options: [
      { value: 'malta', label: 'Malta' },
      { value: 'gozo', label: 'Gozo' },
      { value: 'either', label: 'Either' },
    ],
  },
  {
    id: 'purpose',
    question: 'Primary purpose?',
    options: [
      { value: 'residence', label: 'Primary Residence' },
      { value: 'investment', label: 'Investment / Rental' },
      { value: 'holiday', label: 'Holiday Home' },
      { value: 'residency', label: 'Residency / MPRP' },
    ],
  },
];

export function PropertyQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const handleAnswer = (value: string) => {
    const updated = { ...answers, [steps[currentStep].id]: value };
    setAnswers(updated);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setDone(true);
    }
  };

  const getRecommendations = () => {
    const island = answers.island;
    const matching = LOCATIONS.filter(l => {
      if (island === 'gozo') return l.island === 'gozo';
      if (island === 'malta') return l.island === 'malta';
      return true;
    }).filter(l => l.isPopular).slice(0, 3);
    return matching;
  };

  if (done) {
    const recs = getRecommendations();
    return (
      <div className="glass-card p-10 rounded-3xl border border-gold/20 text-center">
        <div className="text-gold font-serif text-5xl mb-4">✓</div>
        <h2 className="font-serif text-3xl text-white mb-4">Your Matches</h2>
        <p className="text-white/50 mb-10">Based on your preferences, we recommend these locations:</p>
        <div className="grid gap-4 mb-10">
          {recs.map(loc => (
            <Link
              key={loc.slug}
              href={`/properties/${loc.slug}` as any}
              className="flex items-center justify-between p-5 border border-white/10 rounded-2xl hover:border-gold/30 hover:text-gold transition-all group"
            >
              <span className="font-serif text-xl text-white group-hover:text-gold">{loc.nameEn}</span>
              <span className="text-gold">→</span>
            </Link>
          ))}
        </div>
        <Link
          href="/properties/all"
          className="inline-block px-8 py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-full"
        >
          Browse All Properties
        </Link>
      </div>
    );
  }

  const step = steps[currentStep];
  return (
    <div className="glass-card p-10 rounded-3xl border border-white/10">
      <div className="flex gap-2 mb-10">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-gold' : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
        Question {currentStep + 1} of {steps.length}
      </p>
      <h2 className="font-serif text-3xl text-white mb-10">{step.question}</h2>
      <div className="grid grid-cols-1 gap-4">
        {step.options.map(option => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className="text-left p-5 border border-white/10 rounded-2xl text-white hover:border-gold/40 hover:text-gold transition-all group"
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
