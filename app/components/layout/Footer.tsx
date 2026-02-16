import Link from 'next/link'

export default function Footer() {
    return (
        <footer style={{
            borderTop: '1px solid var(--surface-border)',
            padding: 'var(--space-xl) var(--space-md)',
            marginTop: 'auto', // Pushes footer to bottom if content is short
            textAlign: 'center'
        }}>
            <div className="container">
                <p className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    &copy; 2026 WhatsInYourMind. All rights reserved.
                </p>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-md)',
                    marginTop: 'var(--space-md)',
                    fontSize: '0.9rem'
                }}>
                    <Link href="/terms" className="nav-link">Terms</Link>
                    <Link href="/transparency" className="nav-link">Transparency</Link>
                    <Link href="/pulse" className="nav-link">The Pulse</Link>
                    <a href="https://github.com/wiym-platform" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
                </div>

                <div style={{ marginTop: 'var(--space-lg)', opacity: 0.5, fontSize: '0.8rem' }}>
                    <p>Designed for the Shadows. Built for the Light.</p>
                </div>
            </div>
        </footer>
    )
}
