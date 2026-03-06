import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { AuthShell, Field, ErrorBox, inputStyle, primaryBtn, linkRow, linkStyle } from './_auth-ui'

export default function AgencyRegister() {
    const { signUp } = useAuth()

    const [form, setForm] = useState({
        agencyName: '', licenseNo: '',
        phone: '', email: '', password: '', confirmPassword: '',
    })
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match')
        }
        if (form.password.length < 8) {
            return setError('Password must be at least 8 characters')
        }

        setLoading(true)
        const { error } = await signUp(form)

        if (error) {
            setError(error)
            setLoading(false)
        } else {
            setSuccess(true)
        }
    }

    if (success) {
        return (
            <AuthShell title="Check your inbox" sub="One last step">
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.6 }}>✉</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        We sent a confirmation link to <strong style={{ color: '#C5A059' }}>{form.email}</strong>.
                        Click it to activate your account and access the Agency Portal.
                    </p>
                    <Link to="/agency/login" style={{ ...primaryBtn(false), display: 'inline-block', textDecoration: 'none' }}>
                        Back to Sign In
                    </Link>
                </div>
            </AuthShell>
        )
    }

    return (
        <AuthShell
            title="Join Malta Luxury Real Estate"
            sub="Create your agency account — first 30 days free"
        >
            {/* Plan teaser */}
            <div style={{
                padding: '0.875rem 1rem', marginBottom: '1.5rem',
                background: 'rgba(197,160,89,0.07)',
                border: '1px solid rgba(197,160,89,0.2)',
                borderRadius: 3,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C5A059', marginBottom: '0.2rem' }}>Basic Plan · Free</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Up to 10 listings · Lead notifications · Analytics</div>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.875rem', color: '#C5A059', fontWeight: 500 }}>€0/mo</div>
            </div>

            <form onSubmit={handleSubmit}>
                <Field label="Agency / Company Name *">
                    <input type="text" required value={form.agencyName} onChange={set('agencyName')}
                        style={inputStyle} placeholder="e.g. RE/MAX Malta" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <Field label="MDA License No.">
                        <input type="text" value={form.licenseNo} onChange={set('licenseNo')}
                            style={inputStyle} placeholder="MDA-2024-XXXX" />
                    </Field>
                    <Field label="Phone">
                        <input type="tel" value={form.phone} onChange={set('phone')}
                            style={inputStyle} placeholder="+356 XXXX XXXX" />
                    </Field>
                </div>

                <Field label="Email address *">
                    <input type="email" required autoComplete="email"
                        value={form.email} onChange={set('email')}
                        style={inputStyle} placeholder="listings@youragency.com" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <Field label="Password *">
                        <input type="password" required autoComplete="new-password"
                            value={form.password} onChange={set('password')}
                            style={inputStyle} placeholder="Min 8 characters" />
                    </Field>
                    <Field label="Confirm Password *">
                        <input type="password" required
                            value={form.confirmPassword} onChange={set('confirmPassword')}
                            style={inputStyle} placeholder="Repeat password" />
                    </Field>
                </div>

                {error && <ErrorBox>{error}</ErrorBox>}

                <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                    {loading ? 'Creating account…' : 'Create Account →'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)', marginTop: '1rem', lineHeight: 1.6 }}>
                    By registering you agree to our{' '}
                    <Link to="/terms" style={linkStyle}>Terms of Service</Link> and{' '}
                    <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>.
                </p>

                <div style={linkRow}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem' }}>Already have an account?</span>
                    <Link to="/agency/login" style={linkStyle}>Sign In</Link>
                </div>
            </form>
        </AuthShell>
    )
}
