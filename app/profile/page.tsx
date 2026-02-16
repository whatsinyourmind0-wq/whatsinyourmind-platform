'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Clock } from 'lucide-react'

// Reuse types if possible, or define locally for speed
type Post = {
    id: string
    content: string
    created_at: string
    topic_id: string
    tone_id: string
    location_name: string
    // add other fields as needed
}

export default function ProfilePage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/signin')
                return
            }
            setUserEmail(user.email || 'Anonymous')

            // Fetch My Posts
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setPosts(data)
            setLoading(false)
        }
        fetchProfile()
    }, [router, supabase])

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure? This thought will be lost forever.')) return

        const { error } = await supabase.from('posts').delete().eq('id', postId)
        if (!error) {
            setPosts(posts.filter(p => p.id !== postId))
        } else {
            alert('Failed to delete: ' + error.message)
        }
    }

    if (loading) return <div className="container" style={{ paddingTop: '100px' }}>Loading Profile...</div>

    return (
        <div className="container" style={{ marginTop: 'var(--space-xl)', paddingBottom: 'var(--space-2xl)' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <Link href="/" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Feed
                </Link>
                <h1>My Archive</h1>
                <p className="mono" style={{ color: 'var(--text-muted)' }}>
                    Identity: {userEmail?.split('@')[0]}...
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{posts.length}</span>
                        <br />Thoughts
                    </div>
                </div>
            </div>

            <div className="feed-grid">
                {posts.length === 0 ? (
                    <div className="surface" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>You have not shared any thoughts yet.</p>
                        <Link href="/post/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Share a Thought
                        </Link>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <span className="mono">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </span>
                                <span>{post.location_name || 'Unknown'}</span>
                            </div>

                            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                                {post.content}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '0.5rem' }}>
                                <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>
                                    {post.topic_id}
                                </span>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    title="Delete this thought"
                                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
