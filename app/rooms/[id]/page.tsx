'use client'

import { createClient } from '@/app/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, ArrowLeft, Clock } from 'lucide-react'
import { analyzeSentiment } from '@/app/lib/analysis/sentiment'
import styles from './page.module.css'

type Message = {
    id: string
    content: string
    created_at: string
    emotion: string
    intensity: number
    profiles: { username: string } | null
}

export default function RoomChatPage() {
    const { id: roomId } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [roomName, setRoomName] = useState('LOADING...')
    const [expiresAt, setExpiresAt] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // 1. Fetch Room Details & Initial Messages
    useEffect(() => {
        if (!roomId) return

        async function init() {
            // Get Room Info
            const { data: room, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', roomId)
                .single()

            if (error || !room) {
                router.push('/rooms') // Redirect if invalid
                return
            }
            setRoomName(room.name)
            setExpiresAt(room.expires_at)

            // Get History
            const { data: history } = await supabase
                .from('posts')
                .select('id, content, created_at, emotion, intensity, profiles(username)')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true })
                .limit(50)

            if (history) setMessages(history as any)
        }

        init()

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'posts',
                filter: `room_id=eq.${roomId}`
            }, async (payload) => {
                // Fetch the user profile for the new message
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', payload.new.user_id)
                    .single()

                const newMsg = {
                    ...payload.new,
                    profiles: profile
                } as any

                setMessages(prev => [...prev, newMsg])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, supabase, router])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // time left
    const getTimeLeft = () => {
        if (!expiresAt) return ''
        const diff = new Date(expiresAt).getTime() - new Date().getTime()
        if (diff <= 0) return 'EXPIRED'
        const h = Math.floor(diff / (3600000))
        const m = Math.floor((diff % 3600000) / 60000)
        return `${h}h ${m}m`
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage.trim()
        setNewMessage('') // Optimistic clear

        // Sentiment Analysis
        const { emotion, intensity } = analyzeSentiment(content)

        // Get User
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth/signin?next=/rooms/' + roomId)
            return
        }

        const { error } = await supabase
            .from('posts')
            .insert({
                content,
                room_id: roomId,
                user_id: user.id,
                emotion,
                intensity,
                topic_id: 'signal-room', // Default or derived from room
                title: 'Quick Signal', // Placeholder
                is_anonymous: true // Rooms are anon by default? Or choice?
            })

        if (error) {
            console.error(error)
            alert('Failed to send signal.')
        }
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={() => router.push('/rooms')} className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className={styles.roomTitle}>{roomName}</h2>
                    <div className="mono text-xs text-accent">
                        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {getTimeLeft()} LEFT
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatArea}>
                {messages.map(msg => (
                    <div key={msg.id} className={`${styles.message} ${styles[msg.emotion] || styles.neutral}`}>
                        <div className={styles.msgMeta}>
                            <span className="mono text-xs op-70">
                                {msg.profiles?.username || 'ANON'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={styles.emotionTag} style={{ opacity: msg.intensity }}>
                                {msg.emotion}
                            </span>
                        </div>
                        <div className={styles.msgContent}>{msg.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className={styles.inputArea}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Broadcast your signal..."
                    className={styles.input}
                />
                <button type="submit" className={styles.sendBtn}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
