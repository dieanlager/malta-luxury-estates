import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ImgWithPlaceholderProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}

export const ImgWithPlaceholder: React.FC<ImgWithPlaceholderProps> = ({ src, alt, className = "", priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Luxury Placeholder */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                        {/* Luxury Logo or Icon Placeholder */}
                        <div className="text-gold/20 font-serif text-xl tracking-tighter italic">
                            Malta Luxury Real Estate
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                loading={priority ? "eager" : "lazy"}
                referrerPolicy="no-referrer"
            />
        </div>
    );
};

