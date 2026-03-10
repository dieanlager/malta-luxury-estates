import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { AuthShell, Field, ErrorBox, inputStyle, primaryBtn, linkRow, linkStyle } from './_auth-ui'

export default function AgencyRegister() {
    const { signUp } = useAuth()

    const [form, setForm] = useState({
        agencyName: '',
        yourName: '',
        licenseNo: '',
        phone: '',
        email: '',
        website: '',
        password: '',
        confirmPassword: '',
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
        // Pass extra meta data for the Supabase trigger to pick up
        const { error } = await signUp({
            ...form,
            meta: {
                agency_name: form.agencyName,
                your_name: form.yourName,
                website: form.website,
                phone: form.phone
            }
        })

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <Field label="Agency Name *">
                        <input type="text" required value={form.agencyName} onChange={set('agencyName')}
                            style={inputStyle} placeholder="e.g. Alliance Malta" />
                    </Field>
                    <Field label="Your Name *">
                        <input type="text" required value={form.yourName} onChange={set('yourName')}
                            style={inputStyle} placeholder="Full Name" />
                    </Field>
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <Field label="Email *">
                        <input type="email" required autoComplete="email"
                            value={form.email} onChange={set('email')}
                            style={inputStyle} placeholder="listings@agency.com" />
                    </Field>
                    <Field label="Website (Optional)">
                        <input type="url" value={form.website} onChange={set('website')}
                            style={inputStyle} placeholder="https://youragency.com" />
                    </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <Field label="Password *">
                        <input type="password" required autoComplete="new-password"
                            value={form.password} onChange={set('password')}
                            style={inputStyle} placeholder="Min 8 chars" />
                    </Field>
                    <Field label="Confirm Password *">
                        <input type="password" required
                            value={form.confirmPassword} onChange={set('confirmPassword')}
                            style={inputStyle} placeholder="Repeat" />
                    </Field>
                </div>

                {error && <ErrorBox>{error}</ErrorBox>}

                <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                    {loading ? 'Creating account…' : 'Create Agency Account →'}
                </button>

                <div style={linkRow}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem' }}>Already have an account?</span>
                    <Link to="/agency/login" style={linkStyle}>Sign In</Link>
                </div>
            </form>
        </AuthShell>
    )
}
