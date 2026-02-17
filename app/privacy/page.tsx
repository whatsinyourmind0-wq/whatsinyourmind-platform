export default function PrivacyPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <h1 className="glitch mb-8">PRIVACY POLICY</h1>
            <div className="surface p-8" style={{ lineHeight: '1.6' }}>
                <p className="mono text-muted mb-4">LAST UPDATED: 2026</p>
                
                <h3 className="text-xl font-bold mb-2 text-primary">1. DATA WE COLLECT</h3>
                <ul className="list-disc pl-6 mb-6 text-muted">
                    <li>Basic Account Info: Username, Display Name (No Real Name required).</li>
                    <li>Auth Provider ID (Google/Discord/GitHub ID).</li>
                    <li>Content: Posts, Comments, Resonance.</li>
                    <li>Approximate Location: (Country/Region Code only) for compliance.</li>
                </ul>

                <h3 className="text-xl font-bold mb-2 text-primary">2. HOW WE USE IT</h3>
                <p className="mb-6">
                    To render the "Pulse" (Global Heatmap). To filter content based on local laws. To prevent spam.
                    We do not sell your data to third parties.
                </p>

                <h3 className="text-xl font-bold mb-2 text-primary">3. COOKIES</h3>
                <p className="mb-6">
                    We use minimal cookies for Authentication (Supabase) and essential functionality. No tracking pixels.
                </p>

                <h3 className="text-xl font-bold mb-2 text-primary">4. DELETION</h3>
                <p className="mb-6">
                    You can delete your posts at any time. 
                    Account deletion is permanent and wipes all your echoes from the database.
                </p>
            </div>
        </div>
    )
}
