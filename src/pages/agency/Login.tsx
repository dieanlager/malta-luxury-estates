import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { AuthShell, Field, ErrorBox, inputStyle, primaryBtn, linkRow, linkStyle } from './_auth-ui'

export default function AgencyLogin() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as any)?.from?.pathname || '/agency/portal'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error } = await signIn(email, password)
        if (error) {
            setError(error)
            setLoading(false)
        } else {
            navigate(from, { replace: true })
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            sub="Sign in to your agency dashboard"
        >
            <form onSubmit={handleSubmit}>
                <Field label="Email address">
                    <input
                        type="email" required autoComplete="email"
                        value={email} onChange={e => setEmail(e.target.value)}
                        style={inputStyle} placeholder="agency@example.com"
                    />
                </Field>

                <Field label="Password">
                    <input
                        type="password" required autoComplete="current-password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        style={inputStyle} placeholder="••••••••"
                    />
                </Field>

                {error && <ErrorBox>{error}</ErrorBox>}

                <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                    {loading ? 'Signing in…' : 'Sign In →'}
                </button>

                <div style={linkRow}>
                    <Link to="/agency/forgot-password" style={linkStyle}>
                        Forgot password?
                    </Link>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <Link to="/agency/register" style={linkStyle}>
                        Create account
                    </Link>
                </div>
            </form>
        </AuthShell>
    )
}
