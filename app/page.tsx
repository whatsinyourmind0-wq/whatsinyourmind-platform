'use client'

import { useState, useEffect } from 'react'
import { PenLine } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'
import TopicTabs from './components/layout/TopicTabs'
import PostCard, { type PostData } from './components/post/PostCard'
import styles from './page.module.css'

// Demo posts removed for production

export default function FeedPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start loading
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  // Try to load real posts from Supabase
  useEffect(() => {
    const loadData = async () => {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      try {
        // 2. Get Posts
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, content, topic:topic_id, tone:tone_id,
            resonance_count, comment_count, flag_count,
            is_void, created_at,
            profiles!posts_author_id_fkey (
              username, display_name, is_verified
            )
          `)
          .eq('is_void', false)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        if (data) {
          const mapped: PostData[] = data.map((p: any) => {
            const profile = p.profiles
            return {
              id: p.id,
              content: p.content,
              // Handle both joined tables and raw IDs if join fails
              topic: p.topic?.id || p.topic || 'the-void',
              tone: p.tone?.id || p.tone || 'casual',
              resonanceCount: p.resonance_count || 0,
              commentCount: p.comment_count || 0,
              flagCount: p.flag_count || 0,
              createdAt: p.created_at,
              author: {
                username: profile?.username || 'anonymous',
                displayName: profile?.display_name || 'Anonymous',
                isVerified: profile?.is_verified || false,
              },
            }
          })
          setPosts(mapped)
          setIsLive(true) // Database is connected
        }
      } catch (e) {
        console.error('Error loading posts:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  /* Filters */
  const filteredPosts = activeTopic
    ? posts.filter(p => p.topic === activeTopic)
    : posts

  const handleResonate = async (postId: string) => {
    // Optimistic UI
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
            ...p,
            isResonated: !p.isResonated,
            resonanceCount: p.resonanceCount + (p.isResonated ? -1 : 1)
          }
          : p
      )
    )

    // TODO: CONNECT TO DB
    // Implement the actual DB call to 'resonance' table here
  }

  const handleFlag = async (postId: string) => {
    if (!currentUser) {
      alert('You must be signed in to signal noise.')
      return
    }

    const reason = prompt('Why does this signal need review? (Spam, Hate, Illegal)')
    if (!reason) return

    const { error } = await supabase.from('flags').insert({
      post_id: postId,
      user_id: currentUser.id,
      reason: reason,
      status: 'pending'
    })

    if (error) {
      console.error('Flag error:', error)
      alert('Signal failed to reach the tower.')
    } else {
      alert('Signal received. We are watching.')
    }
  }

  return (
    <div>
      {/* Topic Tabs */}
      <TopicTabs activeTopic={activeTopic} onSelect={setActiveTopic} />

      <div className={`container ${styles.feed}`}>
        {/* Status Indicator */}
        {!isLoading && !isLive && (
          <div className={styles.demoNotice}>
            <span className="mono">
              ● DEMO MODE — Connect Supabase to go live
            </span>
          </div>
        )}

        {/* Posts */}
        <div className={styles.posts}>
          {isLoading ? (
            <div className={styles.empty}>
              <p className="mono">Scanning for signals...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onResonate={handleResonate}
                onFlag={handleFlag}
              />
            ))
          ) : (
            <div className={styles.empty}>
              <p className="mono">No thoughts at this table yet.</p>
              <p className={styles.emptyHint}>Be the first to share.</p>
            </div>
          )}
        </div>

        {/* Floating CTA */}
        <Link href="/post/new" className={styles.fab}>
          <PenLine size={20} />
        </Link>
      </div>
    </div>
  )
}
