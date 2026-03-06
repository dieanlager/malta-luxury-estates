import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthShell({ title, sub, children }: {
    title: string; sub: string; children: ReactNode
}) {
    return (
        <div style={{
            minHeight: '100vh', background: '#080808',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', fontFamily: 'DM Sans, sans-serif',
            backgroundImage: `
        linear-gradient(rgba(197,160,89,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(197,160,89,0.025) 1px, transparent 1px)
      `,
            backgroundSize: '60px 60px',
        }}>
            <div style={{ width: '100%', maxWidth: 440 }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '0.5rem', letterSpacing: '0.2em',
                            textTransform: 'uppercase', color: '#C5A059', marginBottom: '0.25rem',
                        }}>Agency Portal</div>
                        <div style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '1.375rem', fontWeight: 400, color: '#fff',
                        }}>Malta Luxury Real Estate</div>
                    </Link>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, padding: '2rem',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                }}>
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h1 style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '1.625rem', fontWeight: 400,
                            color: '#fff', margin: '0 0 0.375rem',
                            letterSpacing: '-0.01em',
                        }}>{title}</h1>
                        <p style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)',
                            letterSpacing: '0.06em', margin: 0,
                        }}>{sub}</p>
                    </div>
                    {children}
                </div>

                {/* Back to site */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/" style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.625rem', letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.2)', textDecoration: 'none',
                    }}>← Back to Malta Luxury Real Estate</Link>
                </div>
            </div>
        </div>
    )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{
                display: 'block', fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.625rem', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', marginBottom: '0.375rem',
            }}>{label}</label>
            {children}
        </div>
    )
}

export function ErrorBox({ children }: { children: ReactNode }) {
    return (
        <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: 3,
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.75rem', color: '#f87171',
            lineHeight: 1.5,
        }}>{children}</div>
    )
}

export const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 3, padding: '0.625rem 0.875rem',
    fontFamily: 'DM Mono, monospace',
    fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)',
    outline: 'none', transition: 'border-color 0.2s',
}

export const primaryBtn = (loading: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem',
    background: loading
        ? 'rgba(255,255,255,0.05)'
        : 'linear-gradient(135deg, #9A7A35, #C5A059)',
    border: 'none', borderRadius: 3,
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.8125rem', fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: loading ? 'rgba(255,255,255,0.2)' : '#080808',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.2s',
})

export const linkStyle: React.CSSProperties = {
    fontFamily: 'DM Mono, monospace',
    fontSize: '0.75rem', color: '#C5A059',
    textDecoration: 'none', letterSpacing: '0.04em',
}

export const linkRow: React.CSSProperties = {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', gap: '0.75rem',
    marginTop: '1.25rem',
}
