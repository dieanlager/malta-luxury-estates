import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
    propertyId: string;
    isFavorite: boolean;
    onToggle: (id: string) => void;
    size?: 'sm' | 'md';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    propertyId,
    isFavorite,
    onToggle,
    size = 'md',
}) => {
    const sizeClasses = size === 'sm'
        ? 'w-8 h-8'
        : 'w-10 h-10';

    const iconSize = size === 'sm' ? 14 : 18;

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(propertyId);
            }}
            className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md ${isFavorite
                    ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30'
                    : 'bg-luxury-black/60 text-white/60 hover:bg-luxury-black/80 hover:text-white border border-white/10'
                }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
            <Heart
                size={iconSize}
                fill={isFavorite ? 'currentColor' : 'none'}
                className={`transition-all duration-300 ${isFavorite ? 'scale-110' : ''}`}
            />
        </motion.button>
    );
};
