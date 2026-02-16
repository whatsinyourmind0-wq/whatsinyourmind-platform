import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. THE KILL SWITCH CONFIG 💀
// BLOCKED REGIONS: format 'Country-Region' (e.g., 'IN-KA')
const BLOCKED_REGIONS = new Set<string>([
    // 'IN-KA', // Example: Block Karnataka logic
    // 'IN-MH', // Example: Block Maharashtra logic
])

export async function middleware(request: NextRequest) {
    // =========================================================
    // PART A: COMPLIANCE LAYER (The Kill Switch) 🛑
    // =========================================================
    // This runs BEFORE Auth. If you are blocked, you are blocked.
    const { nextUrl, geo } = request
    const country = geo?.country || 'IN' // Default to India dev
    const region = geo?.region || 'UNKNOWN'
    const regionCode = `${country}-${region}`

    if (BLOCKED_REGIONS.has(regionCode)) {
        // Allow access to the block page itself to prevent infinite loop
        if (!nextUrl.pathname.startsWith('/blocked')) {
            return NextResponse.redirect(new URL('/blocked', request.url))
        }
    }

    // =========================================================
    // PART B: AUTHENTICATION LAYER (Supabase) 🔐
    // =========================================================
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes — redirect to sign-in if not authenticated
    // Added '/pulse' to protected routes? No, let pulse be public but maybe read-only? 
    // Let's keep pulse public for now as per "Transparency".
    const protectedPaths = ['/post/new', '/profile', '/auth/setup']
    const isProtected = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        return NextResponse.redirect(url)
    }

    // If signed in and trying to access signin, redirect to feed
    if (user && (request.nextUrl.pathname === '/auth/signin' || request.nextUrl.pathname === '/auth/setup')) {
        // Allow setup if they need it? For now redirect home.
        // Actually, if they are stuck in setup loop, we might need logic.
        // But let's keep it simple: if authorized, go home.
        if (request.nextUrl.pathname === '/auth/signin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes, though sometimes we want auth checks there)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
