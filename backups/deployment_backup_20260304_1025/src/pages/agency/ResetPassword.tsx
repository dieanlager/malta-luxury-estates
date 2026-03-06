import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { AuthShell, Field, ErrorBox, inputStyle, primaryBtn } from './_auth-ui'

export default function ResetPassword() {
    const { updatePassword } = useAuth()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        if (password !== confirm) return setError('Passwords do not match')
        if (password.length < 8) return setError('Minimum 8 characters')

        setLoading(true)
        const { error } = await updatePassword(password)
        if (error) { setError(error); setLoading(false) }
        else navigate('/agency/portal', { replace: true })
    }

    return (
        <AuthShell title="Set new password" sub="Choose a strong password">
            <form onSubmit={handleSubmit}>
                <Field label="New Password">
                    <input type="password" required value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={inputStyle} placeholder="Min 8 characters" autoFocus />
                </Field>
                <Field label="Confirm New Password">
                    <input type="password" required value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        style={inputStyle} placeholder="Repeat password" />
                </Field>
                {error && <ErrorBox>{error}</ErrorBox>}
                <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                    {loading ? 'Updating…' : 'Update Password →'}
                </button>
            </form>
        </AuthShell>
    )
}
