'use client'

import { useState, useEffect } from 'react'
import { Languages, ExternalLink, Loader2 } from 'lucide-react'
import { useLanguage } from '@/app/lib/contexts/LanguageContext'
import styles from './TranslateButton.module.css'

interface TranslateButtonProps {
    text: string
    targetLang?: string
}

export default function TranslateButton({ text, targetLang }: TranslateButtonProps) {
    const { language: globalLang, setLanguage } = useLanguage()

    // Use prop if provided, otherwise fallback to global context
    // If global is 'en', we assume the user reads English and might not need translation 
    // UNLESS the post is detected as non-English (which we can't easily specificy here yet).
    // For now, if global is 'en', we default to 'en' (which effectively does nothing if post is en, 
    // or translates foreign to en).
    const effectiveTargetLang = targetLang || globalLang

    const [translatedText, setTranslatedText] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(false)

    // React to language changes if translation is active
    useEffect(() => {
        if (translatedText && effectiveTargetLang) {
            // Re-translate immediately
            handleTranslate(true)
        }
    }, [effectiveTargetLang])

    const handleTranslate = async (forceRewrite = false) => {
        // Toggle off if already translated and not forced
        if (translatedText && !forceRewrite) {
            setTranslatedText(null)
            return
        }

        setIsLoading(true)
        setError(false)

        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${effectiveTargetLang}&dt=t&q=${encodeURIComponent(text)}`)

            if (!res.ok) throw new Error('Translation failed')

            const data = await res.json()
            const result = data[0].map((item: any) => item[0]).join('')
            setTranslatedText(result)

        } catch (e) {
            console.error('Translation error', e)
            setError(true)
            window.open(`https://translate.google.com/?sl=auto&tl=${effectiveTargetLang}&text=${encodeURIComponent(text)}`, '_blank')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <button
                className={`btn-ghost ${styles.button} ${translatedText ? styles.active : ''}`}
                onClick={() => handleTranslate(false)}
                title={translatedText ? "Show Original" : `Translate to ${effectiveTargetLang}`}
            >
                {isLoading ? (
                    <Loader2 size={14} className="spin" />
                ) : (
                    <Languages size={14} />
                )}
                <span className={styles.label}>
                    {translatedText ? 'Original' : (effectiveTargetLang === 'ja' ? '🇯🇵' : effectiveTargetLang.toUpperCase())}
                </span>
            </button>

            {/* In-place Translation Result */}
            {translatedText && (
                <div className={`surface ${styles.translationBox}`} lang={targetLang}>
                    <p className={styles.translatedText}>
                        {translatedText}
                    </p>
                    <div className={styles.attribution}>
                        Translated by Google
                    </div>
                </div>
            )}
            {/* Fallback Language Selector if Header is hidden */}
            <select
                value={effectiveTargetLang}
                onChange={(e) => setLanguage(e.target.value as any)}
                className={styles.miniSelect}
                aria-label="Change Language"
            >
                <option value="en">EN</option>
                <option value="ja">JP (Japanese)</option>
                <option value="hi">HI (Hindi)</option>
                <option value="es">ES (Spanish)</option>
                <option value="fr">FR (French)</option>
                <option value="de">DE (German)</option>
                <option value="zh">ZH (Chinese)</option>
                <option value="ru">RU (Russian)</option>
                <option value="pt">PT (Portuguese)</option>
                <option value="ar">AR (Arabic)</option>
                <option value="ko">KO (Korean)</option>
            </select>
        </div>
    )
}
