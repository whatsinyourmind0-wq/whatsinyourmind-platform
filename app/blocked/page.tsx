import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function BlockedPage() {
    return (
        <div className="container" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <ShieldAlert size={64} color="var(--primary)" style={{ marginBottom: 'var(--space-md)' }} />

            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>Access Restricted</h1>

            <p style={{ maxWidth: '400px', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                Access to WhatsInYourMind has been temporarily suspended in your region due to compliance requirements or local regulations.
            </p>

            <div className="surface" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                <p className="mono" style={{ fontSize: '0.9rem' }}>
                    Error Code: GEO_RESTRICTED<br />
                    Compliance ID: #GOV-IN-KA-001
                </p>
            </div>

            <div style={{ marginTop: 'var(--space-xl)' }}>
                <Link href="/blog" className="link">
                    Read Transparency Report
                </Link>
            </div>
        </div>
    )
}
