'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Search } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'
import { isUsernameReserved } from '@/app/lib/constants/reserved-usernames'
import styles from './page.module.css'

export default function SetupPage() {
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [confirmed, setConfirmed] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) return 'Username must be at least 3 characters'
        if (value.length > 20) return 'Username must be 20 characters or less'
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores'
        if (isUsernameReserved(value)) return 'This username is reserved'
        return null
    }

    const checkAvailability = async () => {
        const validationError = validateUsername(username)
        if (validationError) {
            setError(validationError)
            setIsAvailable(null)
            return
        }

        setChecking(true)
        setError('')

        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username.toLowerCase())
            .single()

        setIsAvailable(!existing)
        if (existing) {
            setError('Username is already taken')
        }
        setChecking(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!displayName.trim()) {
            setError('Display name is required')
            return
        }

        if (!confirmed) {
            setError('Please confirm you understand the username is permanent')
            return
        }

        if (!isAvailable) {
            setError('Please check username availability first')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError('Not authenticated')
                return
            }

            // Final availability check (race condition guard)
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username.toLowerCase())
                .single()

            if (existing) {
                setError('Username was just taken — try another')
                setIsAvailable(false)
                setLoading(false)
                return
            }

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    username: username.toLowerCase().trim(),
                    display_name: displayName.trim(),
                })

            if (insertError) {
                setError(insertError.message)
                setLoading(false)
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
                <h1 className={styles.heading}>Set up your identity</h1>

                {/* ⚠️ Permanent Username Warning */}
                <div className={styles.warning}>
                    <p><strong>⚠ Your username is permanent and cannot be changed.</strong></p>
                    <p>Choose carefully. This will be your identity on the platform.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className="mono">DISPLAY NAME</label>
                        <input
                            type="text"
                            className="input"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="How you want to be seen"
                            maxLength={50}
                        />
                        <span className={styles.hint}>Display name can be updated later.</span>
                    </div>

                    <div className={styles.field}>
                        <label className="mono">USERNAME (PERMANENT)</label>
                        <div className={styles.usernameRow}>
                            <div className={styles.usernameInput}>
                                <span className={styles.at}>@</span>
                                <input
                                    type="text"
                                    className="input"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                                        setError('')
                                        setIsAvailable(null)
                                        setConfirmed(false)
                                    }}
                                    placeholder="your_handle"
                                    maxLength={20}
                                    style={{ paddingLeft: '28px' }}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn"
                                onClick={checkAvailability}
                                disabled={checking || username.length < 3}
                            >
                                {checking ? '...' : <Search size={14} />}
                                Check
                            </button>
                        </div>

                        {/* Availability result */}
                        {isAvailable === true && (
                            <div className={styles.available}>
                                <CheckCircle size={14} /> @{username} is available
                            </div>
                        )}
                        {isAvailable === false && (
                            <div className={styles.unavailable}>
                                <XCircle size={14} /> @{username} is taken
                            </div>
                        )}
                    </div>

                    {/* Confirmation checkbox — only show after availability check passes */}
                    {isAvailable && (
                        <label className={styles.confirmLabel}>
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className={styles.checkbox}
                            />
                            <span>
                                I understand that <strong>@{username}</strong> is permanent and cannot be changed.
                            </span>
                        </label>
                    )}

                    {error && (
                        <p className={styles.error}>{error}</p>
                    )}

                    {/* Platform rights disclaimer */}
                    <div className={styles.disclaimer}>
                        <p>
                            By creating an account you agree that WhatsInYourMind reserves the right
                            to delete or suspend any profile at any time for violating community guidelines.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !displayName.trim() || !username.trim() || !isAvailable || !confirmed}
                        style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}
                    >
                        {loading ? 'Creating...' : 'Enter the Coffee Shop'}
                    </button>
                </form>
            </div>
        </div>
    )
}
