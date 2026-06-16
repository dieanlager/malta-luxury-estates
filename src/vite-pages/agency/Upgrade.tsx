import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { startCheckout } from '../../lib/stripe'
import { PLANS } from '../../lib/billing'

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`

export default function Upgrade() {
    const { agency } = useAuth()
    const [params] = useSearchParams()
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const cancelled = params.get('cancelled') === 'true'

    async function handleUpgrade(plan: 'pro' | 'featured') {
        if (!agency) return
        setError(null)
        setLoading(plan)
        try {
            await startCheckout(agency.id, plan)
        } catch (e: any) {
            setError(e.message)
            setLoading(null)
        }
    }

    const plans = [
        { key: 'basic', ...PLANS.basic },
        { key: 'pro', ...PLANS.pro, recommended: true },
        { key: 'featured', ...PLANS.featured },
    ] as const

    return (
        <>
            <style>{`
        ${FONT}
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

            <div style={{
                minHeight: '100vh', background: '#080808',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: "'DM Sans', sans-serif",
                backgroundImage: `
          linear-gradient(rgba(197,160,89,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(197,160,89,0.025) 1px, transparent 1px)
        `,
                backgroundSize: '60px 60px',
            }}>
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 1.5rem' }}>

                    {/* Back nav */}
                    <Link to="/agency/portal" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.625rem', letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.25)', textDecoration: 'none',
                        marginBottom: '3rem',
                    }}>← Back to Portal</Link>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        {cancelled && (
                            <div style={{
                                display: 'inline-block', padding: '0.5rem 1rem',
                                background: 'rgba(248,113,113,0.08)',
                                border: '1px solid rgba(248,113,113,0.2)',
                                borderRadius: 3, marginBottom: '1.5rem',
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '0.6875rem', color: '#f87171',
                            }}>
                                Checkout was cancelled — no charge was made
                            </div>
                        )}

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.5625rem', letterSpacing: '0.18em',
                            textTransform: 'uppercase', color: '#C5A059',
                            marginBottom: '1rem',
                        }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C5A059' }} />
                            Agency Plans
                        </div>

                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 400, color: '#fff',
                            margin: '0 0 0.75rem', letterSpacing: '-0.02em',
                        }}>
                            Scale your Malta<br />
                            <em style={{ color: '#C5A059' }}>property business</em>
                        </h1>

                        <p style={{
                            fontSize: '0.9375rem', color: 'rgba(255,255,255,0.35)',
                            maxWidth: 440, margin: '0 auto', lineHeight: 1.65,
                        }}>
                            Malta's only AI-powered property portal. Pro includes a 30-day free trial — no credit card charged until Day 31.
                        </p>
                    </div>

                    {/* Pricing grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1rem',
                        marginBottom: '3rem',
                        animation: 'fadeUp 0.4s ease',
                    }}>
                        {plans.map(plan => {
                            const isCurrent = agency?.plan === plan.key
                            const isRecommended = (plan as any).recommended
                            const canUpgrade = plan.key !== 'basic' && !isCurrent

                            return (
                                <div key={plan.key} style={{
                                    background: isRecommended
                                        ? 'linear-gradient(160deg, rgba(197,160,89,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                                        : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${isRecommended ? 'rgba(197,160,89,0.35)' : 'rgba(255,255,255,0.07)'}`,
                                    borderRadius: 6, padding: '2rem',
                                    position: 'relative',
                                    transform: isRecommended ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: isRecommended ? '0 0 40px rgba(197,160,89,0.1)' : 'none',
                                }}>

                                    {/* Recommended badge */}
                                    {isRecommended && (
                                        <div style={{
                                            position: 'absolute', top: -1, left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '0.25rem 1rem',
                                            background: 'linear-gradient(135deg, #9A7A35, #C5A059)',
                                            borderRadius: '0 0 4px 4px',
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '0.5625rem', letterSpacing: '0.14em',
                                            textTransform: 'uppercase', color: '#080808', fontWeight: 600,
                                        }}>Most Popular</div>
                                    )}

                                    {/* Current plan badge */}
                                    {isCurrent && (
                                        <div style={{
                                            position: 'absolute', top: 12, right: 12,
                                            padding: '0.2rem 0.5rem',
                                            background: 'rgba(74,222,128,0.1)',
                                            border: '1px solid rgba(74,222,128,0.25)',
                                            borderRadius: 2,
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '0.5rem', letterSpacing: '0.12em',
                                            textTransform: 'uppercase', color: '#4ade80',
                                        }}>Current Plan</div>
                                    )}

                                    {/* Plan name + price */}
                                    <div style={{ marginBottom: '1.5rem', paddingTop: isRecommended ? '0.5rem' : 0 }}>
                                        <div style={{
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '0.5625rem', letterSpacing: '0.16em',
                                            textTransform: 'uppercase',
                                            color: plan.color as string,
                                            marginBottom: '0.5rem',
                                        }}>{plan.name}</div>

                                        <div style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: '2rem', fontWeight: 400,
                                            color: '#fff', lineHeight: 1, marginBottom: '0.25rem',
                                        }}>
                                            {plan.price === 0 ? 'Free' : `€${plan.price}`}
                                            {plan.price > 0 && (
                                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.25rem' }}>
                                                    /month
                                                </span>
                                            )}
                                        </div>

                                        {'trial' in plan && plan.trial && (
                                            <div style={{
                                                fontFamily: "'DM Mono', monospace",
                                                fontSize: '0.625rem', color: '#4ade80',
                                                letterSpacing: '0.08em',
                                            }}>
                                                ✓ {plan.trial}-day free trial
                                            </div>
                                        )}

                                        <p style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
                                            margin: '0.5rem 0 0', lineHeight: 1.5,
                                        }}>{plan.description}</p>
                                    </div>

                                    {/* CTA */}
                                    {canUpgrade ? (
                                        <button
                                            onClick={() => handleUpgrade(plan.key as 'pro' | 'featured')}
                                            disabled={loading === plan.key}
                                            style={{
                                                width: '100%', padding: '0.75rem',
                                                background: isRecommended
                                                    ? 'linear-gradient(135deg, #9A7A35, #C5A059)'
                                                    : 'transparent',
                                                border: isRecommended
                                                    ? 'none'
                                                    : '1px solid rgba(255,255,255,0.15)',
                                                borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer',
                                                fontFamily: "'DM Sans', sans-serif",
                                                fontSize: '0.8125rem', fontWeight: 600,
                                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                                color: isRecommended ? '#080808' : 'rgba(255,255,255,0.7)',
                                                marginBottom: '1.5rem',
                                                opacity: loading === plan.key ? 0.5 : 1,
                                                transition: 'all 0.2s',
                                                outline: 'none',
                                            }}>
                                            {loading === plan.key ? 'Redirecting…' : `Upgrade to ${plan.name} →`}
                                        </button>
                                    ) : (
                                        <div style={{
                                            width: '100%', padding: '0.75rem',
                                            textAlign: 'center', marginBottom: '1.5rem',
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '0.6875rem', letterSpacing: '0.1em',
                                            color: isCurrent ? '#4ade80' : 'rgba(255,255,255,0.2)',
                                        }}>
                                            {isCurrent ? '✓ Active Plan' : 'Free Forever'}
                                        </div>
                                    )}

                                    {/* Features list */}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                                        {plan.features.map((f, i) => (
                                            <div key={i} style={{
                                                display: 'flex', gap: '0.5rem',
                                                marginBottom: '0.5rem',
                                                fontFamily: "'DM Sans', sans-serif",
                                                fontSize: '0.8125rem',
                                                color: 'rgba(255,255,255,0.5)',
                                                lineHeight: 1.4,
                                            }}>
                                                <span style={{ color: plan.color as string, flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '1rem', textAlign: 'center',
                            background: 'rgba(248,113,113,0.08)',
                            border: '1px solid rgba(248,113,113,0.2)',
                            borderRadius: 4,
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.8125rem', color: '#f87171',
                            marginBottom: '2rem',
                        }}>{error}</div>
                    )}

                    {/* Trust signals */}
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                        gap: '2rem', paddingTop: '2rem',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        {[
                            '🔒  Secure payment via Stripe',
                            '↩  Cancel anytime, no questions',
                            '📧  Invoices sent automatically',
                            '🇲🇹  Malta VAT compliant (18%)',
                        ].map(item => (
                            <span key={item} style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '0.6875rem', letterSpacing: '0.06em',
                                color: 'rgba(255,255,255,0.2)',
                            }}>{item}</span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
