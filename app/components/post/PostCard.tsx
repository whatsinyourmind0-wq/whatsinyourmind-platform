import { useState } from 'react'
import { Activity, MessageSquare, Flag } from 'lucide-react'
import { getTopicById, getTopicColor } from '@/app/lib/constants/topics'
import { getToneById } from '@/app/lib/constants/tones'
import TranslateButton from './TranslateButton'
import CommentSection from './CommentSection'
import styles from './PostCard.module.css'

// IMPORTANT: This duplicates the DB type slightly for the UI prop, 
// but maps to the new Schema naming.
export interface PostData {
    id: string
    content: string
    topic: string // mapped from topic_id
    tone: string  // mapped from tone_id
    resonanceCount: number
    commentCount: number
    flagCount: number
    createdAt: string
    author: {
        username: string
        displayName: string
        isVerified: boolean
    }
    isResonated?: boolean // Optimistic UI state
}

interface PostCardProps {
    post: PostData
    currentUser?: any
    onResonate?: (postId: string) => void
    onFlag?: (postId: string) => void
}

function timeAgo(dateStr: string): string {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = Math.floor((now - then) / 1000)

    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function PostCard({ post, currentUser, onResonate, onFlag }: PostCardProps) {
    const [showComments, setShowComments] = useState(false)

    // FALLBACK: We still use the constants for now until we fully wire up the Dynamic Topics context
    const topic = getTopicById(post.topic)
    const tone = getToneById(post.tone)
    const topicColor = topic ? getTopicColor(topic.color) : 'var(--text-muted)'

    return (
        <article className={`surface glow-border ${styles.card}`}>
            {/* Metadata Row */}
            <div className={styles.meta}>
                <div className={styles.metaLeft}>
                    {topic && (
                        <span
                            className={`badge ${styles.topicBadge}`}
                            style={{ color: topicColor, borderColor: `${topicColor}40` }}
                        >
                            {topic.name}
                        </span>
                    )}
                    {tone && (
                        <span className="badge">
                            {tone.emoji} {tone.name}
                        </span>
                    )}
                </div>
                <span className="mono">{timeAgo(post.createdAt)}</span>
            </div>

            {/* Content */}
            <p className={styles.content}>{post.content}</p>

            {/* Author + Actions */}
            <div className={styles.footer}>
                <div className={styles.author}>
                    <span className="mono">
                        @{post.author.username}
                        {post.author.isVerified && (
                            <span className={styles.verified} title="Verified Human">✦</span>
                        )}
                    </span>
                </div>

                <div className={styles.actions}>
                    <button
                        className={`icon-btn ${post.isResonated ? 'active' : ''}`}
                        onClick={() => onResonate?.(post.id)}
                        aria-label="Resonate: You are not alone"
                        title="Resonate · You are not alone"
                    >
                        <Activity size={16} />
                        {/* Using Activity icon for 'Pulse/Resonance' */}
                        {post.resonanceCount > 0 && <span>{post.resonanceCount}</span>}
                    </button>

                    <button
                        className={`icon-btn ${showComments ? 'active' : ''}`}
                        onClick={() => setShowComments(!showComments)}
                        aria-label="Comment"
                    >
                        <MessageSquare size={16} />
                        {post.commentCount > 0 && <span>{post.commentCount}</span>}
                    </button>

                    <button
                        className="icon-btn flag"
                        onClick={() => onFlag?.(post.id)}
                        aria-label="Flag"
                    >
                        <Flag size={16} />
                    </button>

                    {/* Translation Feature */}
                    <div style={{ marginLeft: 'auto' }}>
                        <TranslateButton text={post.content} />
                    </div>
                </div>
            </div>

            {/* Comments Section - Only loaded if toggled */}
            {showComments && (
                <CommentSection postId={post.id} currentUser={currentUser} />
            )}
        </article>
    )
}
