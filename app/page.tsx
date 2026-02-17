'use client'

import { useState, useEffect } from 'react'
import { PenLine } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'
import TopicTabs from './components/layout/TopicTabs'
import PostCard, { type PostData } from './components/post/PostCard'
import styles from './page.module.css'

// Demo posts for when the database isn't connected yet
const DEMO_POSTS: PostData[] = [
  {
    id: '1',
    content: 'Just spent 3 hours debugging a CSS issue that turned out to be a missing semicolon. The grind never stops. But honestly? That moment when it finally works is pure dopamine.',
    topic: 'the-grind',
    tone: 'casual',
    resonanceCount: 12,
    commentCount: 3,
    flagCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author: { username: 'code_wanderer', displayName: 'Code Wanderer', isVerified: false },
  },
  {
    id: '2',
    content: 'The way Mumbai local trains compress 4 million stories into 6:30 AM is something no algorithm will ever understand. Every face is a novel that starts at Churchgate and ends at Virar.',
    topic: 'the-transit',
    tone: 'observational',
    resonanceCount: 28,
    commentCount: 7,
    flagCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author: { username: 'urban_pulse', displayName: 'Urban Pulse', isVerified: true },
  },
  {
    id: '3',
    content: 'I wish someone told me at 22 that saying "I don\'t know" is not weakness. It\'s the beginning of every important conversation I\'ve ever had.',
    topic: 'hindsight',
    tone: 'reflective',
    resonanceCount: 45,
    commentCount: 11,
    flagCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    author: { username: 'late_wisdom', displayName: 'Late Wisdom', isVerified: true },
  },
  {
    id: '4',
    content: 'That first sip of chai when the rain starts outside your window. No playlist needed. The universe provided the soundtrack.',
    topic: 'small-joys',
    tone: 'casual',
    resonanceCount: 67,
    commentCount: 5,
    flagCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    author: { username: 'chai_philosopher', displayName: 'Chai Philosopher', isVerified: false },
  },
  {
    id: '5',
    content: 'What if consciousness isn\'t computation at all? What if it\'s more like a resonance pattern — and we\'ve been trying to build a piano by studying sheet music?',
    topic: 'deep-water',
    tone: 'reflective',
    resonanceCount: 33,
    commentCount: 15,
    flagCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    author: { username: 'edge_thinker', displayName: 'Edge Thinker', isVerified: false },
  },
  {
    id: '6',
    content: 'My IDE, my mechanical keyboard, one monitor, a plant that\'s somehow still alive, and a desk lamp that costs more than my chair. This is the setup. This is home.',
    topic: 'the-setup',
    tone: 'casual',
    resonanceCount: 19,
    commentCount: 8,
    flagCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    author: { username: 'desk_minimalist', displayName: 'Desk Minimalist', isVerified: false },
  },
]

export default function FeedPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostData[]>(DEMO_POSTS)
  const [isLive, setIsLive] = useState(false)
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
          if (data.length > 0) {
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
          } else {
            // ... Keep existing demo logic ...
            setPosts([
              {
                id: 'test-1',
                content: 'The way Mumbai local trains compress 4 million stories into 6:30 AM is something no algorithm will ever understand. Every face is a novel that starts at Churchgate and ends at Virar.',
                topic: 'the-transit',
                tone: 'observational',
                resonanceCount: 28,
                commentCount: 7,
                flagCount: 0,
                createdAt: new Date().toISOString(),
                author: { username: 'urban_pulse', displayName: 'Urban Pulse', isVerified: true },
              }
            ])
          }
          setIsLive(true) // Database is connected
        }
      } catch (e) {
        // Database not connected yet — use demo posts
        console.log('Using demo posts', e)
      }
    }

    loadData()
  }, [])

  // Filter by topic
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

  return (
    <div>
      {/* Topic Tabs */}
      <TopicTabs activeTopic={activeTopic} onSelect={setActiveTopic} />

      <div className={`container ${styles.feed}`}>
        {/* Status Indicator */}
        {!isLive && (
          <div className={styles.demoNotice}>
            <span className="mono">
              ● DEMO MODE — Connect Supabase to go live
            </span>
          </div>
        )}

        {/* Posts */}
        <div className={styles.posts}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onResonate={handleResonate}
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
