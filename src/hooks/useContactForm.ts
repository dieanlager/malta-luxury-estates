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
            // Fetch affiliate URL from property if available
            let affiliateUrl = '';
            if (formData.propertyId) {
                const { data: prop } = await supabase
                    .from('properties')
                    .select('description')
                    .eq('id', formData.propertyId)
                    .maybeSingle();
                const m = (prop?.description || '').match(/^\[AFFILIATE_URL:([^\]]+)\]/);
                if (m) affiliateUrl = m[1];
            }

            // Send email via server
            const r = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || '',
                    message: formData.message || '',
                    propertyTitle: formData.propertyTitle || '',
                    propertyId: formData.propertyId || '',
                    affiliateUrl,
                }),
            });
            if (!r.ok) throw new Error(await r.text());

            // Also save to Supabase leads (non-blocking, ignore errors)
            if (formData.propertyId && ALLIANCE_AGENCY_ID) {
                supabase.from('leads').insert({
                    agency_id: ALLIANCE_AGENCY_ID,
                    property_id: formData.propertyId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    source: window.location.href,
                    status: 'new',
                } as any).then(() => {});
            }

            setState(prev => ({
                ...prev,
                isSubmitting: false,
                isSuccess: true,
                formData: INITIAL_FORM,
            }));
        } catch (err: any) {
            console.error('Contact error:', err);
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                error: 'Something went wrong. Please try again or email us directly at info@maltaluxuryrealestate.com',
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
