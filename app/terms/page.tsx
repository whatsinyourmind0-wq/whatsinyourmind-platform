export default function TermsPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <h1 className="glitch mb-8">TERMS OF SERVICE</h1>
            <div className="surface p-8" style={{ lineHeight: '1.6' }}>
                <p className="mono text-muted mb-4">LAST UPDATED: 2026</p>
                
                <h3 className="text-xl font-bold mb-2 text-primary">1. THE PACT</h3>
                <p className="mb-6">
                    By entering WhatsInYourMind (the "Platform"), you agree to exist here as a digital entity bound by these terms. 
                    If you do not agree, disconnect immediately.
                </p>

                <h3 className="text-xl font-bold mb-2 text-primary">2. ANONYMITY & IDENTITY</h3>
                <p className="mb-6">
                    We do not track your real name, address, or physical location beyond general region data required for compliance. 
                    However, you are responsible for the content you emit. We are a conduit, not a shield for illegal acts.
                </p>

                <h3 className="text-xl font-bold mb-2 text-primary">3. CONTENT & COMPLIANCE</h3>
                <p className="mb-6">
                    We abide by the laws of the land (including IT Act, 2000). 
                    Hate speech, violence, and illegal content will be purged. 
                    The "Kill Switch" may be activated for specific regions upon government order without prior notice.
                </p>

                <h3 className="text-xl font-bold mb-2 text-primary">4. THE VOID</h3>
                <p className="mb-6">
                    Content with low resonance may be auto-archived to "The Void". 
                    We guarantee no permanence. This is a stream, not a library.
                </p>
                
                <h3 className="text-xl font-bold mb-2 text-primary">5. NO AI TRAINING</h3>
                <p className="mb-6">
                    Scraping this site to train Generative AI models is strictly prohibited without a license.
                </p>
            </div>
        </div>
    )
}
