'use client'

import dynamic from 'next/dynamic'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'

// Dynamic import to avoid SSR issues with Three.js/Window
// Dynamic import to avoid SSR issues with Canvas
const PulseDigital = dynamic(() => import('@/app/components/pulse/PulseDigital'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontFamily: 'monospace'
        }}>
            INITIALIZING DIGITAL NETWORK...
        </div>
    )
})

// Types
type StreamPost = {
    id: string
    content: string
    created_at: string
    topic: string
}

function PulseContent() {
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') // 'stream' or null
    const isStream = mode === 'stream'

    // Live Metrics
    const [totalPosts, setTotalPosts] = useState(0)
    const [avgSync, setAvgSync] = useState(0.4821)
    const [dominantEmotion, setDominantEmotion] = useState('neutral')
    const [streamPosts, setStreamPosts] = useState<StreamPost[]>([])

    // Fetch Data
    useEffect(() => {
        const supabase = createClient()

        const fetchData = async () => {
            // Get Total Count
            const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true })
            if (count) setTotalPosts(count)

            // Get Latest Stream Posts (for ticker)
            const { data } = await supabase
                .from('posts')
                .select('id, content, created_at, topic, emotion')
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setStreamPosts(data as any)
                // Calculate dominant emotion from recent posts
                const emotionCounts: Record<string, number> = {}
                data.forEach((p: any) => {
                    const e = p.emotion || 'neutral'
                    emotionCounts[e] = (emotionCounts[e] || 0) + 1
                })

                let max = 0
                let dom = 'neutral'
                Object.entries(emotionCounts).forEach(([e, count]) => {
                    if (count > max) {
                        max = count
                        dom = e
                    }
                })
                setDominantEmotion(dom)
            }

            // Simulate Sync fluctuation
            setAvgSync(0.4 + Math.random() * 0.2)
        }

        fetchData()
        const interval = setInterval(fetchData, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: '#040d21'
        }}>

            {/* 2D Digital Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                <PulseDigital emotion={dominantEmotion} />
            </div>

            {/* UI Overlay - Hidden in Stream Mode */}
            {!isStream && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)'
                }}>

                    {/* Header Overlay with Gradient */}
                    <header style={{
                        textAlign: 'center',
                        paddingTop: 'var(--space-lg)',
                        pointerEvents: 'auto',
                        background: 'linear-gradient(to bottom, #040d21 0%, transparent 100%)',
                        paddingBottom: '2rem',
                        width: '100%'
                    }}>
                        <h1 className="glitch" style={{
                            fontSize: '3rem',
                            marginBottom: 'var(--space-xs)',
                            textShadow: '0 0 20px var(--primary)',
                            color: '#fff'
                        }}>
                            THE PULSE
                        </h1>
                        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '2px', marginBottom: '1rem' }}>
                            <Zap size={14} style={{ display: 'inline', marginRight: '8px' }} />
                            GLOBAL EMOTIONAL RESONANCE
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* PRECISION METRIC */}
                            <div style={{
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                color: 'var(--secondary)',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '0.2rem 0.8rem',
                                borderRadius: '4px',
                                border: '1px solid var(--secondary)',
                            }}>
                                MOOD: <span style={{ color: '#fff', textTransform: 'uppercase' }}>{dominantEmotion}</span>
                            </div>

                            <div style={{
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                color: 'var(--accent-pink)',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '0.2rem 0.8rem',
                                borderRadius: '4px',
                                border: '1px solid var(--accent-pink)'
                            }}>
                                THOUGHTS: <span style={{ color: '#fff' }}>{totalPosts}</span>
                            </div>
                        </div>

                        {/* EMOTIONAL METRICS LEGEND */}
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem' }} className="mono">
                            <span style={{ color: '#FF3B30' }}>● THE GRIND</span>
                            <span style={{ color: '#007AFF' }}>● TECH</span>
                            <span style={{ color: '#AF52DE' }}>● THOUGHTS</span>
                            <span style={{ color: '#34C759' }}>● QUIET</span>
                            <span style={{ color: '#8E8E93' }}>● VOID</span>
                        </div>
                    </header>

                    {/* Stream Ticker (New Feature) */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        paddingRight: '2rem',
                        opacity: 0.8
                    }}>
                        {streamPosts.map((post, i) => (
                            <div key={post.id} style={{
                                background: 'rgba(0,0,0,0.6)',
                                borderLeft: `2px solid var(--primary)`,
                                padding: '10px',
                                marginBottom: '10px',
                                maxWidth: '300px',
                                fontSize: '0.8rem',
                                color: '#eee',
                                backdropFilter: 'blur(4px)',
                                transform: `translateX(${i * 5}px)`
                            }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '4px' }}>{post.topic.toUpperCase()}</div>
                                {post.content.substring(0, 80)}...
                            </div>
                        ))}
                    </div>

                    {/* Footer Overlay */}
                    <footer style={{ textAlign: 'center', paddingBottom: 'var(--space-lg)', pointerEvents: 'auto' }}>
                        <div className="surface" style={{
                            display: 'inline-block',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--primary)',
                            background: 'rgba(4, 13, 33, 0.8)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Link href="/" className="btn btn-primary">
                                Return to Feed
                            </Link>
                        </div>
                    </footer>

                </div>
            )}

            {/* Stream Mode Only Overlay */}
            {isStream && (
                <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 20 }}>
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '2rem',
                        color: 'var(--primary)',
                        textShadow: '0 0 10px var(--primary)',
                        textAlign: 'right'
                    }}>
                        LIVE: {totalPosts}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function PulsePage() {
    return (
        <Suspense fallback={<div>Loading Pulse...</div>}>
            <PulseContent />
        </Suspense>
    )
}
