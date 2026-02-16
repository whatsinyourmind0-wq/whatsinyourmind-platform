export default function TermsPage() {
    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--space-xl)', paddingBottom: 'var(--space-2xl)' }}>
            <h1 className="section-title">Terms of Service</h1>
            <p className="mono" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                Last Updated: Feb 16, 2026
            </p>

            <div className="surface" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
                <h3>1. The Covenant</h3>
                <p>
                    WhatsInYourMind ("The Platform") is a public utility for anonymous thought.
                    By using this service, you agree to the conditions laid out in our <a href="/transparency">Constitution</a>.
                </p>

                <h3>2. Anonymity & Liability</h3>
                <p>
                    You are a Ghost. We do not track your real identity. However, you are responsible for your words.
                    The Platform is not liable for the content posted by anonymous users. Content that violates our
                    "Identity Guard" policy (Hate Speech, Doxxing) will be voided.
                </p>

                <h3>3. The Kill Switch</h3>
                <p>
                    We comply with local laws. If a government authority issues a valid order,
                    we reserve the right to block access to The Platform in specific regions (Geo-Blocking).
                </p>

                <h3>4. Data Ownership</h3>
                <p>
                    You own your thoughts. We own the platform.
                    We dedicate the aggregated "Pulse" data to the public domain for research.
                </p>

                <h3>5. Termination</h3>
                <p>
                    We reserve the right to ban any IP address or device that attempts to attack, spam,
                    or subvert the integrity of The Platform.
                </p>
            </div>
        </div>
    )
}
