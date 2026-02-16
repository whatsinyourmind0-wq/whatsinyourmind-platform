import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

const posts = [
    {
        slug: 'manifesto-v1',
        title: 'Protocol Alpha: The Signal is Live',
        date: 'Feb 16, 2026',
        excerpt: 'We have launched V1. No algorithms. No vanity metrics. This is the beginning of the Silent Web.'
    },
    {
        slug: 'privacy-promise',
        title: 'How We Protect Your Ghost',
        date: 'Feb 15, 2026',
        excerpt: 'We do not sell your data. We do not track you. Here is the technical breakdown of our Identity Guard.'
    }
]

return (
    <div className="container" style={{ marginTop: 'var(--space-xl)', paddingBottom: 'var(--space-2xl)', maxWidth: '800px' }}>
        <header style={{ marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
            <h1 className="section-title">Transmission Log</h1>
            <p className="mono" style={{ color: 'var(--text-muted)' }}>
                Engineering updates and philosophical musings from the core team.
            </p>
        </header>

        <div className="feed-grid">
            {posts.map(post => (
                <div key={post.slug} className="surface" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <Calendar size={14} />
                        <span className="mono">{post.date}</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        <Link href={`/blog/${post.slug}`} className="hover-link">
                            {post.title}
                        </Link>
                    </h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        {post.excerpt}
                    </p>
                    <Link href={`/blog/${post.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        Read Transmission <ArrowRight size={16} />
                    </Link>
                </div>
            ))}
        </div>
    </div>
)
}
