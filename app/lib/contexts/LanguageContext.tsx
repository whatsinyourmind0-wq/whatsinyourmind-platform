'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ja' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ru' | 'pt' | 'ar' | 'ko'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string // Future-proofing for UI translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to 'en' (English) or detecting browser could be added here
    const [language, setLanguage] = useState<Language>('en')

    useEffect(() => {
        // 1. Check LocalStorage (Manual Override)
        const saved = localStorage.getItem('wiym-lang') as Language
        if (saved) {
            setLanguage(saved)
            return
        }

        // 2. Auto-Detect System Language (Smart Localization) 🧠
        // Only if no manual override exists
        if (typeof window !== 'undefined' && navigator.language) {
            const sysLang = navigator.language.split('-')[0] // 'ja-JP' -> 'ja'
            const supported: Language[] = ['en', 'ja', 'hi', 'es', 'fr', 'de', 'zh', 'ru', 'pt', 'ar', 'ko']

            if (supported.includes(sysLang as Language)) {
                setLanguage(sysLang as Language)
            }
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('wiym-lang', lang)
    }

    // Placeholder for UI strings if we ever translate the "app" itself (Header, Footer etc)
    const t = (key: string) => key

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
