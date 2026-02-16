import { Shield, Radio, Activity, Globe, HeartHandshake, AlertTriangle, Eye } from 'lucide-react'
import Link from 'next/link'

export default function TransparencyPage() {
    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--space-xl)', paddingBottom: 'var(--space-2xl)' }}>

            {/* Header */}
            <header style={{ marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>The Transparency Protocol</h1>
                <p className="mono" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Most platforms hide their algorithms. We reveal ours.
                    Here is how this machine works, and why it exists.
                </p>
            </header>

            {/* KPI Row */}
            <div className="surface" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-lg)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-2xl)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Activity size={24} style={{ marginBottom: 'var(--space-sm)', color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.2rem' }}>Resonance</h3>
                    <p className="small" style={{ color: 'var(--text-muted)' }}>We measure connection, not clicks.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Eye size={24} style={{ marginBottom: 'var(--space-sm)', color: 'var(--secondary)' }} />
                    <h3 style={{ fontSize: '1.2rem' }}>No "For You"</h3>
                    <p className="small" style={{ color: 'var(--text-muted)' }}>We don't manipulate your feed.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Globe size={24} style={{ marginBottom: 'var(--space-sm)', color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: '1.2rem' }}>Earth Pulse</h3>
                    <p className="small" style={{ color: 'var(--text-muted)' }}>Healing global emotion.</p>
                </div>
            </div>

            {/* Pillars */}
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
                <h2 className="section-title">The 4 Pillars</h2>

                <div className="surface" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                        <Radio size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>1. The Anti-Echo Algorithm</h3>
                    </div>
                    <p>
                        Social media is designed to addict you by reinforcing your current mood. Inclusion in an echo chamber isolates you even further.
                    </p>
                    <p>
                        <strong>Our Protocol:</strong> If you are in deep <em>Despair</em>, we gently introduce posts of <em>Hope</em> into your periphery. We do not force-feed you; we offer a Drift. We use data to heal, not to radicalize.
                    </p>
                </div>

                <div className="surface" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                        <Shield size={24} color="var(--error)" />
                        <h3 style={{ margin: 0 }}>2. The Safety Valve (Truth vs. Power)</h3>
                    </div>
                    <p>
                        We distinguish between <strong>Identity-Based Hate</strong> and <strong>Political Dissent</strong>.
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: 'var(--space-sm)' }}>
                        <li style={{ marginBottom: 'var(--space-xs)' }}>
                            <strong>Incitement (BLOCKED):</strong> Attacking a group for <em>who they are</em> (Race, Religion, Ethnicity). This is violence.
                        </li>
                        <li>
                            <strong>Critique (ALLOWED):</strong> Attacking a Government, Army, or Corporation for <em>what they do</em>.
                            <br />
                            <em style={{ color: 'var(--text-muted)' }}>Example: "The [Country] Army is committing war crimes." is ALLOWED. This is witness testimony.</em>
                        </li>
                    </ul>
                </div>

                <div className="surface" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                        <HeartHandshake size={24} color="var(--secondary)" />
                        <h3 style={{ margin: 0 }}>3. Validation, Not Vanity</h3>
                    </div>
                    <p>
                        We replaced "Likes" with <strong>Resonate</strong>.
                    </p>
                    <p>
                        A Like says "I like this image."<br />
                        A Resonance says "I feel this too. You are not alone."
                    </p>
                    <p>
                        We stripped away followers, view counts, and profile pictures. Without the performance, only the human remains.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ textAlign: 'center', marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--space-lg)' }}>
                <p className="mono" style={{ color: 'var(--text-muted)' }}>
                    WhatsInYourMind.com<br />
                    The Anonymous Coffee Shop of the Internet.
                </p>
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <Link href="/" className="btn">Return to Signal</Link>
                </div>
            </footer>

        </div>
    )
}
