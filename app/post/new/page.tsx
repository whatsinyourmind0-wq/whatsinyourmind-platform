'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'
import { TOPICS } from '@/app/lib/constants/topics'
import { TONES } from '@/app/lib/constants/tones'
import { getTopicColor } from '@/app/lib/constants/topics'
import styles from './page.module.css'

type Step = 'topic' | 'tone' | 'write'

export default function NewPostPage() {
    const [step, setStep] = useState<Step>('topic')
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
    const [selectedTone, setSelectedTone] = useState<string | null>(null)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const MAX_CHARS = 2000 // Deep Thoughts (Micro-Essay)

    // CONTENT GUARD 1: No Paste Allowed
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        setError('Copy-paste is disabled. Please type your thoughts.')
        setTimeout(() => setError(''), 3000)
    }

    // CONTENT GUARD 2: No Emojis (Simple Regex)
    // Allows: Basic punctuation, letters, numbers. Blocks: Unicode categories for emojis.
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        // Regex to find non-ASCII characters that are likely emojis (simplified)
        // This is a basic filter; for production, a more robust emoji-regex library is better.
        // For now, we strip typical high-byte emoji ranges.
        const stripped = val.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')

        if (stripped !== val) {
            // If length changed, an emoji was removed
            setError('Emojis are not allowed here.')
            setTimeout(() => setError(''), 2000)
        }
        setContent(stripped)
    }

    const handleSubmit = async () => {
        // CONTENT GUARD 3: PII / Doxxing Filter (Privacy Armor)
        const phoneRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

        if (phoneRegex.test(content)) {
            setError('Privacy Guard: Posting phone numbers is not allowed.')
            setTimeout(() => setError(''), 4000)
            return
        }
        if (emailRegex.test(content)) {
            setError('Privacy Guard: Posting email addresses is not allowed.')
            setTimeout(() => setError(''), 4000)
            return
        }

        if (!selectedTopic || !selectedTone || !content.trim()) return
        setLoading(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError('Please sign in first')
                return
            }

            // Verify Profile Exists (Identity Guard)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!profile) {
                setError('Profile not found. Please complete setup first.')
                setTimeout(() => router.push('/auth/setup'), 1500)
                return
            }

            // Auto-detect gibberish / short posts → route to "The Void"
            const isVoid = content.trim().length < 10 || selectedTopic === 'the-void'

            // ---------------------------------------------------------
            // LOCATION CAPTURE implementation (The Pulse) 🌍
            // ---------------------------------------------------------
            let locationData = {
                iso: 'UNKNOWN',
                name: 'Somewhere',
                lat: 0,
                lng: 0
            }

            try {
                // Silent fetch of approximate location (City Level)
                // We use a public IP-API. In production, this should be proxied or done server-side.
                const ipRes = await fetch('https://ipapi.co/json/')
                const ipJson = await ipRes.json()

                if (ipJson && !ipJson.error) {
                    locationData = {
                        iso: ipJson.country_code || 'UNKNOWN',
                        name: ipJson.city || ipJson.region || 'Somewhere',
                        lat: ipJson.latitude || 0,
                        lng: ipJson.longitude || 0
                    }
                }
            } catch (err) {
                // If location fails (ad-blocker, offline), we just continue with default.
                // We do NOT block the user. The thought is more important than the map.
                console.warn('Location fetch failed, proceeding anonymously.')
            }

            // ---------------------------------------------------------
            // LANGUAGE DETECTION (The Global Brain) 🧠
            // ---------------------------------------------------------
            let detectedLang = 'und' // Undetermined
            try {
                // Dynamic import to keep initial load fast (franc is heavy-ish)
                const { franc } = await import('franc')
                // Detect language (returns 3-letter ISO 639-3 code, e.g., 'mar', 'hin', 'eng')
                detectedLang = franc(content.trim()) || 'und'
            } catch (err) {
                console.warn('Language detection failed', err)
            }

            const { error: insertError } = await supabase
                .from('posts')
                .insert({
                    author_id: user.id,
                    content: content.trim(),
                    topic_id: isVoid ? 'the-void' : selectedTopic,
                    tone_id: selectedTone,
                    is_void: isVoid,

                    // 🧠 AI TAGS (The Polyglot)
                    auto_tags: [`lang:${detectedLang}`],

                    // 🌍 PULSE LOCATION
                    location_iso: locationData.iso,
                    location_name: locationData.name,
                    location_lat: locationData.lat,
                    location_lng: locationData.lng
                })

            if (insertError) {
                setError(insertError.message)
                return
            }

            router.push('/')
        } catch {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* Step Indicator */}
                <div className={styles.steps}>
                    <span className={`${styles.stepDot} ${step === 'topic' ? styles.activeDot : ''}`} />
                    <span className={`${styles.stepDot} ${step === 'tone' ? styles.activeDot : ''}`} />
                    <span className={`${styles.stepDot} ${step === 'write' ? styles.activeDot : ''}`} />
                </div>

                {/* Step 1: Select Topic */}
                {step === 'topic' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.heading}>Pick your table</h2>
                        <p className={styles.subtext}>What&apos;s the thought about?</p>

                        <div className={styles.topicGrid}>
                            {TOPICS.map(topic => {
                                const color = getTopicColor(topic.color)
                                const isSelected = selectedTopic === topic.id
                                return (
                                    <button
                                        key={topic.id}
                                        className={`${styles.topicCard} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => setSelectedTopic(topic.id)}
                                        style={{
                                            borderColor: isSelected ? color : undefined,
                                            boxShadow: isSelected ? `0 0 12px ${color}30` : undefined,
                                        }}
                                    >
                                        <span className={styles.topicName} style={{ color: isSelected ? color : undefined }}>
                                            {topic.name}
                                        </span>
                                        <span className={styles.topicDesc}>{topic.description}</span>
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            className="btn btn-primary"
                            disabled={!selectedTopic}
                            onClick={() => setStep('tone')}
                            style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-lg)' }}
                        >
                            Next <ArrowRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 2: Select Tone */}
                {step === 'tone' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.heading}>Set the tone</h2>
                        <p className={styles.subtext}>How are you saying it?</p>

                        <div className={styles.toneGrid}>
                            {TONES.map(tone => (
                                <button
                                    key={tone.id}
                                    className={`${styles.toneCard} ${selectedTone === tone.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedTone(tone.id)}
                                >
                                    <span className={styles.toneEmoji}>{tone.emoji}</span>
                                    <span className={styles.toneName}>{tone.name}</span>
                                    <span className={styles.toneDesc}>{tone.description}</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.navButtons}>
                            <button className="btn" onClick={() => setStep('topic')}>
                                <ArrowLeft size={14} /> Back
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={!selectedTone}
                                onClick={() => setStep('write')}
                            >
                                Next <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Write */}
                {step === 'write' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.heading}>What&apos;s in your mind?</h2>

                        <div className={styles.writeMeta}>
                            {selectedTopic && (
                                <span className="badge badge-cyan">
                                    {TOPICS.find(t => t.id === selectedTopic)?.name}
                                </span>
                            )}
                            {selectedTone && (
                                <span className="badge">
                                    {TONES.find(t => t.id === selectedTone)?.emoji}{' '}
                                    {TONES.find(t => t.id === selectedTone)?.name}
                                </span>
                            )}
                        </div>

                        <textarea
                            className="input"
                            value={content}
                            onChange={handleContentChange}
                            onPaste={handlePaste}
                            placeholder="Start typing your thought..."
                            maxLength={MAX_CHARS}
                            rows={6}
                            autoFocus
                            style={{ minHeight: '160px' }}
                        />

                        <div className={styles.charCount}>
                            <span className="mono">
                                {content.length}/{MAX_CHARS}
                            </span>
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.navButtons}>
                            <button className="btn" onClick={() => setStep('tone')}>
                                <ArrowLeft size={14} /> Back
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={loading || !content.trim()}
                                onClick={handleSubmit}
                            >
                                {loading ? 'Posting...' : 'Share Thought'} <Send size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
