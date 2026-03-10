import {
    createContext, useContext, useEffect, useState,
    ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { Agency } from '../types'

interface AuthContextValue {
    session: Session | null
    user: User | null
    agency: Agency | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signUp: (data: SignUpData) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: string | null }>
    updatePassword: (password: string) => Promise<{ error: string | null }>
}

interface SignUpData {
    email: string
    password: string
    agencyName: string
    yourName: string
    licenseNo: string
    phone: string
    website?: string
    meta?: any
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [agency, setAgency] = useState<Agency | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) fetchAgency(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                if (session) fetchAgency(session.user.id)
                else { setAgency(null); setLoading(false) }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    async function fetchAgency(userId: string) {
        if (!supabase) return;
        const { data } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', userId)
            .single()

        setAgency(data)
        setLoading(false)
    }

    async function signIn(email: string, password: string) {
        if (!supabase) return { error: 'Supabase not configured' };
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
    }

    async function signUp({ email, password, agencyName, yourName, licenseNo, phone, website, meta }: SignUpData) {
        if (!supabase) return { error: 'Supabase not configured' };

        // 1. Create auth user
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/agency/portal`,
                data: {
                    agency_name: agencyName,
                    full_name: yourName,
                    website: website
                },
            },
        })
        if (authError) return { error: authError.message }

        // 2. Insert agency profile
        if (data.user) {
            const { error: dbError } = await supabase.from('agencies').upsert({
                id: data.user.id,
                name: agencyName,
                email,
                license_no: licenseNo || null,
                phone: phone || null,
                website_url: website || null,
                plan: 'basic',
                active: true,
            })
            if (dbError) console.error('Agency insert error:', dbError)

            // 3. Trigger Welcome Email (optional, handled by API)
            // fetch('/api/notify-welcome', { method: 'POST', body: JSON.stringify({ email, agencyName }) }).catch(() => {});
        }

        return { error: null }
    }

    async function signOut() {
        if (!supabase) return;
        await supabase.auth.signOut()
        setAgency(null)
    }

    async function resetPassword(email: string) {
        if (!supabase) return { error: 'Supabase not configured' };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/agency/reset-password`,
        })
        return { error: error?.message ?? null }
    }

    async function updatePassword(password: string) {
        if (!supabase) return { error: 'Supabase not configured' };
        const { error } = await supabase.auth.updateUser({ password })
        return { error: error?.message ?? null }
    }

    return (
        <AuthContext.Provider value={{
            session, user: session?.user ?? null, agency,
            loading, signIn, signUp, signOut, resetPassword, updatePassword,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
