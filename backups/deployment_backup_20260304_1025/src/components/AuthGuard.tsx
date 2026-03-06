import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface Props {
    children: ReactNode
    requirePlan?: 'basic' | 'pro' | 'featured'
}

export function AuthGuard({ children, requirePlan }: Props) {
    const { session, agency, loading } = useAuth()
    const location = useLocation()

    // 1. Czekamy na załadowanie sesji
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: '#080808',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: 32, height: 32,
                    border: '2px solid rgba(197,160,89,0.2)',
                    borderTopColor: '#C5A059',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
            </div>
        )
    }

    // 2. Nie zalogowany → redirect do loginu, z zapamiętaniem docelowej ścieżki
    if (!session) {
        return <Navigate to="/agency/login" state={{ from: location }} replace />
    }

    // 3. Agencja nieaktywna / zablokowana
    if (agency && !agency.active) {
        return (
            <div style={{
                minHeight: '100vh', background: '#080808',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Mono, monospace', color: '#f87171', fontSize: '0.875rem',
            }}>
                Account suspended. Contact support@maltaluxuryestates.com
            </div>
        )
    }

    // 4. Plan check (dla Pro-only features)
    if (requirePlan && agency) {
        const planRank = { basic: 0, pro: 1, featured: 2 }
        const currentPlan = agency.plan as 'basic' | 'pro' | 'featured';
        if (planRank[currentPlan] < planRank[requirePlan]) {
            return (
                <div style={{
                    minHeight: '100vh', background: '#080808', padding: '4rem 2rem',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#fff', marginBottom: '0.75rem' }}>
                        Pro Feature
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 380, lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        This feature requires a Pro plan or higher. Upgrade to unlock unlimited listings, advanced analytics, and priority leads.
                    </p>
                    <a href="/agency/upgrade" style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #9A7A35, #C5A059)',
                        borderRadius: 3, fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.8125rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: '#080808', textDecoration: 'none',
                    }}>
                        Upgrade to Pro →
                    </a>
                </div>
            )
        }
    }

    return <>{children}</>
}
