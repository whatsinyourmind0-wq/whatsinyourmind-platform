'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Zap, LogIn, LogOut, PenLine, User } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import styles from './Header.module.css'

import { useLanguage } from '@/app/lib/contexts/LanguageContext'

export default function Header() {
    const { language, setLanguage } = useLanguage()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        window.location.href = '/'
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className="text-logo">
                    <span style={{ fontSize: '1.25rem', marginRight: '0.5rem', lineHeight: 1 }}>🍉</span>
                    WHATSINYOURMIND
                </Link>

                <nav className={styles.nav}>
                    {/* Language Selector */}
                    <select
                        className={styles.langSelect}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        aria-label="Select Language"
                    >
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                        <option value="hi">हिंदी</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>

                    {user ? (
                        <>
                            <Link href="/post/new" className="btn btn-primary">
                                <PenLine size={14} />
                                Think
                            </Link>
                            <Link href="/profile" className="btn btn-ghost">
                                <User size={16} />
                            </Link>
                            <button onClick={handleSignOut} className="btn btn-ghost">
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <Link href="/auth/signin" className="btn">
                            <LogIn size={14} />
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
