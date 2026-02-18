'use client'

import { createClient } from '@/app/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, ArrowRight } from 'lucide-react'
import { getTopicColor } from '@/app/lib/constants/topics'
import styles from './page.module.css'

type Room = {
    id: string
    name: string
    description: string
    topic_id: string
    expires_at: string
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        async function fetchRooms() {
            setLoading(true)
            const { data } = await supabase
                .from('rooms')
                .select('*')
                .eq('is_active', true)
                .gt('expires_at', new Date().toISOString())
                .order('expires_at', { ascending: true }) // Expiring soonest first

            if (data) setRooms(data as Room[])
            setLoading(false)
        }

        fetchRooms()
    }, [])

    // Countdown Renderer (Simple)
    const getTimeLeft = (expiresAt: string) => {
        const now = new Date().getTime()
        const end = new Date(expiresAt).getTime()
        const diff = end - now

        if (diff <= 0) return 'EXPIRED'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m`
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
            <header style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                <h1 className="glitch" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>SIGNAL ROOMS</h1>
                <p className="text-secondary mono">EPHEMERAL COMMUNITIES • 24H LIFECYCLE</p>
            </header>

            {loading ? (
                <div className="text-center mono">SCANNING FREQUENCIES...</div>
            ) : rooms.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '4rem', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
                    NO SIGNALS DETECTED.
                    <br /><br />
                    <span className="mono text-xs">TRY AGAIN LATER.</span>
                </div>
            ) : (
                <div className={styles.grid}>
                    {rooms.map(room => {
                        const color = getTopicColor(room.topic_id) || '#fff'
                        return (
                            <Link href={`/rooms/${room.id}`} key={room.id} className={styles.card} style={{ borderColor: color }}>
                                <div className={styles.header}>
                                    <div className="badge" style={{ borderColor: color, color: color }}>
                                        {room.topic_id.toUpperCase().replace('-', ' ')}
                                    </div>
                                    <div className="mono text-xs" style={{ color: 'var(--accent-pink)' }}>
                                        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        {getTimeLeft(room.expires_at)}
                                    </div>
                                </div>

                                <h3 className={styles.title} style={{ textShadow: `0 0 10px ${color}40` }}>{room.name}</h3>
                                <p className={styles.desc}>{room.description}</p>

                                <div className={styles.footer}>
                                    <span className="text-muted text-xs">
                                        <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        LIVE
                                    </span>
                                    <ArrowRight size={16} style={{ color }} />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
