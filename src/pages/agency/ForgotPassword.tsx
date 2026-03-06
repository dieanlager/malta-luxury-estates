import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { AuthShell, Field, ErrorBox, inputStyle, primaryBtn, linkStyle } from './_auth-ui'

export default function ForgotPassword() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        const { error } = await resetPassword(email)
        if (error) { setError(error); setLoading(false) }
        else setSent(true)
    }

    return (
        <AuthShell title="Reset password" sub="We'll send you a secure link">
            {sent ? (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.5 }}>✉</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        Password reset link sent to <strong style={{ color: '#C5A059' }}>{email}</strong>
                    </p>
                    <Link to="/agency/login" style={{ ...linkStyle, display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
                        ← Back to Sign In
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Field label="Email address">
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            style={inputStyle} placeholder="agency@example.com" />
                    </Field>
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                        {loading ? 'Sending…' : 'Send Reset Link →'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/agency/login" style={linkStyle}>← Back to Sign In</Link>
                    </div>
                </form>
            )}
        </AuthShell>
    )
}
