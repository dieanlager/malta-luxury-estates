import React, { useState } from 'react';

interface ImgWithPlaceholderProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}

export const ImgWithPlaceholder: React.FC<ImgWithPlaceholderProps> = ({ src, alt, className = "", priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={elative overflow-hidden }>
            <div
                className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center overflow-hidden transition-opacity duration-500"
                style={{ opacity: isLoaded ? 0 : 1, pointerEvents: isLoaded ? 'none' : 'auto' }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                <div className="text-gold/20 font-serif text-xl tracking-tighter italic">
                    Malta Luxury Real Estate
                </div>
            </div>
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={w-full h-full object-cover transition-all duration-1000 }
                loading={priority ? "eager" : "lazy"}
                referrerPolicy="no-referrer"
            />
        </div>
    );
};