'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'
import styles from './page.module.css'

type FeedbackType = 'feature' | 'bug' | 'complaint' | 'other'

export default function FeedbackPage() {
    const [type, setType] = useState<FeedbackType>('feature')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError('You must be signed in to send feedback.')
                setLoading(false)
                return
            }

            const { error: dbError } = await supabase
                .from('feedback')
                .insert({
                    user_id: user.id,
                    type,
                    content: content.trim(),
                    status: 'open'
                })

            if (dbError) throw dbError

            setSuccess(true)
            setContent('')
        } catch (err) {
            setError('Failed to send feedback. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                <div className="surface" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Message Received 📡</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                        Thank you for signaling us. Your input helps shape the platform.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push('/')}
                    >
                        Return to Feed
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--space-xl)' }}>
            <header style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                <h1>Transmission Line</h1>
                <p className="mono" style={{ color: 'var(--text-muted)' }}>
                    Report a glitch, suggest a feature, or just vent.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="surface" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>

                {/* Type Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <button
                        type="button"
                        className={`btn ${type === 'feature' ? 'btn-primary' : ''}`}
                        onClick={() => setType('feature')}
                        style={{ justifyContent: 'center' }}
                    >
                        <Lightbulb size={16} /> Feature
                    </button>
                    <button
                        type="button"
                        className={`btn ${type === 'bug' ? 'btn-danger' : ''}`} // Assuming btn-danger exists or falls back
                        onClick={() => setType('bug')}
                        style={{
                            justifyContent: 'center',
                            borderColor: type === 'bug' ? 'var(--error)' : undefined,
                            color: type === 'bug' ? 'var(--error)' : undefined
                        }}
                    >
                        <AlertTriangle size={16} /> Bug
                    </button>
                    <button
                        type="button"
                        className={`btn ${type === 'complaint' ? 'btn-primary' : ''}`}
                        onClick={() => setType('complaint')}
                        style={{
                            justifyContent: 'center',
                            backgroundColor: type === 'complaint' ? 'var(--surface-hover)' : undefined
                        }}
                    >
                        <MessageSquare size={16} /> Other
                    </button>
                </div>

                {/* Content */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <textarea
                        className="input"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                            type === 'feature' ? "It would be cool if..." :
                                type === 'bug' ? "Something broke when I..." :
                                    "What's on your mind?"
                        }
                        rows={6}
                        required
                        style={{ minHeight: '150px' }}
                    />
                </div>

                {error && (
                    <p style={{ color: 'var(--error)', marginBottom: 'var(--space-md)' }}>
                        {error}
                    </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                    <button type="button" className="btn" onClick={() => router.back()}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !content.trim()}
                    >
                        {loading ? 'Sending...' : 'Send Transmission'} <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    )
}
