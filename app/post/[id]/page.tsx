import { createClient } from '@/app/lib/supabase/client'
import { Metadata, ResolvingMetadata } from 'next'
import PostCard from '@/app/components/post/PostCard'
import { getTopicById } from '@/app/lib/constants/topics'
import { notFound } from 'next/navigation'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

interface Props {
    params: { id: string }
}

// 1. Generate Metadata for Social Sharing (The Ghost Strategy Key)
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id

    // Create a supabase client just for this server-side fetch
    const supabase = createClient()

    const { data: post } = await supabase
        .from('posts')
        .select(`
        content,
        topic_id,
        created_at
    `)
        .eq('id', id)
        .single()

    if (!post) {
        return {
            title: 'The Void',
            description: 'This thought has faded.'
        }
    }

    const topic = getTopicById(post.topic_id)?.name || 'Thought'

    return {
        title: `${topic} | WhatsInYourMind`,
        description: post.content, // Full content as description for "Text-Only" platform
        openGraph: {
            title: `${topic} on WIYM`,
            description: post.content, // This is what shows on X/Twitter
            type: 'article',
            url: `https://whatsinyourmind.com/post/${id}`,
            // For V2: Add dynamic OG image generation here
        },
        twitter: {
            card: 'summary_large_image',
            title: `${topic} | WhatsInYourMind`,
            description: post.content,
        }
    }
}

// 2. The Page Component
export default async function PostPage({ params }: Props) {
    const supabase = createClient()

    // Fetch full post data with author
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
        *,
        author:profiles(username, display_name, is_verified, avatar_url)
    `)
        .eq('id', params.id)
        .single()

    if (error || !post) {
        notFound()
    }

    // Transform for PostCard
    const formattedPost = {
        id: post.id,
        content: post.content,
        topic: post.topic_id,
        tone: post.tone_id,
        resonanceCount: post.resonance_count || 0,
        commentCount: post.comment_count || 0, // We need to fetch this or rely on view
        flagCount: post.flag_count || 0,
        createdAt: post.created_at,
        author: {
            username: post.author.username,
            displayName: post.author.display_name || post.author.username,
            isVerified: post.author.is_verified
        },
        isResonated: false // SSR doesn't know user state, client will hydrate
    }

    // We need to pass currentUser if available, but for public share page we can be anon.
    // Ideally we verify auth on server but for now pass undefined -> Read Only mode.

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '600px', minHeight: '80vh' }}>
            <PostCard post={formattedPost} />

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <a href="/" className="btn btn-primary">
                    Return to the Void
                </a>
            </div>
        </div>
    )
}
