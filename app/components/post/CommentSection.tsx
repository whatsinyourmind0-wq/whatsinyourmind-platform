'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Send, Trash2, Loader2, AlertCircle } from 'lucide-react'
import TranslateButton from './TranslateButton'
import styles from './CommentSection.module.css'

interface Comment {
    id: string
    content: string
    created_at: string
    author_id: string
    author: {
        username: string
        avatar_url: string | null
        is_verified: boolean
    }
}

interface CommentSectionProps {
    postId: string
    currentUser: any // passed from parent or context
}

export default function CommentSection({ postId, currentUser }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isPosting, setIsPosting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // Don't fetch for demo posts
        if (postId.startsWith('test-')) return
        fetchComments()
    }, [postId])

    const fetchComments = async () => {
        // ... existing logic ...
        setIsLoading(true)
        const { data, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                created_at,
                author_id,
                author:profiles(username, avatar_url, is_verified)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching comments:', error)
            setError('Failed to load comments.')
        } else {
            setComments(data as any || [])
        }
        setIsLoading(false)
    }

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (postId.startsWith('test-')) {
            alert('Cannot comment on demo posts. Connect DB to go live!')
            return
        }
        if (!newComment.trim() || isPosting) return

        setIsPosting(true)
        setError(null)

        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                author_id: currentUser?.id, // Should ensure user is logged in
                content: newComment.trim()
            })

        if (error) {
            console.error('Error posting comment:', error)
            setError('Failed to post comment. You might need to sign in.')
        } else {
            setNewComment('')
            fetchComments() // Refresh list
        }
        setIsPosting(false)
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)

        if (error) {
            alert('Failed to delete')
        } else {
            setComments(comments.filter(c => c.id !== commentId))
        }
    }

    const handleFlagComment = async (commentId: string) => {
        if (!currentUser) {
            alert('You must be signed in to signal noise.')
            return
        }

        const reason = prompt('Why report this comment? (Spam, Hate, Illegal)')
        if (!reason) return

        const { error } = await supabase.from('flags').insert({
            comment_id: commentId, // Requires SCHEMA UPDATE in _ADD_COMMENT_FLAGS.sql
            user_id: currentUser.id,
            reason: reason,
            status: 'pending'
        })

        if (error) {
            console.error('Flag error:', error)
            alert('Signal failed to reach the tower.')
        } else {
            alert('Comment signaled. We are watching.')
        }
    }

    return (
        <div className={styles.section}>
            {/* List */}
            <div className={styles.list}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <Loader2 className="spin" size={20} /> Loading thoughts...
                    </div>
                ) : comments.length === 0 ? (
                    <div className={styles.empty}>
                        No echoes yet. Be the first to resonate.
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={styles.commentItem}>
                            <div className={styles.commentHeader}>
                                <span className={styles.author}>@{comment.author.username}</span>
                                {comment.author.is_verified && <span className={styles.verified}>✦</span>}
                                <span className={styles.date}>
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                                {currentUser?.id === comment.author_id && (
                                    <button onClick={() => handleDelete(comment.id)} className={styles.deleteBtn}>
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>

                            <p className={styles.content}>{comment.content}</p>

                            {/* Actions Row */}
                            <div className={styles.actions}>
                                <button
                                    className="icon-btn flag"
                                    onClick={() => handleFlagComment(comment.id)}
                                    title="Flag Comment"
                                >
                                    <AlertCircle size={14} />
                                </button>
                                <TranslateButton text={comment.content} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            {currentUser ? (
                <form onSubmit={handlePostComment} className={styles.form}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your resonance..."
                        className={`input ${styles.input}`}
                        disabled={isPosting}
                        maxLength={500}
                    />
                    <button type="submit" className="btn-icon" disabled={isPosting || !newComment.trim()}>
                        {isPosting ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                    </button>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    Sign in to leave a comment.
                </div>
            )}

            {error && <div className={styles.error}><AlertCircle size={14} /> {error}</div>}
        </div>
    )
}
