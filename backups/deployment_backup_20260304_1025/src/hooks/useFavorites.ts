import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mle_favorites';
const EMAIL_CAPTURE_KEY = 'mle_email_captured';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    const [showEmailCapture, setShowEmailCapture] = useState(false);

    // Sync to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const toggle = useCallback((propertyId: string) => {
        setFavorites(prev => {
            const next = prev.includes(propertyId)
                ? prev.filter(id => id !== propertyId)
                : [...prev, propertyId];

            // Trigger email capture after 3 favorites (only once)
            if (next.length >= 3 && !prev.includes(propertyId)) {
                const alreadyCaptured = localStorage.getItem(EMAIL_CAPTURE_KEY);
                if (!alreadyCaptured) {
                    setShowEmailCapture(true);
                }
            }

            return next;
        });
    }, []);

    const isFavorite = useCallback((propertyId: string) => {
        return favorites.includes(propertyId);
    }, [favorites]);

    const clearAll = useCallback(() => {
        setFavorites([]);
    }, []);

    const dismissEmailCapture = useCallback(() => {
        setShowEmailCapture(false);
        localStorage.setItem(EMAIL_CAPTURE_KEY, 'true');
    }, []);

    return {
        favorites,
        toggle,
        isFavorite,
        clearAll,
        count: favorites.length,
        showEmailCapture,
        dismissEmailCapture,
    };
};
