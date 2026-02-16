'use client'

import dynamic from 'next/dynamic'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Dynamic import to avoid SSR issues with Three.js/Window
const GlobeViz = dynamic(() => import('@/app/components/pulse/GlobeViz'), {
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
            INITIALIZING GLOBAL NETWORK...
        </div>
    )
})

function PulseContent() {
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') // 'stream' or null
    const isStream = mode === 'stream'

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: '#040d21' // Hardcoded deep space blue/black to match theme
        }}>

            {/* 3D Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                <GlobeViz />
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
                    pointerEvents: 'none', // Allow clicking the globe
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)'
                }}>

                    {/* Header Overlay */}
                    <header style={{ textAlign: 'center', paddingTop: 'var(--space-lg)', pointerEvents: 'auto' }}>
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
                            GLOBAL RESONANCE VISUALIZER
                        </p>

                        {/* PRECISION METRIC (The Data Stream) */}
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '1.2rem',
                            color: 'var(--secondary)',
                            background: 'rgba(0,0,0,0.5)',
                            display: 'inline-block',
                            padding: '0.2rem 1rem',
                            borderRadius: '4px',
                            border: '1px solid var(--secondary)'
                        }}>
                            AVG_SYNC: <span style={{ color: '#fff' }}>0.4821</span> Hz
                        </div>
                    </header>

                    {/* Footer Overlay */}
                    <footer style={{ textAlign: 'center', paddingBottom: 'var(--space-lg)', pointerEvents: 'auto' }}>
                        <div className="surface" style={{
                            display: 'inline-block',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--primary)',
                            background: 'rgba(4, 13, 33, 0.8)', // Semi-transparent cyber background
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Link href="/" className="btn btn-primary">
                                Return to Feed
                            </Link>
                        </div>
                    </footer>

                </div>
            )}

            {/* Minimal Watermark for Stream Mode */}
            {isStream && (
                <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 20, opacity: 0.5 }}>
                    <p className="mono" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>
                        THE PULSE • LIVE • WhatsInYourMind.com
                    </p>
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
