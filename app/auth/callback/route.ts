import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * OAuth Callback Handler
 * Exchanges the auth code for a session, then redirects:
 * - If profile exists → / (feed)
 * - If no profile → /auth/setup (first-time)
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if user has a profile
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    // First-time user → setup page
                    return NextResponse.redirect(`${origin}/auth/setup`)
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Error fallback
    return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}
