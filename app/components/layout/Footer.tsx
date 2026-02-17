import Link from 'next/link'

export default function Footer() {
    return (
        <footer style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            borderTop: '1px solid var(--border-light)',
            marginTop: 'auto',
            background: 'var(--bg-void)'
        }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }} className="mono text-muted">
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        TERMS
                    </Link>
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                        PRIVACY
                    </Link>
                    <Link href="/admin" className="hover:text-primary transition-colors">
                        SYSTEM
                    </Link>
                </div>
                <div className="text-sm text-secondary" style={{ opacity: 0.5 }}>
                    &copy; {new Date().getFullYear()} WhatsInYourMind. All echoes fade.
                </div>
            </div>
        </footer>
    )
}
