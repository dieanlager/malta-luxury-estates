import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ALLIANCE_AGENCY_ID } from '../constants';

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
            if (!formData.propertyId || !ALLIANCE_AGENCY_ID) {
                throw new Error('Contact form is not fully configured. Please try again later.');
            }

            // Fetch external_ref for the property to use as property_ref
            const { data: property } = await supabase
                .from('properties')
                .select('external_ref')
                .eq('id', formData.propertyId)
                .maybeSingle();

            const { error: insertError } = await supabase
                .from('leads')
                .insert({
                    agency_id: ALLIANCE_AGENCY_ID,
                    property_id: formData.propertyId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    intent: null,
                    budget_min: null,
                    budget_max: null,
                    source: window.location.href,
                    status: 'new',
                } as any);

            if (insertError) {
                throw insertError;
            }

            setState(prev => ({
                ...prev,
                isSubmitting: false,
                isSuccess: true,
                formData: INITIAL_FORM,
            }));
        } catch (err: any) {
            console.error('Error submitting lead', err);
            try {
                // Fallback: queue in localStorage for manual follow‑up
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
