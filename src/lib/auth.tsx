import {
    createContext, useContext, useEffect, useState,
    ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { Agency } from '../types' // Assuming types are in ../types

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
    licenseNo: string
    phone: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [agency, setAgency] = useState<Agency | null>(null)
    const [loading, setLoading] = useState(true)

    // ── Load session on mount ──────────────────────────────────
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

        // Listen for auth state changes (login, logout, token refresh)
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
            .eq('id', userId)   // agencies.id = auth.uid()
            .single()

        setAgency(data)
        setLoading(false)
    }

    // ── Sign In ────────────────────────────────────────────────
    async function signIn(email: string, password: string) {
        if (!supabase) return { error: 'Supabase not configured' };
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
    }

    // ── Sign Up (creates auth user + agency row) ───────────────
    async function signUp({ email, password, agencyName, licenseNo, phone }: SignUpData) {
        if (!supabase) return { error: 'Supabase not configured' };
        // 1. Create auth user
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/agency/portal`,
                data: { agency_name: agencyName },
            },
        })
        if (authError) return { error: authError.message }

        // 2. Insert agency profile (uses same UUID as auth user)
        if (data.user) {
            const { error: dbError } = await supabase.from('agencies').upsert({
                id: data.user.id,
                name: agencyName,
                email,
                license_no: licenseNo || null,
                phone: phone || null,
                plan: 'basic',
                active: true,
            })
            if (dbError) console.error('Agency insert error:', dbError)
        }

        return { error: null }
    }

    // ── Sign Out ───────────────────────────────────────────────
    async function signOut() {
        if (!supabase) return;
        await supabase.auth.signOut()
        setAgency(null)
    }

    // ── Password Reset (email) ─────────────────────────────────
    async function resetPassword(email: string) {
        if (!supabase) return { error: 'Supabase not configured' };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/agency/reset-password`,
        })
        return { error: error?.message ?? null }
    }

    // ── Update password (from reset link) ─────────────────────
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
