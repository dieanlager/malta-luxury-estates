import { AuthShell } from './_auth-ui'

export default function AgencyRegister() {
    // Public selfâ€‘registration is disabled under the exclusive partnership model.
    // This screen is intentionally static and inviteâ€‘only.
    return (
        <AuthShell
            title="Partner Applications"
            sub="Exclusive agency access by invitation only"
        >
            <div
                style={{
                    padding: '2.5rem 2rem',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(197,160,89,0.35)',
                    borderRadius: 24,
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        fontSize: '2.5rem',
                        marginBottom: '1.5rem',
                        opacity: 0.9,
                    }}
                >
                    ðŸ›ï¸
                </div>
                <h1
                    style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '1.75rem',
                        color: '#ffffff',
                        marginBottom: '0.75rem',
                    }}
                >
                    Private Agency Partnership
                </h1>
                <p
                    style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        marginBottom: '1.5rem',
                    }}
                >
                    Malta Luxury Real Estate currently operates through a single, exclusive
                    agency partnership. New partner applications are reviewed on a strictly
                    inviteâ€‘only basis.
                </p>
                <p
                    style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.8rem',
                        lineHeight: 1.6,
                        marginBottom: '1.75rem',
                    }}
                >
                    If you represent a brokerage and wish to discuss future collaboration,
                    please contact the portal owner directly.
                </p>
                <a
                    href="mailto:dawid@maltaluxuryrealestate.com"
                    style={{
                        display: 'inline-block',
                        padding: '0.9rem 1.75rem',
                        borderRadius: 999,
                        border: '1px solid rgba(197,160,89,0.6)',
                        color: '#C5A059',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        fontFamily: 'DM Mono, monospace',
                    }}
                >
                    Contact portal owner
                </a>
            </div>
        </AuthShell>
    )
}
