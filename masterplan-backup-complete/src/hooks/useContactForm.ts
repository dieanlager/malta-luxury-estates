import { useState, useCallback } from 'react';

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
    propertyId?: string;
    propertyTitle?: string;
    agencyEmail?: string;
}

interface ContactFormState {
    isOpen: boolean;
    isSubmitting: boolean;
    isSuccess: boolean;
    error: string | null;
    formData: ContactFormData;
}

const INITIAL_FORM: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    message: '',
};

const INQUIRIES_KEY = 'mle_inquiries';

export const useContactForm = () => {
    const [state, setState] = useState<ContactFormState>({
        isOpen: false,
        isSubmitting: false,
        isSuccess: false,
        error: null,
        formData: INITIAL_FORM,
    });

    const open = useCallback((propertyId?: string, propertyTitle?: string) => {
        setState(prev => ({
            ...prev,
            isOpen: true,
            isSuccess: false,
            error: null,
            formData: {
                ...INITIAL_FORM,
                propertyId,
                propertyTitle,
                message: propertyTitle
                    ? `I'm interested in "${propertyTitle}". Please contact me with more details.`
                    : '',
            },
        }));
    }, []);

    const close = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const updateField = useCallback((field: keyof ContactFormData, value: string) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value },
        }));
    }, []);

    const submit = useCallback(async () => {
        setState(prev => ({ ...prev, isSubmitting: true, error: null }));

        const { formData } = state;

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim()) {
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                error: 'Please fill in your name and email.',
            }));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                error: 'Please enter a valid email address.',
            }));
            return;
        }

        try {
            // Try server endpoint first (for when Resend is integrated)
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setState(prev => ({
                    ...prev,
                    isSubmitting: false,
                    isSuccess: true,
                    formData: INITIAL_FORM,
                }));
                return;
            }
        } catch {
            // Server not available – fallback to localStorage queue
        }

        // Fallback: Save to localStorage queue (for later processing)
        try {
            const existing = JSON.parse(localStorage.getItem(INQUIRIES_KEY) || '[]');
            existing.push({
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'pending',
            });
            localStorage.setItem(INQUIRIES_KEY, JSON.stringify(existing));

            setState(prev => ({
                ...prev,
                isSubmitting: false,
                isSuccess: true,
                formData: INITIAL_FORM,
            }));
        } catch {
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                error: 'Something went wrong. Please try again.',
            }));
        }
    }, [state]);

    return {
        ...state,
        open,
        close,
        updateField,
        submit,
    };
};
